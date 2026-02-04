#!/usr/bin/env node
/**
 * Upload extracted images to R2
 */

require('dotenv').config({ path: '.env.production.local' });
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const IMAGES_DIR = path.join(__dirname, '../extracted/DataSet_1');
const CONCURRENCY = 10;

async function fileExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(filePath, key) {
  const content = fs.readFileSync(filePath);
  const contentType = filePath.endsWith('.png') ? 'image/png' :
                      filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ? 'image/jpeg' :
                      'application/octet-stream';

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: content,
    ContentType: contentType,
  }));
}

async function main() {
  console.log('Uploading extracted images to R2...\n');

  const files = fs.readdirSync(IMAGES_DIR).filter(f =>
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );

  console.log(`Found ${files.length} images to upload\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map(async (file) => {
      const filePath = path.join(IMAGES_DIR, file);
      const key = `images/${file}`;

      try {
        // Check if already exists
        if (await fileExists(key)) {
          skipped++;
          return;
        }

        await uploadFile(filePath, key);
        uploaded++;
      } catch (err) {
        console.error(`Error uploading ${file}:`, err.message);
        errors++;
      }
    }));

    // Progress
    const total = uploaded + skipped + errors;
    if (total % 100 === 0 || i + CONCURRENCY >= files.length) {
      console.log(`Progress: ${total}/${files.length} | Uploaded: ${uploaded} | Skipped: ${skipped} | Errors: ${errors}`);
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
