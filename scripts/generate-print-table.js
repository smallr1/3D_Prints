#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const printDir = path.join(projectRoot, 'print_files');
const indexPath = path.join(projectRoot, 'index.html');

if (!fs.existsSync(printDir)) {
  console.error('print_files directory not found:', printDir);
  process.exit(1);
}

const entries = fs.readdirSync(printDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const escapeHtml = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const rows = entries.map(name => {
  const link = `print_files/${encodeURIComponent(name)}/`;
  return `<tr><td>${escapeHtml(name)}</td><td><a href="${link}">${link}</a></td><td class="notes"></td></tr>`;
}).join('\n');

let html = fs.readFileSync(indexPath, 'utf8');

// Replace the marker between PRINT_FILES_ROWS and PRINT_FILES_TABLE_END (or just the marker) with generated rows
if (html.includes('<!-- PRINT_FILES_ROWS -->')) {
  html = html.replace('<!-- PRINT_FILES_ROWS -->', `<!-- PRINT_FILES_ROWS -->\n${rows}`);
  fs.writeFileSync(indexPath, html, 'utf8');
  fs.writeFileSync(path.join(printDir, 'list.json'), JSON.stringify(entries, null, 2), 'utf8');
  console.log('index.html updated and print_files/list.json written.');
} else {
  console.error('Marker <!-- PRINT_FILES_ROWS --> not found in index.html');
  process.exit(1);
}
