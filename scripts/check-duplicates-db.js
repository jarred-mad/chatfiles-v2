#!/usr/bin/env node
/**
 * Duplicate Checker for ChatFiles.org (Database Version)
 *
 * This script checks for duplicates by querying the database API.
 * More reliable than R2 since all indexed files are tracked in the DB.
 *
 * Usage:
 *   # Export all existing document IDs from database
 *   node scripts/check-duplicates-db.js --export
 *
 *   # Check a local folder for duplicates
 *   node scripts/check-duplicates-db.js --check /path/to/folder
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const CACHE_FILE = path.join(__dirname, 'db-existing-ids.txt');
const BASE_URL = 'https://chatfiles.org';

// Extract document ID from filename
function extractId(filename) {
  const base = path.basename(filename);
  const match = base.match(/^(EFTA\d+)/i);
  return match ? match[1].toUpperCase() : base.replace(/\.[^.]+$/, '').toUpperCase();
}

// Fetch JSON from URL
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}`));
        }
      });
    }).on('error', reject);
  });
}

// Export all document IDs from database via API
async function exportFromDatabase() {
  console.log('Exporting all document IDs from database...\n');

  const existingIds = new Set();
  let page = 1;
  let hasMore = true;

  // Fetch documents
  console.log('Fetching documents...');
  while (hasMore) {
    try {
      const url = `${BASE_URL}/api/search?q=&limit=1000&page=${page}`;
      const data = await fetchJson(url);

      if (data.results && data.results.length > 0) {
        for (const doc of data.results) {
          if (doc.id) {
            existingIds.add(doc.id.toUpperCase());
          }
        }
        process.stdout.write(`\rDocuments: ${existingIds.size.toLocaleString()} IDs collected (page ${page})...`);
        page++;

        if (data.results.length < 1000) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error(`\nError on page ${page}:`, err.message);
      hasMore = false;
    }
  }

  // Fetch videos
  console.log('\n\nFetching videos...');
  page = 1;
  hasMore = true;
  while (hasMore) {
    try {
      const url = `${BASE_URL}/api/videos?limit=1000&page=${page}`;
      const data = await fetchJson(url);

      if (data.videos && data.videos.length > 0) {
        for (const video of data.videos) {
          if (video.id) {
            existingIds.add(video.id.toUpperCase());
          }
        }
        process.stdout.write(`\rVideos: page ${page}, total IDs: ${existingIds.size.toLocaleString()}...`);
        page++;

        if (data.videos.length < 1000) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error(`\nError fetching videos:`, err.message);
      hasMore = false;
    }
  }

  // Fetch photos/images
  console.log('\n\nFetching photos...');
  page = 1;
  hasMore = true;
  while (hasMore) {
    try {
      const url = `${BASE_URL}/api/photos?limit=1000&page=${page}`;
      const data = await fetchJson(url);

      if (data.images && data.images.length > 0) {
        for (const img of data.images) {
          if (img.document_id) {
            existingIds.add(img.document_id.toUpperCase());
          }
        }
        process.stdout.write(`\rPhotos: page ${page}, total IDs: ${existingIds.size.toLocaleString()}...`);
        page++;

        if (data.images.length < 1000) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error(`\nError fetching photos:`, err.message);
      hasMore = false;
    }
  }

  // Write to cache file
  const writeStream = fs.createWriteStream(CACHE_FILE);
  for (const id of existingIds) {
    writeStream.write(id + '\n');
  }
  writeStream.end();

  console.log(`\n\n${'='.repeat(50)}`);
  console.log('EXPORT COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total unique document IDs: ${existingIds.size.toLocaleString()}`);
  console.log(`Cache saved to: ${CACHE_FILE}`);
}

// Load existing IDs from cache
async function loadExistingIds() {
  if (!fs.existsSync(CACHE_FILE)) {
    console.error('Cache file not found. Run with --export first.');
    console.error(`Expected: ${CACHE_FILE}`);
    process.exit(1);
  }

  console.log('Loading existing IDs from cache...');
  const existingIds = new Set();

  const rl = readline.createInterface({
    input: fs.createReadStream(CACHE_FILE),
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

// Recursively get all files
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

// Check folder for duplicates
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
  const newFilesList = [];
  const duplicatesList = [];

  for (const filePath of walkDir(folderPath)) {
    const id = extractId(filePath);
    totalFiles++;

    if (existingIds.has(id)) {
      duplicates++;
      if (duplicatesList.length < 20) duplicatesList.push(filePath);
    } else {
      newFiles++;
      if (newFilesList.length < 20) newFilesList.push(filePath);
    }

    if (totalFiles % 5000 === 0) {
      process.stdout.write(`\rScanned: ${totalFiles.toLocaleString()} | Duplicates: ${duplicates.toLocaleString()} | New: ${newFiles.toLocaleString()}`);
    }
  }

  // Save new files list
  const resultsDir = path.join(__dirname, 'duplicate-results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const timestamp = Date.now();
  const newFilesPath = path.join(resultsDir, `new-files-${timestamp}.txt`);
  const dupFilesPath = path.join(resultsDir, `duplicates-${timestamp}.txt`);

  const newStream = fs.createWriteStream(newFilesPath);
  const dupStream = fs.createWriteStream(dupFilesPath);

  for (const filePath of walkDir(folderPath)) {
    const id = extractId(filePath);
    if (existingIds.has(id)) {
      dupStream.write(filePath + '\n');
    } else {
      newStream.write(filePath + '\n');
    }
  }
  newStream.end();
  dupStream.end();

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('DUPLICATE CHECK RESULTS');
  console.log('='.repeat(60));
  console.log(`Total local files:      ${totalFiles.toLocaleString()}`);
  console.log(`Already in database:    ${duplicates.toLocaleString()} (duplicates - skip these)`);
  console.log(`NEW files to upload:    ${newFiles.toLocaleString()}`);
  console.log(`Duplicate rate:         ${((duplicates / totalFiles) * 100).toFixed(2)}%`);
  console.log('');
  console.log(`New files list:         ${newFilesPath}`);
  console.log(`Duplicates list:        ${dupFilesPath}`);

  if (newFilesList.length > 0) {
    console.log(`\nSample NEW files:`);
    newFilesList.slice(0, 10).forEach(f => console.log(`  + ${path.basename(f)}`));
  }

  if (duplicatesList.length > 0) {
    console.log(`\nSample DUPLICATE files:`);
    duplicatesList.slice(0, 10).forEach(f => console.log(`  - ${path.basename(f)}`));
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Duplicate Checker for ChatFiles.org

Usage:
  node check-duplicates-db.js --export           Export IDs from database (run first)
  node check-duplicates-db.js --check <folder>   Check folder for duplicates

Examples:
  node scripts/check-duplicates-db.js --export
  node scripts/check-duplicates-db.js --check /home/ai/Desktop/DataSet_10
`);
    return;
  }

  if (args[0] === '--export') {
    await exportFromDatabase();
  } else if (args[0] === '--check' && args[1]) {
    await checkFolder(args[1]);
  } else {
    console.error('Invalid arguments. Use --help for usage.');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
