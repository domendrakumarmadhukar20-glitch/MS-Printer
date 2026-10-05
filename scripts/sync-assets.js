import fs from 'fs';
import path from 'path';

const distAssets = path.resolve('dist/assets');
const rootAssets = path.resolve('assets');
const publicAssets = path.resolve('public/assets');

if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) fs.mkdirSync(rootAssets, { recursive: true });
  if (!fs.existsSync(publicAssets)) fs.mkdirSync(publicAssets, { recursive: true });

  const files = fs.readdirSync(distAssets);
  for (const file of files) {
    fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
    fs.copyFileSync(path.join(distAssets, file), path.join(publicAssets, file));
  }
  console.log(`[Sync] Copied ${files.length} production assets to /assets and /public/assets for Hostinger`);
}

// Copy .htaccess to dist
const htaccessPath = path.resolve('public/.htaccess');
if (fs.existsSync(htaccessPath)) {
  fs.copyFileSync(htaccessPath, path.resolve('dist/.htaccess'));
  fs.copyFileSync(htaccessPath, path.resolve('.htaccess'));
  console.log('[Sync] Synchronized .htaccess with cache-prevention headers');
}

// Copy manifest.json to dist
const manifestPath = path.resolve('public/manifest.json');
if (fs.existsSync(manifestPath)) {
  fs.copyFileSync(manifestPath, path.resolve('dist/manifest.json'));
}

// Add cache buster query version to dist/index.html and root index.html so Hostinger CDN cannot serve stale cache
const distIndexHtml = path.resolve('dist/index.html');
const rootIndexHtml = path.resolve('index.html');
const v = Date.now();

if (fs.existsSync(distIndexHtml)) {
  let html = fs.readFileSync(distIndexHtml, 'utf8');
  html = html.replace(/\/assets\/index\.js(\?v=[^"']*)?/g, `/assets/index.js?v=${v}`);
  html = html.replace(/\/assets\/index\.css(\?v=[^"']*)?/g, `/assets/index.css?v=${v}`);
  fs.writeFileSync(distIndexHtml, html, 'utf8');
  console.log(`[Sync] Injected clean cache-buster ?v=${v} into dist/index.html`);
}

if (fs.existsSync(rootIndexHtml)) {
  let html = fs.readFileSync(rootIndexHtml, 'utf8');
  html = html.replace(/\/assets\/index\.js(\?v=[^"']*)?/g, `/assets/index.js?v=${v}`);
  html = html.replace(/\/assets\/index\.css(\?v=[^"']*)?/g, `/assets/index.css?v=${v}`);
  fs.writeFileSync(rootIndexHtml, html, 'utf8');
  console.log(`[Sync] Injected clean cache-buster ?v=${v} into root index.html`);
}
