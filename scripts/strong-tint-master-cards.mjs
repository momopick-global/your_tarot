/**
 * 테스트용: 마스터별 카드 WebP에 색을 과하게 입힘 (01_Cassian 제외)
 * 각 폴더 루트의 *.webp 만 처리 (하위 폴더 예: 원본/ 무시)
 *
 * 실행: node scripts/strong-tint-master-cards.mjs
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "cards");

/** 2번~9번: 폴더명 + RGB + 오버레이 알파(높을수록 색이 더 짙게) */
const TINTS = [
  { dir: "02_Aiden", r: 255, g: 25, b: 40, alpha: 0.88 },
  { dir: "03_Morgana", r: 255, g: 210, b: 15, alpha: 0.86 },
  { dir: "04_Noa", r: 15, g: 220, b: 55, alpha: 0.85 },
  { dir: "05_Erebus", r: 20, g: 80, b: 255, alpha: 0.86 },
  { dir: "06_Serena", r: 180, g: 40, b: 255, alpha: 0.85 },
  { dir: "07_Nyx", r: 255, g: 95, b: 10, alpha: 0.86 },
  { dir: "08_Clotho", r: 120, g: 255, b: 60, alpha: 0.84 },
  { dir: "09_Pipi", r: 50, g: 195, b: 255, alpha: 0.86 },
];

async function processFile(inputPath, tint) {
  const { r, g, b, alpha } = tint;
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error(`bad metadata: ${inputPath}`);

  const overlay = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: {
        r,
        g,
        b,
        alpha,
      },
    },
  })
    .png()
    .toBuffer();

  const tmp = `${inputPath}.__tint_tmp`;
  // 이중 오버레이로 색이 더 과하게 보이게
  await sharp(inputPath)
    .composite([
      { input: overlay, blend: "overlay" },
      { input: overlay, blend: "soft-light" },
    ])
    .webp({ quality: 88 })
    .toFile(tmp);
  await fs.rename(tmp, inputPath);
}

async function main() {
  for (const tint of TINTS) {
    const folder = path.join(root, tint.dir);
    let entries;
    try {
      entries = await fs.readdir(folder, { withFileTypes: true });
    } catch (e) {
      console.warn(`skip ${tint.dir}:`, e.message);
      continue;
    }
    const names = entries.filter((e) => e.isFile() && e.name.endsWith(".webp")).map((e) => e.name);
    console.log(`${tint.dir}: rgb(${tint.r},${tint.g},${tint.b}) alpha=${tint.alpha} → ${names.length} files`);
    for (const name of names) {
      await processFile(path.join(folder, name), tint);
    }
  }
  console.log("done (01_Cassian untouched)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
