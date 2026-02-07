#!/usr/bin/env node
/**
 * Fast Duplicate Checker for ChatFiles.org
 *
 * Requires DATABASE_URL environment variable
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node scripts/check-duplicates-fast.js --export
 *   DATABASE_URL="postgres://..." node scripts/check-duplicates-fast.js --check /path/to/folder
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CACHE_FILE = path.join(__dirname, 'all-document-ids.txt');

// Extract ID from filename
function extractId(filename) {
  const base = path.basename(filename);
  const match = base.match(/^(EFTA\d+)/i);
  return match ? match[1].toUpperCase() : base.replace(/\.[^.]+$/, '').toUpperCase();
}

// Export all IDs from database
async function exportIds() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable required');
    console.error('Usage: DATABASE_URL="postgres://..." node check-duplicates-fast.js --export');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  console.log('Connecting to database...');
  console.log('Fetching all document IDs (this handles millions efficiently)...\n');

  try {
    // Get all document IDs in one query
    const result = await pool.query('SELECT id FROM documents');

    console.log(`Found ${result.rows.length.toLocaleString()} documents in database`);

    // Write to file
    const stream = fs.createWriteStream(CACHE_FILE);
    for (const row of result.rows) {
      stream.write(row.id.toUpperCase() + '\n');
    }
    stream.end();

    console.log(`\nCache saved to: ${CACHE_FILE}`);
    console.log(`Total IDs: ${result.rows.length.toLocaleString()}`);

  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await pool.end();
  }
}

// Load IDs from cache
async function loadIds() {
  if (!fs.existsSync(CACHE_FILE)) {
    console.error(`Cache file not found: ${CACHE_FILE}`);
    console.error('Run --export first');
    process.exit(1);
  }

  const ids = new Set();
  const rl = readline.createInterface({
    input: fs.createReadStream(CACHE_FILE),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) ids.add(line.trim());
  }

  return ids;
}

// Walk directory
function* walkDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        yield* walkDir(fullPath);
      } else {
        yield fullPath;
      }
    }
  } catch (err) {
    console.error(`Cannot read ${dir}: ${err.message}`);
  }
}

// Check folder
async function checkFolder(folderPath) {
  console.log('Loading existing IDs...');
  const existingIds = await loadIds();
  console.log(`Loaded ${existingIds.size.toLocaleString()} IDs\n`);

  console.log(`Scanning: ${folderPath}\n`);

  let total = 0, dups = 0, newCount = 0;
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

  const newStream = fs.createWriteStream(path.join(resultsDir, 'new-files.txt'));
  const dupStream = fs.createWriteStream(path.join(resultsDir, 'duplicate-files.txt'));

  for (const file of walkDir(folderPath)) {
    const id = extractId(file);
    total++;

    if (existingIds.has(id)) {
      dups++;
      dupStream.write(file + '\n');
    } else {
      newCount++;
      newStream.write(file + '\n');
    }

    if (total % 10000 === 0) {
      process.stdout.write(`\rScanned: ${total.toLocaleString()} | New: ${newCount.toLocaleString()} | Duplicates: ${dups.toLocaleString()}`);
    }
  }

  newStream.end();
  dupStream.end();

  console.log(`\n\n${'='.repeat(50)}`);
  console.log('RESULTS');
  console.log('='.repeat(50));
  console.log(`Total files scanned:  ${total.toLocaleString()}`);
  console.log(`NEW (upload these):   ${newCount.toLocaleString()}`);
  console.log(`DUPLICATES (skip):    ${dups.toLocaleString()}`);
  console.log(`\nResults saved to: ${resultsDir}/`);
}

// Main
const args = process.argv.slice(2);
if (args[0] === '--export') {
  exportIds();
} else if (args[0] === '--check' && args[1]) {
  checkFolder(args[1]);
} else {
  console.log(`
Fast Duplicate Checker

Usage:
  DATABASE_URL="postgres://..." node check-duplicates-fast.js --export
  node check-duplicates-fast.js --check /path/to/folder

Steps:
  1. Run --export with DATABASE_URL to cache all existing IDs
  2. Run --check to compare your local folder against the cache
`);
}
