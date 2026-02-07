#!/usr/bin/env node
/**
 * Upload New Files to R2
 *
 * Uploads only the new files (not duplicates) to Cloudflare R2
 *
 * Required environment variables:
 *   R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY_ID=xxx
 *   R2_SECRET_ACCESS_KEY=xxx
 *   R2_BUCKET_NAME=xxx
 *
 * Usage:
 *   node scripts/upload-new-files.js
 *   node scripts/upload-new-files.js --resume    # Resume from last position
 *   node scripts/upload-new-files.js --dry-run   # Test without uploading
 */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const NEW_FILES_LIST = path.join(__dirname, 'results', 'new-files.txt');
const PROGRESS_FILE = path.join(__dirname, 'results', 'upload-progress.json');
const ERROR_LOG = path.join(__dirname, 'results', 'upload-errors.txt');
const CONCURRENCY = 50; // Parallel uploads (increased for speed)
const RETRY_ATTEMPTS = 3;

// R2 Client
let s3;
function initS3() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    console.error('ERROR: Missing R2 credentials. Set these environment variables:');
    console.error('  R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com');
    console.error('  R2_ACCESS_KEY_ID=xxx');
    console.error('  R2_SECRET_ACCESS_KEY=xxx');
    console.error('  R2_BUCKET_NAME=xxx');
    process.exit(1);
  }

  s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// Get content type based on extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return types[ext] || 'application/octet-stream';
}

// Determine R2 key from local path
function getR2Key(localPath) {
  // Extract dataset number and build proper R2 path
  const match = localPath.match(/DataSet[_\s]?(\d+)/i);
  const datasetNum = match ? match[1] : 'unknown';
  const filename = path.basename(localPath);

  // Determine file type for folder structure
  const ext = path.extname(localPath).toLowerCase();

  if (['.mp4', '.mov', '.avi', '.m4v', '.wmv'].includes(ext)) {
    return `videos/${filename}`;
  } else if (['.mp3', '.wav', '.m4a', '.aac'].includes(ext)) {
    return `audio/${filename}`;
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
    return `images/DataSet_${datasetNum}/${filename}`;
  } else {
    return `documents/DataSet_${datasetNum}/${filename}`;
  }
}

// Upload a single file with retries
async function uploadFile(localPath, dryRun = false) {
  const r2Key = getR2Key(localPath);

  if (dryRun) {
    return { success: true, key: r2Key, dryRun: true };
  }

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const fileContent = fs.readFileSync(localPath);
      const contentType = getContentType(localPath);

      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
        Body: fileContent,
        ContentType: contentType,
      }));

      return { success: true, key: r2Key };
    } catch (err) {
      if (attempt === RETRY_ATTEMPTS) {
        return { success: false, key: r2Key, error: err.message };
      }
      await new Promise(r => setTimeout(r, 1000 * attempt)); // Backoff
    }
  }
}

// Load progress
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { uploaded: 0, lastFile: null, startTime: Date.now() };
}

