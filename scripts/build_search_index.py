#!/usr/bin/env python3
"""
Search Index Builder for ChatFiles.org
Indexes processed documents into Meilisearch with NER-extracted names.

Usage:
    python build_search_index.py --input ~/epstein_processed/ --meilisearch-url http://localhost:7700 --api-key masterKey
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    import meilisearch
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Install with: pip install meilisearch tqdm")
    sys.exit(1)

# spaCy for NER (optional)
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except (ImportError, OSError):
    SPACY_AVAILABLE = False
    print("Warning: spaCy not available. Install with: pip install spacy && python -m spacy download en_core_web_sm")


BATCH_SIZE = 1000
INDEX_NAME = "documents"


def extract_names(text: str, max_names: int = 50) -> list[str]:
    """Extract person names from text using spaCy NER."""
    if not SPACY_AVAILABLE or not text:
        return []

    try:
        # Limit text length for performance
        doc = nlp(text[:100000])
        names = set()

        for ent in doc.ents:
            if ent.label_ == "PERSON":
                name = ent.text.strip()
                # Filter out single words and very long names
                if 2 <= len(name.split()) <= 5 and len(name) < 100:
                    names.add(name)

        return list(names)[:max_names]
    except Exception:
        return []


def classify_document_type(filename: str, text: str) -> str:
    """Classify document type based on filename and content."""
    filename_lower = filename.lower()
    text_lower = (text or "")[:5000].lower()

    if "302" in filename or "fbi" in filename_lower or "federal bureau" in text_lower:
        return "fbi_report"
    elif "deposition" in filename_lower or "deposition" in text_lower:
        return "transcript"
    elif "email" in filename_lower or "from:" in text_lower and "to:" in text_lower:
        return "email"
    elif "court" in filename_lower or "plaintiff" in text_lower or "defendant" in text_lower:
        return "court_doc"
    elif any(ext in filename_lower for ext in [".jpg", ".png", ".gif", ".bmp"]):
        return "photo"
    elif any(ext in filename_lower for ext in [".mp4", ".avi", ".mov", ".wmv"]):
        return "video"
    else:
        return "other"


def load_processed_documents(input_dir: Path) -> list[dict]:
    """Load all processed documents from metadata JSONs and text files."""
    documents = []

    # Find all metadata files
    metadata_dir = input_dir / "metadata"
    text_dir = input_dir / "text"

    if not metadata_dir.exists():
        # Try to find metadata in subdirectories (per dataset)
        for subdir in input_dir.iterdir():
            if subdir.is_dir():
                sub_meta = subdir / "metadata"
                sub_text = subdir / "text"
                if sub_meta.exists():
                    docs = load_from_dirs(sub_meta, sub_text, subdir.name)
                    documents.extend(docs)
    else:
        docs = load_from_dirs(metadata_dir, text_dir, "")
        documents.extend(docs)

    return documents


def load_from_dirs(metadata_dir: Path, text_dir: Path, dataset_prefix: str) -> list[dict]:
    """Load documents from a specific metadata/text directory pair."""
    documents = []

    for meta_file in metadata_dir.glob("*.json"):
        try:
            with open(meta_file, "r") as f:
                meta = json.load(f)

            # Skip image metadata files
            if "_images" in meta_file.name:
                continue

            # Load corresponding text file
            text_file = text_dir / f"{meta_file.stem}.txt"
            text_content = ""
            if text_file.exists():
                with open(text_file, "r", encoding="utf-8", errors="ignore") as f:
                    text_content = f.read()

            # Parse dataset number from filename or prefix
            dataset_num = 0
            if dataset_prefix:
                try:
                    dataset_num = int("".join(filter(str.isdigit, dataset_prefix)))
                except:
                    pass

            # Extract names
            mentioned_names = extract_names(text_content)

            # Classify document type
            doc_type = classify_document_type(meta.get("filename", ""), text_content)

            doc = {
                "id": meta_file.stem,
                "filename": meta.get("filename", meta_file.stem),
                "dataset_number": dataset_num,
                "document_type": doc_type,
                "text_content": text_content,
                "mentioned_names": mentioned_names,
                "page_count": meta.get("page_count", 0),
                "file_size": meta.get("file_size", 0),
                "ocr_confidence": meta.get("ocr_confidence", 0),
                "text_length": len(text_content),
                "processed_at": meta.get("processed_at", datetime.now().isoformat())
            }

            documents.append(doc)

        except Exception as e:
            print(f"Error loading {meta_file}: {e}")

    return documents


def setup_meilisearch_index(client: meilisearch.Client):
    """Configure the Meilisearch index settings."""
    try:
        # Delete existing index if present
        try:
            client.delete_index(INDEX_NAME)
            print(f"Deleted existing index: {INDEX_NAME}")
        except:
            pass

        # Create new index
        client.create_index(INDEX_NAME, {"primaryKey": "id"})
        print(f"Created index: {INDEX_NAME}")

        index = client.index(INDEX_NAME)

        # Configure searchable attributes
        index.update_searchable_attributes([
            "text_content",
            "filename",
            "mentioned_names"
        ])

        # Configure filterable attributes
        index.update_filterable_attributes([
            "dataset_number",
            "document_type",
            "mentioned_names"
        ])

        # Configure sortable attributes
        index.update_sortable_attributes([
            "dataset_number",
            "filename",
            "ocr_confidence",
            "page_count"
        ])

        # Configure ranking rules
        index.update_ranking_rules([
            "words",
            "typo",
            "proximity",
            "attribute",
            "sort",
            "exactness"
        ])

        print("Index settings configured")
        return index

    except Exception as e:
        print(f"Error setting up index: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Build Meilisearch index from processed documents")
    parser.add_argument("--input", "-i", required=True, help="Input directory with processed files")
    parser.add_argument("--meilisearch-url", default="http://localhost:7700", help="Meilisearch URL")
    parser.add_argument("--api-key", required=True, help="Meilisearch API key")
    parser.add_argument("--resume", action="store_true", help="Skip already indexed documents")
    args = parser.parse_args()

    input_dir = Path(args.input)

    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    # Connect to Meilisearch
    print(f"Connecting to Meilisearch at {args.meilisearch_url}")
    client = meilisearch.Client(args.meilisearch_url, args.api_key)

    try:
        health = client.health()
        print(f"Meilisearch status: {health}")
    except Exception as e:
        print(f"Failed to connect to Meilisearch: {e}")
        sys.exit(1)

    # Setup index
    index = setup_meilisearch_index(client)

    # Load documents
    print(f"Loading documents from {input_dir}")
    documents = load_processed_documents(input_dir)
    print(f"Loaded {len(documents)} documents")

    if not documents:
        print("No documents found!")
        sys.exit(1)

    # Index in batches
    total_indexed = 0
    errors = 0

    with tqdm(total=len(documents), desc="Indexing documents") as pbar:
        for i in range(0, len(documents), BATCH_SIZE):
            batch = documents[i:i + BATCH_SIZE]

            try:
                task = index.add_documents(batch)
                # Wait for task to complete
                client.wait_for_task(task.task_uid, timeout_in_ms=60000)
                total_indexed += len(batch)
            except Exception as e:
                print(f"Error indexing batch: {e}")
                errors += 1

            pbar.update(len(batch))
            pbar.set_postfix({"indexed": total_indexed, "errors": errors})

    # Print summary
    print("\n" + "=" * 50)
    print("INDEXING COMPLETE")
    print("=" * 50)
    print(f"Documents indexed: {total_indexed}")
    print(f"Batch errors: {errors}")
    stats = index.get_stats()
    print(f"Index stats: {stats}")
    print("=" * 50)


if __name__ == "__main__":
    main()
