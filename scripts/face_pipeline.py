#!/usr/bin/env python3
"""
Facial Recognition Pipeline for ChatFiles.org
Detects faces, extracts embeddings, clusters by identity, matches known persons.

Usage:
    python face_pipeline.py --input ~/epstein_images/ --output ~/epstein_faces/ --reference ./reference_faces/ --gpu
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime
import numpy as np
from collections import defaultdict

try:
    import cv2
    from tqdm import tqdm
    from sklearn.cluster import DBSCAN
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    print("Missing dependencies. Install with: pip install opencv-python tqdm scikit-learn")
    sys.exit(1)

# InsightFace import (optional - will skip if not available)
try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    print("Warning: InsightFace not installed. Install with: pip install insightface onnxruntime-gpu")


MIN_FACE_SIZE = 50  # Minimum face crop size
SIMILARITY_THRESHOLD = 0.5  # For DBSCAN clustering
KNOWN_PERSON_THRESHOLD = 0.6  # For matching to reference photos


class FacePipeline:
    def __init__(self, use_gpu=True):
        self.use_gpu = use_gpu
        self.face_app = None
        self.faces_data = []
        self.embeddings = []
        self.reference_embeddings = {}

    def initialize(self):
        """Initialize the face detection model."""
        if not INSIGHTFACE_AVAILABLE:
            print("InsightFace not available. Running in demo mode (no actual face detection).")
            return False

        try:
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if self.use_gpu else ['CPUExecutionProvider']
            self.face_app = FaceAnalysis(name='buffalo_l', providers=providers)
            self.face_app.prepare(ctx_id=0 if self.use_gpu else -1, det_size=(640, 640))
            print("Face detection model initialized successfully")
            return True
        except Exception as e:
            print(f"Failed to initialize face model: {e}")
            return False

    def load_reference_faces(self, reference_dir: Path):
        """Load reference photos of known persons."""
        if not self.face_app or not reference_dir.exists():
            return

        print(f"Loading reference faces from {reference_dir}")

        for person_dir in reference_dir.iterdir():
            if not person_dir.is_dir():
                continue

            person_name = person_dir.name.replace("_", " ")
            embeddings = []

            for img_path in person_dir.glob("*.jpg"):
                img = cv2.imread(str(img_path))
                if img is None:
                    continue

                faces = self.face_app.get(img)
                if faces:
                    embeddings.append(faces[0].embedding)

            for img_path in person_dir.glob("*.png"):
                img = cv2.imread(str(img_path))
                if img is None:
                    continue

                faces = self.face_app.get(img)
                if faces:
                    embeddings.append(faces[0].embedding)

            if embeddings:
                # Average embedding for this person
                self.reference_embeddings[person_name] = np.mean(embeddings, axis=0)
                print(f"  Loaded {len(embeddings)} reference photos for {person_name}")

    def process_image(self, img_path: Path, output_dir: Path) -> list:
        """Process a single image, detect faces, extract embeddings."""
        faces_found = []

        try:
            img = cv2.imread(str(img_path))
            if img is None:
                return faces_found

            if not self.face_app:
                # Demo mode - no actual detection
                return faces_found

            # Detect faces
            faces = self.face_app.get(img)

            for idx, face in enumerate(faces):
                bbox = face.bbox.astype(int)
                x1, y1, x2, y2 = bbox

                # Skip small faces
                if (x2 - x1) < MIN_FACE_SIZE or (y2 - y1) < MIN_FACE_SIZE:
                    continue

                # Expand bbox slightly for crop
                h, w = img.shape[:2]
                pad = int((x2 - x1) * 0.1)
                x1 = max(0, x1 - pad)
                y1 = max(0, y1 - pad)
                x2 = min(w, x2 + pad)
                y2 = min(h, y2 + pad)

                # Crop face
                face_crop = img[y1:y2, x1:x2]

                # Generate face ID
                face_id = f"{img_path.stem}_face{idx}"

                # Save face crop
                crops_dir = output_dir / "face_crops"
                crops_dir.mkdir(parents=True, exist_ok=True)
                crop_path = crops_dir / f"{face_id}.jpg"
                cv2.imwrite(str(crop_path), face_crop)

                # Store face data
                face_data = {
                    "face_id": face_id,
                    "source_image": str(img_path),
                    "bbox": {"x": int(x1), "y": int(y1), "w": int(x2-x1), "h": int(y2-y1)},
                    "confidence": float(face.det_score),
                    "crop_path": str(crop_path),
                    "embedding_idx": len(self.embeddings)
                }

                faces_found.append(face_data)
                self.faces_data.append(face_data)
                self.embeddings.append(face.embedding)

        except Exception as e:
            print(f"Error processing {img_path}: {e}")

        return faces_found

    def cluster_faces(self) -> dict:
        """Cluster all face embeddings to group same persons."""
        if not self.embeddings:
            return {"clusters": [], "assignments": {}}

        print(f"Clustering {len(self.embeddings)} faces...")

        embeddings_array = np.array(self.embeddings)

        # Normalize embeddings
        norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
        embeddings_normalized = embeddings_array / norms

        # DBSCAN clustering with cosine distance
        # Convert similarity threshold to distance
        eps = 1 - SIMILARITY_THRESHOLD

        clustering = DBSCAN(
            eps=eps,
            min_samples=2,
            metric='cosine'
        ).fit(embeddings_normalized)

        labels = clustering.labels_

        # Group faces by cluster
        clusters = defaultdict(list)
        for idx, label in enumerate(labels):
            cluster_id = int(label) if label >= 0 else f"singleton_{idx}"
            clusters[cluster_id].append(self.faces_data[idx])

        # Match clusters to known persons
        cluster_info = []
        for cluster_id, faces in clusters.items():
            # Get cluster centroid
            face_indices = [f["embedding_idx"] for f in faces]
            cluster_embeddings = embeddings_array[face_indices]
            centroid = np.mean(cluster_embeddings, axis=0)

            # Try to match to known person
            label = None
            is_known = False
            best_similarity = 0

            for person_name, ref_embedding in self.reference_embeddings.items():
                sim = cosine_similarity([centroid], [ref_embedding])[0][0]
                if sim > KNOWN_PERSON_THRESHOLD and sim > best_similarity:
                    label = person_name
                    is_known = True
                    best_similarity = sim

            cluster_info.append({
                "cluster_id": str(cluster_id),
                "label": label,
                "is_known_person": is_known,
                "match_confidence": float(best_similarity) if is_known else None,
                "face_count": len(faces),
                "sample_face": faces[0]["crop_path"] if faces else None,
                "face_ids": [f["face_id"] for f in faces]
            })

        # Sort: known persons first, then by face count
        cluster_info.sort(key=lambda x: (not x["is_known_person"], -x["face_count"]))

        return {
            "clusters": cluster_info,
            "total_faces": len(self.faces_data),
            "total_clusters": len(clusters),
            "known_persons": sum(1 for c in cluster_info if c["is_known_person"]),
            "unknown_clusters": sum(1 for c in cluster_info if not c["is_known_person"])
        }

    def save_results(self, output_dir: Path, cluster_results: dict):
        """Save all results to JSON files."""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save clusters
        clusters_path = output_dir / "clusters.json"
        with open(clusters_path, "w") as f:
            json.dump(cluster_results, f, indent=2)

        # Save all faces
        faces_path = output_dir / "faces.json"
        with open(faces_path, "w") as f:
            json.dump({
                "total_faces": len(self.faces_data),
                "processed_at": datetime.now().isoformat(),
                "faces": self.faces_data
            }, f, indent=2)

        # Save embeddings (numpy format for later use)
        if self.embeddings:
            embeddings_path = output_dir / "embeddings.npy"
            np.save(embeddings_path, np.array(self.embeddings))

        print(f"Results saved to {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Face detection and clustering pipeline")
    parser.add_argument("--input", "-i", required=True, help="Input directory with extracted images")
    parser.add_argument("--output", "-o", required=True, help="Output directory for faces")
    parser.add_argument("--reference", "-r", help="Directory with reference photos of known persons")
    parser.add_argument("--gpu", action="store_true", help="Use GPU acceleration")
    parser.add_argument("--workers", "-w", type=int, default=1, help="Not used (single-threaded for GPU)")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)

    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    # Initialize pipeline
    pipeline = FacePipeline(use_gpu=args.gpu)
    model_ready = pipeline.initialize()

    # Load reference faces if provided
    if args.reference and model_ready:
        pipeline.load_reference_faces(Path(args.reference))

    # Find all images
    image_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
    image_files = []
    for ext in image_extensions:
        image_files.extend(input_dir.rglob(f"*{ext}"))
        image_files.extend(input_dir.rglob(f"*{ext.upper()}"))

    print(f"Found {len(image_files)} images in {input_dir}")

    if not image_files:
        print("No images found!")
        sys.exit(1)

    # Process all images
    total_faces = 0
    with tqdm(total=len(image_files), desc="Processing images") as pbar:
        for img_path in image_files:
            faces = pipeline.process_image(img_path, output_dir)
            total_faces += len(faces)
            pbar.update(1)
            pbar.set_postfix({"faces": total_faces})

    # Cluster faces
    if total_faces > 0:
        cluster_results = pipeline.cluster_faces()
        pipeline.save_results(output_dir, cluster_results)
    else:
        print("No faces detected!")
        cluster_results = {"clusters": [], "total_faces": 0}

    # Print summary
    print("\n" + "=" * 50)
    print("FACE PIPELINE COMPLETE")
    print("=" * 50)
    print(f"Total faces detected: {total_faces}")
    print(f"Total clusters: {cluster_results.get('total_clusters', 0)}")
    print(f"Known persons matched: {cluster_results.get('known_persons', 0)}")
    print(f"Unknown clusters: {cluster_results.get('unknown_clusters', 0)}")
    print(f"Output: {output_dir}")
    print("=" * 50)


if __name__ == "__main__":
    main()
