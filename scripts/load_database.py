#!/usr/bin/env python3
"""
Database Loader for ChatFiles.org
Loads processed metadata into PostgreSQL from the processing pipeline.

Usage:
    python load_database.py --input ~/epstein_processed/ --faces ~/epstein_faces/
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime
import re

try:
    import psycopg2
    from psycopg2.extras import execute_values
    import numpy as np
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Install with: pip install psycopg2-binary numpy tqdm")
    sys.exit(1)


BATCH_SIZE = 1000


def get_database_connection():
    """Create PostgreSQL connection from environment variables."""
    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url)

    # Fallback to individual env vars
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "localhost"),
        port=os.environ.get("PGPORT", "5432"),
        database=os.environ.get("PGDATABASE", "chatfiles"),
        user=os.environ.get("PGUSER", "postgres"),
        password=os.environ.get("PGPASSWORD", "")
    )


def extract_dataset_number(path: Path) -> int:
    """Extract dataset number from path."""
    path_str = str(path)

    # Look for patterns like DataSet_10, DataSet 10, dataset10, etc.
    patterns = [
        r'[Dd]ata[Ss]et[_\s]?(\d+)',
        r'DS(\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, path_str)
        if match:
            return int(match.group(1))

    return 0


def classify_document_type(filename: str, text: str = "") -> str:
    """Classify document type based on filename and content."""
    filename_lower = filename.lower()
    text_lower = (text or "")[:5000].lower()

    if "302" in filename or "fbi" in filename_lower or "federal bureau" in text_lower:
        return "fbi_report"
    elif "deposition" in filename_lower or "deposition" in text_lower:
        return "transcript"
    elif "email" in filename_lower or ("from:" in text_lower and "to:" in text_lower):
        return "email"
    elif "court" in filename_lower or "plaintiff" in text_lower or "defendant" in text_lower:
        return "court_doc"
    elif any(ext in filename_lower for ext in [".jpg", ".png", ".gif", ".bmp"]):
        return "photo"
    elif any(ext in filename_lower for ext in [".mp4", ".avi", ".mov", ".wmv"]):
        return "video"
    else:
        return "other"


def load_documents(conn, input_dir: Path) -> dict:
    """Load documents from OCR metadata JSONs."""
    cur = conn.cursor()

    # Find all metadata JSON files (not image metadata)
    metadata_files = []
    for meta_file in input_dir.rglob("*.json"):
        if "_images" not in meta_file.name and "manifest" not in meta_file.name:
            if "metadata" in str(meta_file):
                metadata_files.append(meta_file)

    print(f"Found {len(metadata_files)} document metadata files")

    documents = []
    doc_id_map = {}  # filename -> database id

    for meta_file in tqdm(metadata_files, desc="Loading documents"):
        try:
            with open(meta_file, "r") as f:
                meta = json.load(f)

            filename = meta.get("filename", meta_file.stem)
            dataset_num = extract_dataset_number(meta_file)

            # Load text content if available
            text_content = ""
            text_file = meta_file.parent.parent / "text" / f"{meta_file.stem}.txt"
            if text_file.exists():
                with open(text_file, "r", encoding="utf-8", errors="ignore") as f:
                    text_content = f.read()

            doc_type = classify_document_type(filename, text_content)

            documents.append((
                dataset_num,
                filename,
                meta.get("input_path"),  # original_url (store local path for now)
                meta.get("output_pdf"),  # file_path_r2 (will be updated after R2 upload)
                text_content,
                meta.get("ocr_confidence", 0),
                meta.get("page_count", 0),
                meta.get("file_size", 0),
                doc_type
            ))

        except Exception as e:
            print(f"Error loading {meta_file}: {e}")

    if not documents:
        return doc_id_map

    # Batch insert
    insert_sql = """
        INSERT INTO documents
        (dataset_number, filename, original_url, file_path_r2, text_content,
         ocr_confidence, page_count, file_size_bytes, document_type)
        VALUES %s
        ON CONFLICT (dataset_number, filename) DO UPDATE SET
            text_content = EXCLUDED.text_content,
            ocr_confidence = EXCLUDED.ocr_confidence,
            page_count = EXCLUDED.page_count,
            file_size_bytes = EXCLUDED.file_size_bytes,
            document_type = EXCLUDED.document_type
        RETURNING id, filename
    """

    for i in range(0, len(documents), BATCH_SIZE):
        batch = documents[i:i + BATCH_SIZE]
        try:
            result = execute_values(cur, insert_sql, batch, fetch=True)
            for row in result:
                doc_id_map[row[1]] = row[0]
            conn.commit()
        except Exception as e:
            print(f"Error inserting document batch: {e}")
            conn.rollback()

    # Get all document IDs for reference
    cur.execute("SELECT id, filename FROM documents")
    for row in cur.fetchall():
        doc_id_map[row[1]] = row[0]

    print(f"Loaded {len(doc_id_map)} documents")
    return doc_id_map


def load_extracted_images(conn, input_dir: Path, doc_id_map: dict) -> dict:
    """Load extracted images from image metadata JSONs."""
    cur = conn.cursor()

    # Find all image metadata files
    image_meta_files = list(input_dir.rglob("*_images.json"))
    print(f"Found {len(image_meta_files)} image metadata files")

    images = []
    image_id_map = {}  # image_filename -> database id

    for meta_file in tqdm(image_meta_files, desc="Loading images"):
        try:
            with open(meta_file, "r") as f:
                meta = json.load(f)

            source_filename = meta.get("filename", "")
            doc_id = doc_id_map.get(source_filename)

            if not doc_id:
                # Try to find by stem
                for key, val in doc_id_map.items():
                    if meta_file.stem.replace("_images", "") in key:
                        doc_id = val
                        break

            for img in meta.get("images", []):
                images.append((
                    doc_id,
                    img.get("page_number", 0),
                    img.get("path"),  # image_path_r2 (will be updated after R2 upload)
                    img.get("width", 0),
                    img.get("height", 0),
                    False,  # has_faces (will be updated after face detection)
                    img.get("filename", "")  # for mapping
                ))

        except Exception as e:
            print(f"Error loading {meta_file}: {e}")

    if not images:
        return image_id_map

    # Batch insert
    insert_sql = """
        INSERT INTO extracted_images
        (document_id, page_number, image_path_r2, width, height, has_faces)
        VALUES %s
        ON CONFLICT DO NOTHING
        RETURNING id
    """

    idx = 0
    for i in range(0, len(images), BATCH_SIZE):
        batch = [(img[0], img[1], img[2], img[3], img[4], img[5]) for img in images[i:i + BATCH_SIZE]]
        batch_filenames = [img[6] for img in images[i:i + BATCH_SIZE]]
        try:
            result = execute_values(cur, insert_sql, batch, fetch=True)
            for j, row in enumerate(result):
                if j < len(batch_filenames):
                    image_id_map[batch_filenames[j]] = row[0]
            conn.commit()
        except Exception as e:
            print(f"Error inserting image batch: {e}")
            conn.rollback()

    # Get all image IDs
    cur.execute("SELECT id, image_path_r2 FROM extracted_images WHERE image_path_r2 IS NOT NULL")
    for row in cur.fetchall():
        if row[1]:
            filename = Path(row[1]).name
            image_id_map[filename] = row[0]

    print(f"Loaded {len(image_id_map)} extracted images")
    return image_id_map


def load_face_clusters(conn, faces_dir: Path) -> dict:
    """Load face clusters from clusters.json."""
    cur = conn.cursor()

    clusters_file = faces_dir / "clusters.json"
    if not clusters_file.exists():
        print(f"No clusters.json found at {clusters_file}")
        return {}

    with open(clusters_file, "r") as f:
        data = json.load(f)

    clusters = data.get("clusters", [])
    print(f"Found {len(clusters)} face clusters")

    cluster_id_map = {}  # original_cluster_id -> database id

    cluster_rows = []
    for cluster in clusters:
        cluster_rows.append((
            cluster.get("label"),
            cluster.get("sample_face"),
            cluster.get("face_count", 0),
            cluster.get("is_known_person", False),
            cluster.get("cluster_id", "")
        ))

    if not cluster_rows:
        return cluster_id_map

    # Insert clusters
    insert_sql = """
        INSERT INTO face_clusters (label, sample_image_path, face_count, is_known_person)
        VALUES %s
        RETURNING id
    """

    try:
        values = [(r[0], r[1], r[2], r[3]) for r in cluster_rows]
        result = execute_values(cur, insert_sql, values, fetch=True)
        for i, row in enumerate(result):
            cluster_id_map[cluster_rows[i][4]] = row[0]
        conn.commit()
    except Exception as e:
        print(f"Error inserting clusters: {e}")
        conn.rollback()

    print(f"Loaded {len(cluster_id_map)} face clusters")
    return cluster_id_map


def load_faces(conn, faces_dir: Path, image_id_map: dict, doc_id_map: dict, cluster_id_map: dict):
    """Load faces from faces.json with embeddings."""
    cur = conn.cursor()

    faces_file = faces_dir / "faces.json"
    embeddings_file = faces_dir / "embeddings.npy"

    if not faces_file.exists():
        print(f"No faces.json found at {faces_file}")
        return

    with open(faces_file, "r") as f:
        data = json.load(f)

    faces = data.get("faces", [])
    print(f"Found {len(faces)} faces")

    # Load embeddings
    embeddings = None
    if embeddings_file.exists():
        embeddings = np.load(embeddings_file)
        print(f"Loaded {len(embeddings)} embeddings")

    # Load clusters.json to get face-to-cluster mapping
    face_to_cluster = {}
    clusters_file = faces_dir / "clusters.json"
    if clusters_file.exists():
        with open(clusters_file, "r") as f:
            cluster_data = json.load(f)
        for cluster in cluster_data.get("clusters", []):
            cluster_id = cluster.get("cluster_id", "")
            db_cluster_id = cluster_id_map.get(cluster_id)
            for face_id in cluster.get("face_ids", []):
                face_to_cluster[face_id] = db_cluster_id

    face_rows = []
    for face in faces:
        face_id = face.get("face_id", "")
        source_image = Path(face.get("source_image", "")).name

        # Find image_id
        image_id = image_id_map.get(source_image)

        # Find document_id from source path
        doc_id = None
        source_path = face.get("source_image", "")
        for filename, did in doc_id_map.items():
            if filename in source_path:
                doc_id = did
                break

        bbox = face.get("bbox", {})
        embedding_idx = face.get("embedding_idx")

        # Get embedding as list for pgvector
        embedding_list = None
        if embeddings is not None and embedding_idx is not None and embedding_idx < len(embeddings):
            embedding_list = embeddings[embedding_idx].tolist()

        cluster_id = face_to_cluster.get(face_id)

        face_rows.append((
            image_id,
            doc_id,
            json.dumps(bbox),
            embedding_list,
            cluster_id,
            face.get("confidence", 0),
            face.get("crop_path")
        ))

    if not face_rows:
        return

    # Insert faces in batches
    # Note: pgvector expects the embedding as a string representation
    for i in tqdm(range(0, len(face_rows), BATCH_SIZE), desc="Loading faces"):
        batch = face_rows[i:i + BATCH_SIZE]

        for row in batch:
            try:
                embedding_str = None
                if row[3] is not None:
                    embedding_str = "[" + ",".join(str(x) for x in row[3]) + "]"

                cur.execute("""
                    INSERT INTO faces
                    (image_id, document_id, bounding_box, embedding, cluster_id, confidence, face_crop_path)
                    VALUES (%s, %s, %s, %s::vector, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (row[0], row[1], row[2], embedding_str, row[4], row[5], row[6]))
            except Exception as e:
                print(f"Error inserting face: {e}")
                conn.rollback()
                continue

        conn.commit()

    # Update has_faces flag on extracted_images
    cur.execute("""
        UPDATE extracted_images
        SET has_faces = TRUE
        WHERE id IN (SELECT DISTINCT image_id FROM faces WHERE image_id IS NOT NULL)
    """)
    conn.commit()

    print(f"Loaded {len(face_rows)} faces")


