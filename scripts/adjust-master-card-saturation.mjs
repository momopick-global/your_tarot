/**
 * 테스트용: 01_Cassian 은 건드리지 않고, 02~09 마스터 폴더의 WebP에만
 * 폴더마다 다른 채도(saturation)를 적용합니다.
 *
 * sharp saturation: 1 = 원본, 0에 가까울수록 무채색, 1보다 크면 채도 상승
 *
 * ⚠️ 같은 폴더에 두 번 실행하면 효과가 누적됩니다. 원본으로 되돌리려면
 *    카시안에서 다시 복사하세요.
 *
 * 실행: node scripts/adjust-master-card-saturation.mjs
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "cards");

/** 마스터별 채도 (서로 다르게 보이도록) */
const MASTERS = [
  { dir: "02_Aiden", saturation: 0.72 },
  { dir: "03_Morgana", saturation: 0.88 },
  { dir: "04_Noa", saturation: 1.08 },
  { dir: "05_Erebus", saturation: 1.24 },
  { dir: "06_Serena", saturation: 0.62 },
  { dir: "07_Nyx", saturation: 1.38 },
  { dir: "08_Clotho", saturation: 0.95 },
  { dir: "09_Pipi", saturation: 1.15 },
];

async function main() {
  for (const { dir, saturation } of MASTERS) {
    const folder = path.join(root, dir);
    let names;
    try {
      names = (await fs.readdir(folder)).filter((n) => n.endsWith(".webp"));
    } catch (e) {
      console.warn(`skip ${dir}:`, e.message);
      continue;
    }
    console.log(`${dir}: ${names.length} files → saturation ${saturation}`);
    for (const name of names) {
      const input = path.join(folder, name);
      const tmp = path.join(folder, `.__tmp_${name}`);
      await sharp(input).modulate({ saturation }).webp({ quality: 88 }).toFile(tmp);
      await fs.rename(tmp, input);
    }
  }
  console.log("done (01_Cassian unchanged)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
