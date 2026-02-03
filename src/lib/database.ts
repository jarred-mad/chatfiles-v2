import { Pool, PoolClient } from 'pg';

// Types
export interface Document {
  id: number;
  dataset_number: number;
  filename: string;
  original_url: string | null;
  file_path_r2: string | null;
  text_content: string | null;
  ocr_confidence: number | null;
  page_count: number | null;
  file_size_bytes: number | null;
  document_type: string;
  created_at: Date;
  indexed_at: Date | null;
}

export interface ExtractedImage {
  id: number;
  document_id: number;
  page_number: number | null;
  image_path_r2: string | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
  created_at: Date;
}

export interface Face {
  id: number;
  image_id: number | null;
  document_id: number | null;
  bounding_box: { x: number; y: number; width: number; height: number } | null;
  cluster_id: number | null;
  confidence: number | null;
  face_crop_path: string | null;
  created_at: Date;
}

export interface FaceCluster {
  id: number;
  label: string | null;
  sample_image_path: string | null;
  face_count: number;
  is_known_person: boolean;
  created_at: Date;
}

export interface MentionedName {
  id: number;
  document_id: number;
  name: string;
  frequency: number;
  context_snippet: string | null;
}

// Connection pool
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  return pool;
}

/**
 * Get a client from the pool
 */
export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

/**
 * Execute a query
 */
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Get document by ID with all related data
 */
export async function getDocumentById(id: number): Promise<{
  document: Document | null;
  images: ExtractedImage[];
  faces: (Face & { cluster_label?: string })[];
  mentioned_names: MentionedName[];
} | null> {
  const client = await getClient();
  try {
    // Get document
    const docResult = await client.query<Document>(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return null;
    }

    const document = docResult.rows[0];

    // Get images
    const imagesResult = await client.query<ExtractedImage>(
      'SELECT * FROM extracted_images WHERE document_id = $1 ORDER BY page_number',
      [id]
    );

    // Get faces with cluster labels
    const facesResult = await client.query<Face & { cluster_label?: string }>(
      `SELECT f.*, fc.label as cluster_label
       FROM faces f
       LEFT JOIN face_clusters fc ON f.cluster_id = fc.id
       WHERE f.document_id = $1`,
      [id]
    );

    // Get mentioned names
    const namesResult = await client.query<MentionedName>(
      'SELECT * FROM mentioned_names WHERE document_id = $1 ORDER BY frequency DESC',
      [id]
    );

    return {
      document,
      images: imagesResult.rows,
      faces: facesResult.rows,
      mentioned_names: namesResult.rows,
    };
  } finally {
    client.release();
  }
}

/**
 * Get documents by dataset
 */
export async function getDocumentsByDataset(
  datasetNumber: number,
  page = 1,
  limit = 20
): Promise<{ documents: Document[]; total: number }> {
  const offset = (page - 1) * limit;

  const [docsResult, countResult] = await Promise.all([
    query<Document>(
      `SELECT * FROM documents
       WHERE dataset_number = $1
       ORDER BY filename
       LIMIT $2 OFFSET $3`,
      [datasetNumber, limit, offset]
    ),
    query<{ count: string }>(
      'SELECT COUNT(*) as count FROM documents WHERE dataset_number = $1',
      [datasetNumber]
    ),
  ]);

  return {
    documents: docsResult,
    total: parseInt(countResult[0]?.count || '0', 10),
  };
}

/**
 * Get images by document ID
 */
export async function getImagesByDocument(
  documentId: number
): Promise<ExtractedImage[]> {
  return query<ExtractedImage>(
    'SELECT * FROM extracted_images WHERE document_id = $1 ORDER BY page_number',
    [documentId]
  );
}

/**
 * Get face cluster by ID with all faces
 */