// Save progress
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Main upload function
async function uploadNewFiles(resume = false, dryRun = false) {
  initS3();

  if (!fs.existsSync(NEW_FILES_LIST)) {
    console.error(`File list not found: ${NEW_FILES_LIST}`);
    console.error('Run check-duplicates-fast.js --check first');
    process.exit(1);
  }

  // Count total files
  let totalFiles = 0;
  const countRl = readline.createInterface({
    input: fs.createReadStream(NEW_FILES_LIST),
    crlfDelay: Infinity
  });
  for await (const line of countRl) {
    if (line.trim()) totalFiles++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(dryRun ? 'DRY RUN - Upload New Files to R2' : 'Upload New Files to R2');
  console.log('='.repeat(60));
  console.log(`Total files to upload: ${totalFiles.toLocaleString()}`);
  console.log(`Concurrency: ${CONCURRENCY} parallel uploads`);
  console.log(`Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log('');

  // Load or init progress
  let progress = resume ? loadProgress() : { uploaded: 0, lastFile: null, startTime: Date.now() };
  let skipUntilFound = resume && progress.lastFile;

  const errorStream = fs.createWriteStream(ERROR_LOG, { flags: 'a' });

  let processed = 0;
  let uploaded = progress.uploaded;
  let errors = 0;
  let skipped = 0;

  // Read file list
  const rl = readline.createInterface({
    input: fs.createReadStream(NEW_FILES_LIST),
    crlfDelay: Infinity
  });

  const batch = [];
  const startTime = Date.now();

  for await (const line of rl) {
    const filePath = line.trim();
    if (!filePath) continue;

    processed++;

    // Skip until we find the last processed file (for resume)
    if (skipUntilFound) {
      if (filePath === progress.lastFile) {
        skipUntilFound = false;
      }
      skipped++;
      continue;
    }

    // Check file exists
    if (!fs.existsSync(filePath)) {
      errors++;
      errorStream.write(`NOT_FOUND: ${filePath}\n`);
      continue;
    }

    batch.push(filePath);

    // Process batch when full
    if (batch.length >= CONCURRENCY) {
      const results = await Promise.all(batch.map(f => uploadFile(f, dryRun)));

      for (let i = 0; i < results.length; i++) {
        if (results[i].success) {
          uploaded++;
        } else {
          errors++;
          errorStream.write(`UPLOAD_ERROR: ${batch[i]} - ${results[i].error}\n`);
        }
      }

      // Save progress
      progress.uploaded = uploaded;
      progress.lastFile = batch[batch.length - 1];
      saveProgress(progress);

      // Show progress
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = uploaded / elapsed;
      const remaining = (totalFiles - processed) / rate;

      process.stdout.write(`\rProgress: ${processed.toLocaleString()}/${totalFiles.toLocaleString()} | ` +
        `Uploaded: ${uploaded.toLocaleString()} | Errors: ${errors} | ` +
        `Rate: ${rate.toFixed(1)}/s | ETA: ${formatTime(remaining)}`);

      batch.length = 0;
    }
  }

  // Process remaining batch
  if (batch.length > 0) {
    const results = await Promise.all(batch.map(f => uploadFile(f, dryRun)));
    for (let i = 0; i < results.length; i++) {
      if (results[i].success) {
        uploaded++;
      } else {
        errors++;
        errorStream.write(`UPLOAD_ERROR: ${batch[i]} - ${results[i].error}\n`);
      }
    }
  }

  errorStream.end();

  const totalTime = (Date.now() - startTime) / 1000;

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('UPLOAD COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total processed:  ${processed.toLocaleString()}`);
  console.log(`Uploaded:         ${uploaded.toLocaleString()}`);
  console.log(`Errors:           ${errors}`);
  console.log(`Skipped (resume): ${skipped.toLocaleString()}`);
  console.log(`Total time:       ${formatTime(totalTime)}`);
  console.log(`Average rate:     ${(uploaded / totalTime).toFixed(1)} files/sec`);

  if (errors > 0) {
    console.log(`\nError log: ${ERROR_LOG}`);
  }

  // Clear progress file on success
  if (errors === 0 && fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Parse args
const args = process.argv.slice(2);
const resume = args.includes('--resume');
const dryRun = args.includes('--dry-run');

if (args.includes('--help')) {
  console.log(`
Upload New Files to R2

Usage:
  node upload-new-files.js              # Start fresh upload
  node upload-new-files.js --resume     # Resume interrupted upload
  node upload-new-files.js --dry-run    # Test without uploading

Environment variables required:
  R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
  R2_ACCESS_KEY_ID=xxx
  R2_SECRET_ACCESS_KEY=xxx
  R2_BUCKET_NAME=xxx

Example:
  R2_ENDPOINT="https://xxx.r2.cloudflarestorage.com" \\
  R2_ACCESS_KEY_ID="xxx" \\
  R2_SECRET_ACCESS_KEY="xxx" \\
  R2_BUCKET_NAME="chatfiles" \\
  node scripts/upload-new-files.js
`);
  process.exit(0);
}

uploadNewFiles(resume, dryRun).catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
