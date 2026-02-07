#!/usr/bin/env node
/**
 * Duplicate Checker for ChatFiles.org
 *
 * This script handles millions of files efficiently by:
 * 1. Exporting all existing R2 keys to a local file (one-time, cached)
 * 2. Using a Set for O(1) lookups
 * 3. Streaming file comparisons to avoid memory issues
 *
 * Usage:
 *   # First, export existing R2 keys (run once, takes a while for millions of files)
 *   node scripts/check-duplicates.js --export
 *
 *   # Then check a local folder for duplicates
 *   node scripts/check-duplicates.js --check /path/to/local/folder
 *
 *   # Or check a specific file list
 *   node scripts/check-duplicates.js --check-list /path/to/filelist.txt
 */

require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const CACHE_FILE = path.join(__dirname, 'r2-existing-keys.txt');
const CACHE_IDS_FILE = path.join(__dirname, 'r2-existing-ids.txt');

// Extract document ID from filename (e.g., "EFTA00003335.pdf" -> "EFTA00003335")
function extractId(filename) {
  const base = path.basename(filename);
  const match = base.match(/^(EFTA\d+)/i);
  return match ? match[1].toUpperCase() : base.replace(/\.[^.]+$/, '').toUpperCase();
}

// Export all R2 keys to local cache file
async function exportR2Keys() {
  console.log('Exporting all R2 keys to local cache...');
  console.log('This may take a while for millions of files.\n');

  const writeStream = fs.createWriteStream(CACHE_FILE);
  const idSet = new Set();

  let totalKeys = 0;
  let continuationToken = undefined;

  // List all prefixes we care about
  const prefixes = ['documents/', 'videos/', 'images/', 'thumbnails/', 'audio/'];

  for (const prefix of prefixes) {
    console.log(`Scanning prefix: ${prefix}`);
    continuationToken = undefined;

    do {
      try {
        const command = new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          MaxKeys: 1000,
          ContinuationToken: continuationToken,
        });

        const response = await s3.send(command);

        if (response.Contents) {
          for (const obj of response.Contents) {
            writeStream.write(obj.Key + '\n');
            const id = extractId(obj.Key);
            idSet.add(id);
            totalKeys++;
          }
        }

        continuationToken = response.NextContinuationToken;

        if (totalKeys % 10000 === 0) {
          process.stdout.write(`\rScanned: ${totalKeys.toLocaleString()} keys...`);
        }
      } catch (err) {
        console.error(`\nError scanning ${prefix}:`, err.message);
        break;
      }
    } while (continuationToken);
  }

  writeStream.end();

  // Write unique IDs to separate file
  const idStream = fs.createWriteStream(CACHE_IDS_FILE);
  for (const id of idSet) {
    idStream.write(id + '\n');
  }
  idStream.end();

  console.log(`\n\n=== EXPORT COMPLETE ===`);
  console.log(`Total R2 keys: ${totalKeys.toLocaleString()}`);
  console.log(`Unique document IDs: ${idSet.size.toLocaleString()}`);
  console.log(`\nCache files saved:`);
  console.log(`  Keys: ${CACHE_FILE}`);
  console.log(`  IDs:  ${CACHE_IDS_FILE}`);
}

// Load existing IDs from cache into a Set
async function loadExistingIds() {
  if (!fs.existsSync(CACHE_IDS_FILE)) {
    console.error('Cache file not found. Run with --export first.');
    console.error(`Expected: ${CACHE_IDS_FILE}`);
    process.exit(1);
  }

  console.log('Loading existing IDs from cache...');
  const existingIds = new Set();

  const rl = readline.createInterface({
    input: fs.createReadStream(CACHE_IDS_FILE),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      existingIds.add(line.trim().toUpperCase());
    }
  }

  console.log(`Loaded ${existingIds.size.toLocaleString()} existing IDs\n`);
  return existingIds;
}

// Recursively get all files in a directory
function* walkDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      yield* walkDir(filePath);
    } else {
      yield filePath;
    }
  }
}

