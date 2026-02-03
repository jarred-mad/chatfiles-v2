#!/usr/bin/env python3
"""
OCR Pipeline for ChatFiles.org
Processes PDFs: adds OCR text layer, extracts text, generates metadata.

Usage:
    python ocr_pipeline.py --input ~/epstein_files/DataSet_10 --output ~/epstein_processed/DataSet_10 --workers 8
"""

import argparse
import json
import os
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
import time

try:
    import fitz  # PyMuPDF
    from tqdm import tqdm
except ImportError:
    print("Missing dependencies. Install with: pip install pymupdf tqdm")
    sys.exit(1)


def has_text_layer(pdf_path: str) -> bool:
    """Check if PDF already has a text layer."""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text = page.get_text().strip()
            if len(text) > 50:  # Has meaningful text
                doc.close()
                return True
        doc.close()
        return False
    except Exception:
        return False


def run_ocrmypdf(input_path: str, output_path: str) -> tuple[bool, str]:
    """Run OCRmyPDF on a file."""
    try:
        result = subprocess.run(
            [
                "ocrmypdf",
                "--skip-text",  # Skip pages that already have text
                "--optimize", "1",
                "--output-type", "pdf",
                "-l", "eng",
                "--jobs", "2",
                input_path,
                output_path
            ],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        if result.returncode == 0:
            return True, ""
        elif result.returncode == 6:  # Already has text
            return True, "already_has_text"
        else:
            return False, result.stderr
    except subprocess.TimeoutExpired:
        return False, "timeout"
    except Exception as e:
        return False, str(e)


def extract_text(pdf_path: str) -> tuple[str, int, float]:
    """Extract text from PDF using PyMuPDF. Returns (text, page_count, confidence)."""
    try:
        doc = fitz.open(pdf_path)
        full_text = []
        total_chars = 0
        total_blocks = 0

        for page in doc:
            text = page.get_text()
            full_text.append(text)
            total_chars += len(text)
            blocks = page.get_text("blocks")
            total_blocks += len(blocks)

        page_count = len(doc)
        doc.close()

        # Simple confidence estimate based on text density
        if page_count > 0:
            chars_per_page = total_chars / page_count
            # Good OCR typically has 500-3000 chars per page
            if chars_per_page > 100:
                confidence = min(1.0, chars_per_page / 2000)
            else:
                confidence = 0.1
        else:
            confidence = 0.0

        return "\n\n".join(full_text), page_count, confidence

    except Exception as e:
        return "", 0, 0.0


def process_pdf(args: tuple) -> dict:
    """Process a single PDF file."""
    input_path, output_dir, skip_ocr = args
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    filename = input_path.name
    base_name = input_path.stem

    result = {
        "filename": filename,
        "status": "pending",
        "error": None,
        "page_count": 0,
        "file_size": input_path.stat().st_size,
        "ocr_confidence": 0.0,
        "text_length": 0,
        "processing_time": 0
    }

    start_time = time.time()

    try:
        # Output paths
        output_pdf = output_dir / "pdfs" / filename
        output_txt = output_dir / "text" / f"{base_name}.txt"
        output_json = output_dir / "metadata" / f"{base_name}.json"

        # Create directories
        output_pdf.parent.mkdir(parents=True, exist_ok=True)
        output_txt.parent.mkdir(parents=True, exist_ok=True)
        output_json.parent.mkdir(parents=True, exist_ok=True)

        # Skip if already processed
        if output_json.exists():
            result["status"] = "skipped"
            return result

        # Check if needs OCR
        needs_ocr = not has_text_layer(str(input_path))

        if needs_ocr and not skip_ocr:
            # Run OCR
            success, error = run_ocrmypdf(str(input_path), str(output_pdf))
            if not success:
                result["status"] = "ocr_failed"
                result["error"] = error
                # Copy original anyway
                import shutil
                shutil.copy2(input_path, output_pdf)
        else:
            # Copy original PDF
            import shutil
            shutil.copy2(input_path, output_pdf)

        # Extract text from the output PDF
        text, page_count, confidence = extract_text(str(output_pdf))

        # Save text file
        with open(output_txt, "w", encoding="utf-8") as f:
            f.write(text)

        # Update result
        result["status"] = "success"
        result["page_count"] = page_count
        result["ocr_confidence"] = round(confidence, 3)
        result["text_length"] = len(text)
        result["processing_time"] = round(time.time() - start_time, 2)

        # Save metadata JSON
        metadata = {
            **result,
            "processed_at": datetime.now().isoformat(),
            "input_path": str(input_path),
            "output_pdf": str(output_pdf),
            "output_txt": str(output_txt)
        }

        with open(output_json, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        result["processing_time"] = round(time.time() - start_time, 2)

    return result


def main():
    parser = argparse.ArgumentParser(description="OCR Pipeline for PDF processing")
    parser.add_argument("--input", "-i", required=True, help="Input directory with PDFs")
    parser.add_argument("--output", "-o", required=True, help="Output directory")
    parser.add_argument("--workers", "-w", type=int, default=8, help="Number of parallel workers")
    parser.add_argument("--resume", action="store_true", help="Skip already processed files")
    parser.add_argument("--skip-ocr", action="store_true", help="Skip OCR, just extract text")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)

    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    # Find all PDFs
    pdf_files = list(input_dir.rglob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files in {input_dir}")

    if not pdf_files:
        print("No PDF files found!")
        sys.exit(1)

    # Filter already processed if resuming
    if args.resume:
        metadata_dir = output_dir / "metadata"
        if metadata_dir.exists():
            processed = {f.stem for f in metadata_dir.glob("*.json")}
            pdf_files = [p for p in pdf_files if p.stem not in processed]
            print(f"Resuming: {len(pdf_files)} files remaining")

    # Prepare arguments for parallel processing
    process_args = [(str(pdf), str(output_dir), args.skip_ocr) for pdf in pdf_files]

    # Process with progress bar
    results = {"success": 0, "skipped": 0, "error": 0, "ocr_failed": 0}

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(process_pdf, arg): arg for arg in process_args}

        with tqdm(total=len(futures), desc="Processing PDFs") as pbar:
            for future in as_completed(futures):
                try:
                    result = future.result()
                    results[result["status"]] = results.get(result["status"], 0) + 1
                except Exception as e:
                    results["error"] += 1
                pbar.update(1)
                pbar.set_postfix(results)

    # Print summary
    print("\n" + "=" * 50)
    print("PROCESSING COMPLETE")
    print("=" * 50)
    print(f"Success: {results.get('success', 0)}")
    print(f"Skipped: {results.get('skipped', 0)}")
    print(f"OCR Failed: {results.get('ocr_failed', 0)}")
    print(f"Errors: {results.get('error', 0)}")
    print(f"Output: {output_dir}")
    print("=" * 50)


if __name__ == "__main__":
    main()