def load_mentioned_names(conn, input_dir: Path, doc_id_map: dict):
    """Load mentioned names from NER results."""
    cur = conn.cursor()

    # Look for search index data or NER results
    # These would typically be in the processed metadata or a separate NER output

    name_rows = []

    # Check for any NER data in metadata files
    for meta_file in input_dir.rglob("*.json"):
        if "metadata" not in str(meta_file):
            continue
        if "_images" in meta_file.name:
            continue

        try:
            with open(meta_file, "r") as f:
                meta = json.load(f)

            # Check for mentioned_names field (from search indexer)
            names = meta.get("mentioned_names", [])
            if not names:
                continue

            filename = meta.get("filename", meta_file.stem)
            doc_id = doc_id_map.get(filename)

            if not doc_id:
                continue

            for name in names:
                name_rows.append((
                    doc_id,
                    name,
                    1,  # frequency (could be calculated)
                    None  # context_snippet
                ))

        except Exception:
            continue

    if not name_rows:
        print("No mentioned names found in metadata")
        return

    # Batch insert
    insert_sql = """
        INSERT INTO mentioned_names (document_id, name, frequency, context_snippet)
        VALUES %s
        ON CONFLICT DO NOTHING
    """

    for i in range(0, len(name_rows), BATCH_SIZE):
        batch = name_rows[i:i + BATCH_SIZE]
        try:
            execute_values(cur, insert_sql, batch)
            conn.commit()
        except Exception as e:
            print(f"Error inserting names batch: {e}")
            conn.rollback()

    print(f"Loaded {len(name_rows)} mentioned names")


