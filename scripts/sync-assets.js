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
