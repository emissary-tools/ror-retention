// A preview served at / and a canonical app mounted at /retention/ must
// both be able to load the SAME Worker asset bundle. Absolute /retention/
// assets break the preview; absolute /assets/ references break the canonical
// router prefix. Relative ./assets/ works at both mount points.
//
// Run after "npm run build". This check examines real compiled HTML.
import { readFile, readdir, stat, access } from 'node:fs/promises';
import path from 'node:path';

async function listHtml(dir, depth = 0) {
  if (depth > 4) return [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const output = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === 'index.html') output.push(full);
    if (entry.isDirectory()) output.push(...await listHtml(full, depth + 1));
  }
  return output;
}

const files = await listHtml('dist');
if (files.length !== 1) {
  throw new Error(`Expected exactly one compiled index.html under dist, found ${files.length}`);
}
const index = files[0];
const html = await readFile(index, 'utf8');
const references = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)]
  .map(match => match[1])
  .filter(value => /\.(?:js|css)(?:\?|$)/.test(value));

if (!references.some(value => /\.js(?:\?|$)/.test(value))) {
  throw new Error('Compiled HTML contains no JS bundle reference');
}
for (const ref of references) {
  if (!ref.startsWith('./assets/')) {
    throw new Error(`Asset reference is not portable between mounts: ${ref}`);
  }
  const target = path.join(path.dirname(index), ref.split('?')[0]);
  await access(target).catch(() => { throw new Error(`Compiled bundle not found at ${target}`); });
  if (!(await stat(target)).isFile()) throw new Error(`Compiled bundle is not a file: ${target}`);
}
process.stdout.write(`Verified ${references.length} compiled JS/CSS assets use relative URLs: ${index}\n`);
