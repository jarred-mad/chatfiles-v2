#!/usr/bin/env node
/**
 * Script to index videos from R2 into the database
 */

require('dotenv').config({ path: '.env.production.local' });
require('dotenv').config({ path: '.env.local' });

const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Pool } = require('pg');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm', '.m4v'];

async function findAllVideos() {
  const videos = [];
  let continuationToken = undefined;

  console.log('Scanning R2 for video files...');

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });

    const res = await s3Client.send(cmd);

    for (const obj of res.Contents || []) {
      const key = obj.Key;
      const ext = key.substring(key.lastIndexOf('.')).toLowerCase();

      if (VIDEO_EXTENSIONS.includes(ext)) {
        // Parse dataset number from path
        let datasetNumber = 0;
        const datasetMatch = key.match(/DataSet[_\s]?(\d+)/i);
        if (datasetMatch) {
          datasetNumber = parseInt(datasetMatch[1], 10);
        }

        // Get filename
        const filename = key.split('/').pop();

        videos.push({
          key,
          filename,
          size: obj.Size,
          datasetNumber,
        });
      }
    }

    continuationToken = res.NextContinuationToken;
    process.stdout.write(`\rFound ${videos.length} videos...`);
  } while (continuationToken);

  console.log(`\nTotal videos found: ${videos.length}`);
  return videos;
}

async function indexVideos(videos) {
  const client = await pool.connect();
  let indexed = 0;
  let skipped = 0;
  let errors = 0;

  console.log('\nIndexing videos into database...');

  try {
    for (const video of videos) {
      try {
        // Check if already exists
        const existing = await client.query(
          'SELECT id FROM documents WHERE filename = $1 AND document_type = $2',
          [video.filename, 'video']
        );

        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insert new video record
        await client.query(
          `INSERT INTO documents (
            dataset_number,
            filename,
            file_path_r2,
            file_size_bytes,
            document_type,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            video.datasetNumber,
            video.filename,
            video.key,
            video.size,
            'video',
          ]
        );

        indexed++;
        process.stdout.write(`\rIndexed: ${indexed}, Skipped: ${skipped}, Errors: ${errors}`);
      } catch (err) {
        errors++;
        console.error(`\nError indexing ${video.filename}:`, err.message);
      }
    }
  } finally {
    client.release();
  }

  console.log(`\n\nDone! Indexed: ${indexed}, Skipped: ${skipped}, Errors: ${errors}`);
}

async function main() {
  try {
    const videos = await findAllVideos();

    if (videos.length === 0) {
      console.log('No videos found in R2');
      return;
    }

    // Deduplicate by filename (prefer videos/ prefix, then NATIVES)
    const uniqueVideos = new Map();
    for (const video of videos) {
      const existing = uniqueVideos.get(video.filename);
      if (!existing) {
        uniqueVideos.set(video.filename, video);
      } else if (video.key.startsWith('videos/') && !existing.key.startsWith('videos/')) {
        // Prefer videos/ prefix
        uniqueVideos.set(video.filename, video);
      }
    }

    console.log(`Unique videos after deduplication: ${uniqueVideos.size}`);

    await indexVideos(Array.from(uniqueVideos.values()));
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await pool.end();
  }
}

main();