def update_search_index_status(conn, doc_id_map: dict):
    """Initialize search index status for all documents."""
    cur = conn.cursor()

    rows = [(doc_id, False, None) for doc_id in doc_id_map.values()]

    if not rows:
        return

    insert_sql = """
        INSERT INTO search_index_status (document_id, indexed, indexed_at)
        VALUES %s
        ON CONFLICT (document_id) DO NOTHING
    """

    try:
        execute_values(cur, insert_sql, rows)
        conn.commit()
        print(f"Initialized search index status for {len(rows)} documents")
    except Exception as e:
        print(f"Error updating search index status: {e}")
        conn.rollback()


def main():
    parser = argparse.ArgumentParser(description="Load processed data into PostgreSQL")
    parser.add_argument("--input", "-i", required=True, help="Input directory with processed files")
    parser.add_argument("--faces", "-f", help="Directory with face detection results")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be loaded without inserting")
    args = parser.parse_args()

    input_dir = Path(args.input)
    faces_dir = Path(args.faces) if args.faces else None

    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    if args.dry_run:
        print("DRY RUN - No data will be inserted")

        # Count files
        doc_files = list(input_dir.rglob("metadata/*.json"))
        doc_files = [f for f in doc_files if "_images" not in f.name]
        print(f"Document metadata files: {len(doc_files)}")

        img_files = list(input_dir.rglob("*_images.json"))
        print(f"Image metadata files: {len(img_files)}")

        if faces_dir and faces_dir.exists():
            if (faces_dir / "clusters.json").exists():
                with open(faces_dir / "clusters.json") as f:
                    data = json.load(f)
                print(f"Face clusters: {len(data.get('clusters', []))}")
            if (faces_dir / "faces.json").exists():
                with open(faces_dir / "faces.json") as f:
                    data = json.load(f)
                print(f"Faces: {len(data.get('faces', []))}")
        return

    # Connect to database
    print("Connecting to PostgreSQL...")
    try:
        conn = get_database_connection()
        print("Connected successfully")
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        sys.exit(1)

    try:
        # Load documents first (needed for foreign keys)
        print("\n" + "=" * 50)
        print("LOADING DOCUMENTS")
        print("=" * 50)
        doc_id_map = load_documents(conn, input_dir)

        # Load extracted images
        print("\n" + "=" * 50)
        print("LOADING EXTRACTED IMAGES")
        print("=" * 50)
        image_id_map = load_extracted_images(conn, input_dir, doc_id_map)

        # Load face data if provided
        cluster_id_map = {}
        if faces_dir and faces_dir.exists():
            print("\n" + "=" * 50)
            print("LOADING FACE CLUSTERS")
            print("=" * 50)
            cluster_id_map = load_face_clusters(conn, faces_dir)

            print("\n" + "=" * 50)
            print("LOADING FACES")
            print("=" * 50)
            load_faces(conn, faces_dir, image_id_map, doc_id_map, cluster_id_map)

        # Load mentioned names
        print("\n" + "=" * 50)
        print("LOADING MENTIONED NAMES")
        print("=" * 50)
        load_mentioned_names(conn, input_dir, doc_id_map)

        # Initialize search index status
        print("\n" + "=" * 50)
        print("UPDATING SEARCH INDEX STATUS")
        print("=" * 50)
        update_search_index_status(conn, doc_id_map)

        # Print summary
        cur = conn.cursor()

        print("\n" + "=" * 50)
        print("DATABASE LOAD COMPLETE")
        print("=" * 50)

        cur.execute("SELECT COUNT(*) FROM documents")
        print(f"Total documents: {cur.fetchone()[0]}")

        cur.execute("SELECT COUNT(*) FROM extracted_images")
        print(f"Total extracted images: {cur.fetchone()[0]}")

        cur.execute("SELECT COUNT(*) FROM face_clusters")
        print(f"Total face clusters: {cur.fetchone()[0]}")

        cur.execute("SELECT COUNT(*) FROM faces")
        print(f"Total faces: {cur.fetchone()[0]}")

        cur.execute("SELECT COUNT(*) FROM mentioned_names")
        print(f"Total mentioned names: {cur.fetchone()[0]}")

        print("=" * 50)

    except Exception as e:
        print(f"Error during database load: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
