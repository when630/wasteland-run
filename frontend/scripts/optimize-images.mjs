/**
 * 이미지 최적화 스크립트
 * 원본 PNG → 리사이즈 + WebP 변환
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../src/assets/images');
const RAW_DIR = path.join(__dirname, '../src/assets/images-raw');

// ── 카테고리별 변환 규칙 ──────────────────────────────────────

const rules = {
  backgrounds: {
    resize: (filename) => {
      // map_background.png: 세로 스크롤 맵 → 비율 유지, width 1920 제한
      if (filename === 'map_background.png') {
        return { width: 1920, fit: 'inside' };
      }
      // 나머지 배경: 1920x1080 고정
      return { width: 1920, height: 1080, fit: 'fill' };
    },
    webpOptions: { quality: 85, lossless: false },
    kernel: sharp.kernel.lanczos3,
  },
  GUI: {
    resize: () => ({ width: 128, height: 128, fit: 'fill' }),
    webpOptions: { lossless: true },
    kernel: sharp.kernel.nearest,
  },
  characters: {
    resize: () => ({ height: 512, fit: 'inside' }),
    webpOptions: { lossless: true },
    kernel: sharp.kernel.nearest,
  },
  relics: {
    resize: () => ({ width: 256, height: 256, fit: 'fill' }),
    webpOptions: { lossless: true },
    kernel: sharp.kernel.nearest,
  },
  map: {
    resize: () => ({ width: 128, height: 128, fit: 'fill' }),
    webpOptions: { lossless: true },
    kernel: sharp.kernel.nearest,
  },
};

// ── 유틸리티 ──────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getDirectorySize(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return total;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.png')) {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

// ── 메인 처리 ─────────────────────────────────────────────────

async function processCategory(category) {
  const rule = rules[category];
  if (!rule) {
    console.log(`  ⚠ 규칙 없음: ${category}, 건너뜀`);
    return { before: 0, after: 0, count: 0 };
  }

  const srcDir = path.join(RAW_DIR, category);
  const outDir = path.join(IMAGES_DIR, category);

  if (!fs.existsSync(srcDir)) {
    console.log(`  ⚠ 원본 없음: ${srcDir}`);
    return { before: 0, after: 0, count: 0 };
  }

  const pngFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
  let beforeSize = 0;
  let afterSize = 0;

  for (const file of pngFiles) {
    const inputPath = path.join(srcDir, file);
    const outputFile = file.replace(/\.png$/, '.webp');
    const outputPath = path.join(outDir, outputFile);

    const inputStat = fs.statSync(inputPath);
    beforeSize += inputStat.size;

    const resizeOpts = rule.resize(file);

    await sharp(inputPath)
      .resize({
        ...resizeOpts,
        kernel: rule.kernel,
      })
      .webp(rule.webpOptions)
      .toFile(outputPath);

    const outputStat = fs.statSync(outputPath);
    afterSize += outputStat.size;

    console.log(
      `  ${file} → ${outputFile}  (${formatBytes(inputStat.size)} → ${formatBytes(outputStat.size)})`
    );
  }

  return { before: beforeSize, after: afterSize, count: pngFiles.length };
}

async function main() {
  console.log('=== 이미지 최적화 시작 ===\n');

  // 1. images-raw 디렉토리가 없으면 원본 복사
  if (!fs.existsSync(RAW_DIR)) {
    console.log('원본 백업: images/ → images-raw/');
    fs.cpSync(IMAGES_DIR, RAW_DIR, { recursive: true });
    console.log('백업 완료.\n');
  } else {
    console.log('images-raw/ 이미 존재, 기존 백업 사용.\n');
  }

  // 2. 기존 PNG 삭제 (images/ 하위, webp로 대체될 것들)
  const categories = Object.keys(rules);
  for (const cat of categories) {
    const catDir = path.join(IMAGES_DIR, cat);
    if (!fs.existsSync(catDir)) continue;
    for (const file of fs.readdirSync(catDir)) {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(catDir, file));
      }
    }
  }

  // 3. 카테고리별 변환
  let totalBefore = 0;
  let totalAfter = 0;
  let totalCount = 0;

  for (const cat of categories) {
    console.log(`[${cat}]`);
    const result = await processCategory(cat);
    totalBefore += result.before;
    totalAfter += result.after;
    totalCount += result.count;
    console.log(
      `  소계: ${result.count}개, ${formatBytes(result.before)} → ${formatBytes(result.after)}\n`
    );
  }

  // 4. 결과 요약
  const savings = totalBefore - totalAfter;
  const percent = ((savings / totalBefore) * 100).toFixed(1);

  console.log('=== 최적화 완료 ===');
  console.log(`파일 수: ${totalCount}`);
  console.log(`전체: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}`);
  console.log(`절감: ${formatBytes(savings)} (${percent}%)`);
}

main().catch(err => {
  console.error('최적화 실패:', err);
  process.exit(1);
});
