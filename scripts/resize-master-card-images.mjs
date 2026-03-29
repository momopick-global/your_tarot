/**
 * 마스터 카드 WebP 일괄 리사이즈 (용량·로딩 개선용)
 *
 * 기본: public/images/cards 아래 `NN_Name` 형태 폴더 전부
 * 각 폴더의 루트에 있는 *.webp 만 처리 (하위 폴더 무시 → 예: 01_Cassian/원본 은 건드리지 않음)
 * 환경변수로 조절:
 *   MAX_WIDTH=512          최대 가로(px), 비율 유지. 이미 더 작으면 확대 안 함
 *   ONLY=01_Cassian,02_Aiden   콤마로 특정 폴더만 (비우면 전부)
 *   SKIP=01_Cassian        콤마로 제외
 *
 * 실행:
 *   node scripts/resize-master-card-images.mjs
 *   MAX_WIDTH=640 ONLY=02_Aiden,03_Morgana node scripts/resize-master-card-images.mjs
 *
 * ⚠️ 원본을 덮어씁니다. 백업 후 실행하세요.
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "cards");

const maxWidth = Number(process.env.MAX_WIDTH || "390");
const onlyRaw = process.env.ONLY?.trim();
const skipRaw = process.env.SKIP?.trim();

const onlySet = onlyRaw ? new Set(onlyRaw.split(",").map((s) => s.trim()).filter(Boolean)) : null;
const skipSet = skipRaw ? new Set(skipRaw.split(",").map((s) => s.trim()).filter(Boolean)) : null;

async function listCardFolders() {
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && /^\d{2}_/.test(e.name))
    .map((e) => e.name)
    .sort();
}

async function main() {
  if (!Number.isFinite(maxWidth) || maxWidth < 64) {
    console.error("Invalid MAX_WIDTH");
    process.exit(1);
  }

  let folders = await listCardFolders();
  if (onlySet) folders = folders.filter((f) => onlySet.has(f));
  if (skipSet) folders = folders.filter((f) => !skipSet.has(f));

  console.log(`folders: ${folders.join(", ") || "(none)"}`);
  console.log(`maxWidth: ${maxWidth}px, withoutEnlargement: true`);

  for (const dir of folders) {
    const folder = path.join(root, dir);
    const entries = await fs.readdir(folder, { withFileTypes: true });
    const names = entries.filter((e) => e.isFile() && e.name.endsWith(".webp")).map((e) => e.name);
    console.log(`${dir}: ${names.length} webp (root only)`);

    for (const name of names) {
      const input = path.join(folder, name);
      const tmp = path.join(folder, `.__resize_${name}`);
      await sharp(input)
        .resize({
          width: maxWidth,
          withoutEnlargement: true,
        })
        .webp({ quality: 88 })
        .toFile(tmp);
      await fs.rename(tmp, input);
    }
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
