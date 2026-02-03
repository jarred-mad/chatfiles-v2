import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const [
      docCount,
      pageSum,
      imageCount,
      faceCount,
      clusterStats,
      byDataset,
      byType,
      topNames,
    ] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM documents'),
      query<{ total: string }>('SELECT COALESCE(SUM(page_count), 0) as total FROM documents'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM extracted_images'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM faces'),
      query<{ total: string; known: string }>(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_known_person THEN 1 ELSE 0 END) as known
        FROM face_clusters`
      ),
      query<{ dataset_number: number; count: string }>(
        `SELECT dataset_number, COUNT(*) as count
         FROM documents
         GROUP BY dataset_number
         ORDER BY dataset_number`
      ),
      query<{ document_type: string; count: string }>(
        `SELECT COALESCE(document_type, 'other') as document_type, COUNT(*) as count
         FROM documents
         GROUP BY document_type
         ORDER BY count DESC`
      ),
      query<{ name: string; total: string }>(
        `SELECT name, SUM(frequency) as total
         FROM mentioned_names
         GROUP BY name
         ORDER BY total DESC
         LIMIT 10`
      ),
    ]);

    const totalClusters = parseInt(clusterStats[0]?.total || '0', 10);
    const knownPersons = parseInt(clusterStats[0]?.known || '0', 10);

    const stats = {
      total_documents: parseInt(docCount[0]?.count || '0', 10),
      total_indexed: parseInt(docCount[0]?.count || '0', 10),
      total_pages: parseInt(pageSum[0]?.total || '0', 10),
      total_images: parseInt(imageCount[0]?.count || '0', 10),
      total_faces: parseInt(faceCount[0]?.count || '0', 10),
      total_clusters: totalClusters,
      known_persons: knownPersons,
      unknown_persons: totalClusters - knownPersons,
      documents_by_dataset: byDataset.map(d => ({
        dataset_number: d.dataset_number,
        count: parseInt(d.count, 10),
      })),
      documents_by_type: byType.map(t => ({
        type: t.document_type,
        label: t.document_type.charAt(0).toUpperCase() + t.document_type.slice(1).replace('_', ' '),
        count: parseInt(t.count, 10),
      })),
      processing_status: {
        ocr_complete: false,
        image_extraction_complete: false,
        face_detection_complete: false,
        indexing_complete: true,
        last_updated: new Date().toISOString(),
      },
      top_mentioned_names: topNames.map(n => ({
        name: n.name,
        count: parseInt(n.total, 10),
      })),
    };

    // Cache this response for 5 minutes
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