// Check a local folder for duplicates
async function checkFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`);
    process.exit(1);
  }

  const existingIds = await loadExistingIds();

  console.log(`Scanning local folder: ${folderPath}\n`);

  let totalFiles = 0;
  let duplicates = 0;
  let newFiles = 0;

  const duplicatesList = [];
  const newFilesList = [];

  for (const filePath of walkDir(folderPath)) {
    const id = extractId(filePath);
    totalFiles++;

    if (existingIds.has(id)) {
      duplicates++;
      if (duplicatesList.length < 100) {
        duplicatesList.push({ id, path: filePath });
      }
    } else {
      newFiles++;
      if (newFilesList.length < 100) {
        newFilesList.push({ id, path: filePath });
      }
    }

    if (totalFiles % 10000 === 0) {
      process.stdout.write(`\rScanned: ${totalFiles.toLocaleString()} | Duplicates: ${duplicates.toLocaleString()} | New: ${newFiles.toLocaleString()}`);
    }
  }

  console.log(`\n\n${'='.repeat(50)}`);
  console.log('DUPLICATE CHECK RESULTS');
  console.log('='.repeat(50));
  console.log(`Total local files:    ${totalFiles.toLocaleString()}`);
  console.log(`Already in R2:        ${duplicates.toLocaleString()} (duplicates)`);
  console.log(`New files to upload:  ${newFiles.toLocaleString()}`);
  console.log(`Duplicate rate:       ${((duplicates / totalFiles) * 100).toFixed(2)}%`);

  // Save results to files
  const resultsDir = path.join(__dirname, 'duplicate-check-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save new files list (for upload)
  const newFilesPath = path.join(resultsDir, `new-files-${timestamp}.txt`);
  const newStream = fs.createWriteStream(newFilesPath);
  let newCount = 0;
  for (const filePath of walkDir(folderPath)) {
    const id = extractId(filePath);
    if (!existingIds.has(id)) {
      newStream.write(filePath + '\n');
      newCount++;
    }
  }
  newStream.end();

  // Save duplicates list
  const dupFilesPath = path.join(resultsDir, `duplicates-${timestamp}.txt`);
  const dupStream = fs.createWriteStream(dupFilesPath);
  for (const filePath of walkDir(folderPath)) {
    const id = extractId(filePath);
    if (existingIds.has(id)) {
      dupStream.write(filePath + '\n');
    }
  }
  dupStream.end();

  console.log(`\nResults saved to:`);
  console.log(`  New files list:     ${newFilesPath}`);
  console.log(`  Duplicates list:    ${dupFilesPath}`);

  if (newFilesList.length > 0) {
    console.log(`\nSample NEW files (first ${Math.min(10, newFilesList.length)}):`);
    newFilesList.slice(0, 10).forEach(f => console.log(`  ${f.id} -> ${f.path}`));
  }

  if (duplicatesList.length > 0) {
    console.log(`\nSample DUPLICATE files (first ${Math.min(10, duplicatesList.length)}):`);
    duplicatesList.slice(0, 10).forEach(f => console.log(`  ${f.id} -> ${f.path}`));
  }
}

// Check a file containing list of paths
async function checkFileList(listPath) {
  if (!fs.existsSync(listPath)) {
    console.error(`File list not found: ${listPath}`);
    process.exit(1);
  }

  const existingIds = await loadExistingIds();

  console.log(`Checking file list: ${listPath}\n`);

  const rl = readline.createInterface({
    input: fs.createReadStream(listPath),
    crlfDelay: Infinity,
  });

  let totalFiles = 0;
  let duplicates = 0;
  let newFiles = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    const id = extractId(line.trim());
    totalFiles++;

    if (existingIds.has(id)) {
      duplicates++;
    } else {
      newFiles++;
    }

    if (totalFiles % 10000 === 0) {
      process.stdout.write(`\rChecked: ${totalFiles.toLocaleString()} | Duplicates: ${duplicates.toLocaleString()} | New: ${newFiles.toLocaleString()}`);
    }
  }

  console.log(`\n\n=== RESULTS ===`);
  console.log(`Total files in list:  ${totalFiles.toLocaleString()}`);
  console.log(`Already in R2:        ${duplicates.toLocaleString()}`);
  console.log(`New files to upload:  ${newFiles.toLocaleString()}`);
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Duplicate Checker for ChatFiles.org

Usage:
  node check-duplicates.js --export              Export all R2 keys (run first)
  node check-duplicates.js --check <folder>      Check folder for duplicates
  node check-duplicates.js --check-list <file>   Check file list for duplicates

Examples:
  node check-duplicates.js --export
  node check-duplicates.js --check /home/ai/Desktop/DataSet_10
  node check-duplicates.js --check ~/Downloads/new-files/
`);
    return;
  }

  if (args[0] === '--export') {
    await exportR2Keys();
  } else if (args[0] === '--check' && args[1]) {
    await checkFolder(args[1]);
  } else if (args[0] === '--check-list' && args[1]) {
    await checkFileList(args[1]);
  } else {
    console.error('Invalid arguments. Use --help for usage.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
