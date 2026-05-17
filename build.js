// build.js — run by Cloudflare Pages before deployment
// Reads env vars, injects into HTML, writes dist/index.html

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set.');
  process.exit(1);
}

const src = readFileSync('mammoth_rewritten.html', 'utf8');
const out = src
  .replace(/%%SUPABASE_URL%%/g, url)
  .replace(/%%SUPABASE_KEY%%/g, key);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', out);
console.log('Build complete → dist/index.html');
