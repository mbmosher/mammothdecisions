// build.js — Mammoth build script
// Runs on Cloudflare Pages before deployment.
// Reads index.html, injects environment variables, writes dist/index.html.
// Exits non-zero on any error so Cloudflare fails the build visibly.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// ── 1. Require both env vars ──────────────────────────────────────────────────

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missing = REQUIRED.filter(k => !process.env[k] || process.env[k].trim() === '');

if (missing.length > 0) {
  console.error('\n[build] FATAL: The following environment variables are missing or empty:');
  missing.forEach(k => console.error(`  • ${k}`));
  console.error('\nSet them in Cloudflare Pages → Settings → Environment variables,');
  console.error('for both the Production and Preview environments.');
  console.error('Build aborted.\n');
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL.trim();
const SUPABASE_KEY = process.env.SUPABASE_KEY.trim();

// ── 2. Read source HTML ───────────────────────────────────────────────────────

let html;
try {
  html = readFileSync('index.html', 'utf8');
} catch (err) {
  console.error('\n[build] FATAL: Could not read index.html from the repository root.');
  console.error(`  ${err.message}`);
  console.error('Build aborted.\n');
  process.exit(1);
}

// ── 3. Verify every placeholder is present before touching anything ───────────

const PLACEHOLDERS = {
  '%%SUPABASE_URL%%': SUPABASE_URL,
  '%%SUPABASE_KEY%%': SUPABASE_KEY,
};

const notFound = Object.keys(PLACEHOLDERS).filter(p => !html.includes(p));

if (notFound.length > 0) {
  console.error('\n[build] FATAL: The following placeholders were not found in index.html:');
  notFound.forEach(p => console.error(`  • ${p}`));
  console.error('\nThis means a placeholder was accidentally removed from the source file.');
  console.error('Restore the placeholder in index.html and try again.');
  console.error('Build aborted.\n');
  process.exit(1);
}

// ── 4. Inject values ─────────────────────────────────────────────────────────

let output = html;
for (const [placeholder, value] of Object.entries(PLACEHOLDERS)) {
  // replaceAll via split/join — no regex, so special characters in values are safe
  output = output.split(placeholder).join(value);
}

// ── 5. Write dist/index.html ─────────────────────────────────────────────────

try {
  mkdirSync('dist', { recursive: true });
  writeFileSync('dist/index.html', output, 'utf8');
} catch (err) {
  console.error('\n[build] FATAL: Could not write dist/index.html.');
  console.error(`  ${err.message}`);
  console.error('Build aborted.\n');
  process.exit(1);
}

// ── 6. Confirm ───────────────────────────────────────────────────────────────

console.log('[build] Placeholders injected:');
Object.keys(PLACEHOLDERS).forEach(p => console.log(`  ✓ ${p}`));
console.log('[build] Output written to dist/index.html');
console.log('[build] Build complete.');
