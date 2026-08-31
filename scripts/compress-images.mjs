/**
 * Compress all images in public folder - reduces file size without visible quality loss.
 * JPEG: quality 82 | PNG: compressionLevel 9
 */
import sharp from "sharp";
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, "..", "public");
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const JPEG_QUALITY = 82; // Sweet spot: good compression, minimal visible loss
const PNG_COMPRESSION = 9; // Max compression (lossless)

function getAllImages(dir, files = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      getAllImages(fullPath, files);
    } else if (EXTENSIONS.includes(extname(item).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function compressImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const relPath = filePath.replace(PUBLIC_DIR, "").replace(/^\//, "");

  try {
    const origSize = readFileSync(filePath).length;
    let pipeline = sharp(filePath);

    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 85 });
    } else {
      return { skipped: true, relPath };
    }

    const { data } = await pipeline.toBuffer({ resolveWithObject: true });
    const newSize = data.length;

    // Only overwrite if compressed version is smaller
    if (newSize >= origSize) {
      const saved = ((1 - newSize / origSize) * 100).toFixed(1);
      return { relPath, origSize, newSize, saved: `${saved}%`, skipped: true };
    }

    writeFileSync(filePath, data);
    const saved = ((1 - newSize / origSize) * 100).toFixed(1);
    return { relPath, origSize, newSize, saved: `${saved}%` };
  } catch (err) {
    return { error: true, relPath, message: err.message };
  }
}

async function main() {
  const files = getAllImages(PUBLIC_DIR);
  console.log(`\n📷 Compressing ${files.length} images...\n`);

  let totalOrig = 0;
  let totalNew = 0;

  for (const f of files) {
    const result = await compressImage(f);
    if (result.skipped && !result.origSize) continue;
    if (result.error) {
      console.log(`❌ ${result.relPath}: ${result.message}`);
      continue;
    }
    if (result.skipped && result.origSize) {
      console.log(`⏭️  ${result.relPath} — already optimal, skipped`);
      continue;
    }
    totalOrig += result.origSize;
    totalNew += result.newSize;
    const mb = (result.newSize / 1024 / 1024).toFixed(2);
    console.log(`✅ ${result.relPath} — ${result.saved} smaller (${mb} MB)`);
  }

  const totalSaved = totalOrig > 0 ? ((1 - totalNew / totalOrig) * 100).toFixed(1) : 0;
  const origMB = (totalOrig / 1024 / 1024).toFixed(2);
  const newMB = (totalNew / 1024 / 1024).toFixed(2);
  console.log(`\n📦 Total: ${origMB} MB → ${newMB} MB (${totalSaved}% reduction)\n`);
}

main().catch(console.error);
