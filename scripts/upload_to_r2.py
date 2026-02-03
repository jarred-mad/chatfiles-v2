#!/usr/bin/env python3
"""
Cloudflare R2 Upload Script for ChatFiles.org
Uploads processed files to R2 storage.

Usage:
    python upload_to_r2.py --input ~/epstein_processed/ --bucket chatfiles-archive --workers 16
"""

import argparse
import json
import os
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import hashlib

try:
    import boto3
    from botocore.config import Config
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Install with: pip install boto3 tqdm")
    sys.exit(1)


def get_r2_client():
    """Create Cloudflare R2 client using S3-compatible API."""
    account_id = os.environ.get("R2_ACCOUNT_ID")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")

    if not all([account_id, access_key, secret_key]):
        print("Error: Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY")
        sys.exit(1)

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

    client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 3}
        )
    )

    return client


def file_exists_in_r2(client, bucket: str, key: str) -> bool:
    """Check if file already exists in R2."""
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except:
        return False


def upload_file(args: tuple) -> dict:
    """Upload a single file to R2."""
    client, bucket, local_path, r2_key, skip_existing = args

    result = {
        "local_path": str(local_path),
        "r2_key": r2_key,
        "status": "pending",
        "size": 0,
        "error": None
    }

    try:
        local_path = Path(local_path)
        result["size"] = local_path.stat().st_size

        # Skip if already exists
        if skip_existing and file_exists_in_r2(client, bucket, r2_key):
            result["status"] = "skipped"
            return result

        # Determine content type
        ext = local_path.suffix.lower()
        content_types = {
            ".pdf": "application/pdf",
            ".txt": "text/plain",
            ".json": "application/json",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".mp4": "video/mp4",
            ".avi": "video/x-msvideo",
        }
        content_type = content_types.get(ext, "application/octet-stream")

        # Upload
        with open(local_path, "rb") as f:
            client.put_object(
                Bucket=bucket,
                Key=r2_key,
                Body=f,
                ContentType=content_type
            )

        result["status"] = "uploaded"

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def collect_files(input_dir: Path) -> list[tuple]:
    """Collect all files to upload with their R2 keys."""
    files = []

    # PDFs: /documents/DataSet_{N}/{filename}.pdf
    for pdf in input_dir.rglob("*.pdf"):
        # Determine dataset from path
        dataset = "unknown"
        for part in pdf.parts:
            if "DataSet" in part or "dataset" in part.lower():
                dataset = part.replace(" ", "_")
                break

        r2_key = f"documents/{dataset}/{pdf.name}"
        files.append((str(pdf), r2_key))

    # Text files: /text/DataSet_{N}/{filename}.txt
    for txt in input_dir.rglob("*.txt"):
        if txt.name.startswith("_"):  # Skip internal files
            continue

        dataset = "unknown"
        for part in txt.parts:
            if "DataSet" in part or "dataset" in part.lower():
                dataset = part.replace(" ", "_")
                break

        r2_key = f"text/{dataset}/{txt.name}"
        files.append((str(txt), r2_key))

    # Images: /images/DataSet_{N}/{document_id}_page{N}_img{M}.png
    for img in input_dir.rglob("*.png"):
        dataset = "unknown"
        for part in img.parts:
            if "DataSet" in part or "dataset" in part.lower():
                dataset = part.replace(" ", "_")
                break

        r2_key = f"images/{dataset}/{img.name}"
        files.append((str(img), r2_key))

    for img in input_dir.rglob("*.jpg"):
        dataset = "unknown"
        for part in img.parts:
            if "DataSet" in part or "dataset" in part.lower():
                dataset = part.replace(" ", "_")
                break

        r2_key = f"images/{dataset}/{img.name}"
        files.append((str(img), r2_key))

    # Face crops: /faces/crops/{face_id}.jpg
    for face in input_dir.rglob("face_crops/*.jpg"):
        r2_key = f"faces/crops/{face.name}"
        files.append((str(face), r2_key))

    return files


def main():
    parser = argparse.ArgumentParser(description="Upload files to Cloudflare R2")
    parser.add_argument("--input", "-i", required=True, help="Input directory with processed files")
    parser.add_argument("--bucket", "-b", required=True, help="R2 bucket name")
    parser.add_argument("--workers", "-w", type=int, default=16, help="Number of parallel upload workers")
    parser.add_argument("--skip-existing", action="store_true", default=True, help="Skip already uploaded files")
    parser.add_argument("--dry-run", action="store_true", help="List files without uploading")
    args = parser.parse_args()

    input_dir = Path(args.input)

    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    # Collect files
    print(f"Scanning {input_dir} for files...")
    files = collect_files(input_dir)
    print(f"Found {len(files)} files to upload")

    if not files:
        print("No files found!")
        sys.exit(1)

    if args.dry_run:
        print("\nDry run - files that would be uploaded:")
        for local, r2_key in files[:20]:
            print(f"  {local} -> {r2_key}")
        if len(files) > 20:
            print(f"  ... and {len(files) - 20} more")
        return

    # Get R2 client
    client = get_r2_client()

    # Verify bucket exists
    try:
        client.head_bucket(Bucket=args.bucket)
        print(f"Connected to bucket: {args.bucket}")
    except Exception as e:
        print(f"Error accessing bucket {args.bucket}: {e}")
        sys.exit(1)

    # Prepare upload tasks
    upload_args = [
        (client, args.bucket, local, r2_key, args.skip_existing)
        for local, r2_key in files
    ]

    # Upload with progress
    uploaded = 0
    skipped = 0
    errors = 0
    total_bytes = 0

    manifest = []

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(upload_file, arg): arg for arg in upload_args}

        with tqdm(total=len(futures), desc="Uploading files") as pbar:
            for future in as_completed(futures):
                try:
                    result = future.result()
                    if result["status"] == "uploaded":
                        uploaded += 1
                        total_bytes += result["size"]
                    elif result["status"] == "skipped":
                        skipped += 1
                    else:
                        errors += 1

                    manifest.append(result)

                except Exception as e:
                    errors += 1

                pbar.update(1)
                pbar.set_postfix({
                    "uploaded": uploaded,
                    "skipped": skipped,
                    "errors": errors,
                    "MB": f"{total_bytes / 1024 / 1024:.1f}"
                })

    # Save manifest
    manifest_path = input_dir / "r2_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump({
            "bucket": args.bucket,
            "uploaded_at": datetime.now().isoformat(),
            "total_files": len(files),
            "uploaded": uploaded,
            "skipped": skipped,
            "errors": errors,
            "total_bytes": total_bytes,
            "files": manifest
        }, f, indent=2)

    # Print summary
    print("\n" + "=" * 50)
    print("UPLOAD COMPLETE")
    print("=" * 50)
    print(f"Files uploaded: {uploaded}")
    print(f"Files skipped: {skipped}")
    print(f"Errors: {errors}")
    print(f"Total size: {total_bytes / 1024 / 1024:.2f} MB")
    print(f"Manifest saved: {manifest_path}")
    print("=" * 50)


if __name__ == "__main__":
    main()
