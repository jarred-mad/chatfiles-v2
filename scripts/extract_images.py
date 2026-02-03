#!/usr/bin/env python3
"""
Image Extraction Pipeline for ChatFiles.org
Extracts all embedded images from PDFs.

Usage:
    python extract_images.py --input ~/epstein_files/DataSet_10 --output ~/epstein_images/DataSet_10 --workers 8
"""

import argparse
import json
import os
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
import hashlib

try:
    import fitz  # PyMuPDF
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Install with: pip install pymupdf tqdm")
    sys.exit(1)


MIN_IMAGE_SIZE = 50  # Minimum dimension in pixels (skip icons/artifacts)
MIN_FILE_SIZE = 1024  # Minimum file size in bytes (1KB)


def extract_images_from_pdf(args: tuple) -> dict:
    """Extract all images from a single PDF."""
    pdf_path, output_dir, document_id = args
    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)

    result = {
        "document_id": document_id,
        "filename": pdf_path.name,
        "images_extracted": 0,
        "images_skipped": 0,
        "status": "success",
        "error": None,
        "images": []
    }

    try:
        doc = fitz.open(str(pdf_path))

        for page_num, page in enumerate(doc, start=1):
            image_list = page.get_images(full=True)

            for img_idx, img_info in enumerate(image_list):
                xref = img_info[0]

                try:
                    # Extract image
                    base_image = doc.extract_image(xref)
                    if not base_image:
                        continue

                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    width = base_image.get("width", 0)
                    height = base_image.get("height", 0)

                    # Skip small images (icons, artifacts)
                    if width < MIN_IMAGE_SIZE or height < MIN_IMAGE_SIZE:
                        result["images_skipped"] += 1
                        continue

                    if len(image_bytes) < MIN_FILE_SIZE:
                        result["images_skipped"] += 1
                        continue

                    # Generate unique filename
                    img_hash = hashlib.md5(image_bytes).hexdigest()[:8]
                    img_filename = f"{document_id}_page{page_num}_img{img_idx}_{img_hash}.{image_ext}"

                    # Save image
                    img_output_dir = output_dir / "images" / document_id
                    img_output_dir.mkdir(parents=True, exist_ok=True)
                    img_path = img_output_dir / img_filename

                    with open(img_path, "wb") as f:
                        f.write(image_bytes)

                    # Record metadata
                    img_meta = {
                        "filename": img_filename,
                        "source_document": pdf_path.name,
                        "document_id": document_id,
                        "page_number": page_num,
                        "image_index": img_idx,
                        "width": width,
                        "height": height,
                        "file_size": len(image_bytes),
                        "format": image_ext,
                        "path": str(img_path)
                    }

                    result["images"].append(img_meta)
                    result["images_extracted"] += 1

                except Exception as e:
                    result["images_skipped"] += 1
                    continue

        doc.close()

        # Save metadata JSON for this document
        if result["images"]:
            meta_dir = output_dir / "metadata"
            meta_dir.mkdir(parents=True, exist_ok=True)
            meta_path = meta_dir / f"{document_id}_images.json"

            with open(meta_path, "w") as f:
                json.dump({
                    "document_id": document_id,
                    "filename": pdf_path.name,
                    "extracted_at": datetime.now().isoformat(),
                    "total_images": result["images_extracted"],
                    "skipped_artifacts": result["images_skipped"],
                    "images": result["images"]
                }, f, indent=2)

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def main():
    parser = argparse.ArgumentParser(description="Extract images from PDFs")
    parser.add_argument("--input", "-i", required=True, help="Input directory with PDFs")
    parser.add_argument("--output", "-o", required=True, help="Output directory for images")
    parser.add_argument("--workers", "-w", type=int, default=8, help="Number of parallel workers")
    parser.add_argument("--resume", action="store_true", help="Skip already processed files")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)

    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    # Find all PDFs
    pdf_files = sorted(input_dir.rglob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files in {input_dir}")

    if not pdf_files:
        print("No PDF files found!")
        sys.exit(1)

    # Filter already processed if resuming
    if args.resume:
        meta_dir = output_dir / "metadata"
        if meta_dir.exists():
            processed = {f.stem.replace("_images", "") for f in meta_dir.glob("*_images.json")}
            pdf_files = [p for p in pdf_files if p.stem not in processed]
            print(f"Resuming: {len(pdf_files)} files remaining")

    # Generate document IDs (use filename stem)
    process_args = [
        (str(pdf), str(output_dir), pdf.stem)
        for pdf in pdf_files
    ]

    # Process with progress bar
    total_images = 0
    total_skipped = 0
    errors = 0

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(extract_images_from_pdf, arg): arg for arg in process_args}

        with tqdm(total=len(futures), desc="Extracting images") as pbar:
            for future in as_completed(futures):
                try:
                    result = future.result()
                    total_images += result["images_extracted"]
                    total_skipped += result["images_skipped"]
                    if result["status"] == "error":
                        errors += 1
                except Exception as e:
                    errors += 1
                pbar.update(1)
                pbar.set_postfix({
                    "images": total_images,
                    "skipped": total_skipped,
                    "errors": errors
                })

    # Print summary
    print("\n" + "=" * 50)
    print("IMAGE EXTRACTION COMPLETE")
    print("=" * 50)
    print(f"Total images extracted: {total_images}")
    print(f"Artifacts skipped: {total_skipped}")
    print(f"Files with errors: {errors}")
    print(f"Output: {output_dir}")
    print("=" * 50)


if __name__ == "__main__":
    main()