export async function getFaceCluster(clusterId: number): Promise<{
  cluster: FaceCluster | null;
  faces: (Face & { document_filename?: string; image_path?: string })[];
}> {
  const client = await getClient();
  try {
    // Get cluster
    const clusterResult = await client.query<FaceCluster>(
      'SELECT * FROM face_clusters WHERE id = $1',
      [clusterId]
    );

    if (clusterResult.rows.length === 0) {
      return { cluster: null, faces: [] };
    }

    // Get all faces in cluster with document info
    const facesResult = await client.query<
      Face & { document_filename?: string; image_path?: string }
    >(
      `SELECT f.*, d.filename as document_filename, ei.image_path_r2 as image_path
       FROM faces f
       LEFT JOIN documents d ON f.document_id = d.id
       LEFT JOIN extracted_images ei ON f.image_id = ei.id
       WHERE f.cluster_id = $1
       ORDER BY f.confidence DESC`,
      [clusterId]
    );

    return {
      cluster: clusterResult.rows[0],
      faces: facesResult.rows,
    };
  } finally {
    client.release();
  }
}

/**
 * Get all face clusters with pagination
 */
export async function getAllClusters(
  page = 1,
  limit = 50,
  knownOnly = false
): Promise<{ clusters: FaceCluster[]; total: number }> {
  const offset = (page - 1) * limit;
  const whereClause = knownOnly ? 'WHERE is_known_person = true' : '';

  const [clustersResult, countResult] = await Promise.all([
    query<FaceCluster>(
      `SELECT * FROM face_clusters
       ${whereClause}
       ORDER BY is_known_person DESC, face_count DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM face_clusters ${whereClause}`
    ),
  ]);

  return {
    clusters: clustersResult,
    total: parseInt(countResult[0]?.count || '0', 10),
  };
}

/**
 * Get documents mentioning a specific name
 */
export async function getNameMentions(
  name: string,
  page = 1,
  limit = 20
): Promise<{ documents: Document[]; total: number }> {
  const offset = (page - 1) * limit;

  const [docsResult, countResult] = await Promise.all([
    query<Document>(
      `SELECT DISTINCT d.* FROM documents d
       INNER JOIN mentioned_names mn ON d.id = mn.document_id
       WHERE mn.name ILIKE $1
       ORDER BY d.filename
       LIMIT $2 OFFSET $3`,
      [`%${name}%`, limit, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT d.id) as count FROM documents d
       INNER JOIN mentioned_names mn ON d.id = mn.document_id
       WHERE mn.name ILIKE $1`,
      [`%${name}%`]
    ),
  ]);

  return {
    documents: docsResult,
    total: parseInt(countResult[0]?.count || '0', 10),
  };
}

/**
 * Get aggregate stats for home page
 */
export async function getStats(): Promise<{
  total_documents: number;
  total_images: number;
  total_faces: number;
  total_clusters: number;
  known_persons: number;
  documents_by_dataset: { dataset_number: number; count: number }[];
  documents_by_type: { document_type: string; count: number }[];
}> {
  const client = await getClient();
  try {
    const [
      docCount,
      imageCount,
      faceCount,
      clusterStats,
      byDataset,
      byType,
    ] = await Promise.all([
      client.query<{ count: string }>('SELECT COUNT(*) as count FROM documents'),
      client.query<{ count: string }>('SELECT COUNT(*) as count FROM extracted_images'),
      client.query<{ count: string }>('SELECT COUNT(*) as count FROM faces'),
      client.query<{ total: string; known: string }>(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_known_person THEN 1 ELSE 0 END) as known
        FROM face_clusters`
      ),
      client.query<{ dataset_number: number; count: string }>(
        `SELECT dataset_number, COUNT(*) as count
         FROM documents
         GROUP BY dataset_number
         ORDER BY dataset_number`
      ),
      client.query<{ document_type: string; count: string }>(
        `SELECT document_type, COUNT(*) as count
         FROM documents
         GROUP BY document_type
         ORDER BY count DESC`
      ),
    ]);

    return {
      total_documents: parseInt(docCount.rows[0]?.count || '0', 10),
      total_images: parseInt(imageCount.rows[0]?.count || '0', 10),
      total_faces: parseInt(faceCount.rows[0]?.count || '0', 10),
      total_clusters: parseInt(clusterStats.rows[0]?.total || '0', 10),
      known_persons: parseInt(clusterStats.rows[0]?.known || '0', 10),
      documents_by_dataset: byDataset.rows.map((r) => ({
        dataset_number: r.dataset_number,
        count: parseInt(r.count, 10),
      })),
      documents_by_type: byType.rows.map((r) => ({
        document_type: r.document_type,
        count: parseInt(r.count, 10),
      })),
    };
  } finally {
    client.release();
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Close the pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
