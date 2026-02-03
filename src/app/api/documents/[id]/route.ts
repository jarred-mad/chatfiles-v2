import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface DocumentRow {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string;
  file_path_r2: string | null;
  text_content: string | null;
  ocr_confidence: number | null;
  page_count: number | null;
  file_size_bytes: number | null;
  created_at: string;
  updated_at: string | null;
}

interface ImageRow {
  id: string;
  page_number: number | null;
  file_path_r2: string | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
}

interface FaceRow {
  id: string;
  image_id: string | null;
  bbox_x: number | null;
  bbox_y: number | null;
  bbox_width: number | null;
  bbox_height: number | null;
  cluster_id: string | null;
  cluster_label: string | null;
  confidence: number | null;
}

interface NameRow {
  name: string;
  frequency: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get document
    const docResult = await query<DocumentRow>(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (docResult.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = docResult[0];

    // Get images
    const imagesResult = await query<ImageRow>(
      `SELECT id, page_number, file_path_r2, width, height, has_faces
       FROM extracted_images
       WHERE document_id = $1
       ORDER BY page_number`,
      [id]
    );

    // Get faces with cluster labels
    const facesResult = await query<FaceRow>(
      `SELECT f.id, f.image_id, f.bbox_x, f.bbox_y, f.bbox_width, f.bbox_height,
              f.cluster_id, fc.label as cluster_label, f.confidence
       FROM faces f
       LEFT JOIN face_clusters fc ON f.cluster_id = fc.id
       WHERE f.document_id = $1`,
      [id]
    );

    // Get mentioned names
    const namesResult = await query<NameRow>(
      `SELECT name, frequency
       FROM mentioned_names
       WHERE document_id = $1
       ORDER BY frequency DESC`,
      [id]
    );

    return NextResponse.json({
      id: document.id,
      filename: document.filename,
      dataset_number: document.dataset_number,
      document_type: document.document_type || 'document',
      file_path_r2: document.file_path_r2,
      text_content: document.text_content,
      ocr_confidence: document.ocr_confidence,
      page_count: document.page_count,
      file_size_bytes: document.file_size_bytes,
      created_at: document.created_at,
      updated_at: document.updated_at,
      mentioned_names: namesResult.map(n => ({
        name: n.name,
        frequency: n.frequency,
      })),
      extracted_images: imagesResult.map(img => ({
        id: img.id,
        page_number: img.page_number,
        image_path_r2: img.file_path_r2,
        width: img.width,
        height: img.height,
        has_faces: img.has_faces,
      })),
      faces: facesResult.map(f => ({
        id: f.id,
        image_id: f.image_id,
        bounding_box: f.bbox_x !== null ? {
          x: f.bbox_x,
          y: f.bbox_y,
          width: f.bbox_width,
          height: f.bbox_height,
        } : null,
        cluster_id: f.cluster_id,
        cluster_label: f.cluster_label,
        confidence: f.confidence,
      })),
    });
  } catch (error) {
    console.error('Document API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
