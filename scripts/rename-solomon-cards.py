#!/usr/bin/env python3
"""
Solomon 카드 PNG → 덱 인덱스 파일명 (0 = The Fool, 유어타로 순서).

- 우선: 이미지 하단 영문 제목 OCR → TAROT_EN 인덱스 (사용자 요청 기준).
- 보조: 하단/전체에서 제목을 못 읽을 때만 상단 번호 상자 OCR.
- OCR이 전혀 안 되는 파일은 MANUAL_INDEX_BY_BASENAME 으로 지정.

동일 인덱스가 2장 이상이면 UUID 순 첫 장만 N.png, 나머지는 N__2.png, N__3.png …

실행: python3 scripts/rename-solomon-cards.py "/path/to/카드06_Solomon_프롬프트"
"""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

# 하단에 글자가 없어 OCR이 실패하는 PNG만, 원본 파일명(UUID) → 인덱스.
MANUAL_INDEX_BY_BASENAME: dict[str, int] = {
    "00c50e3d-98bd-483d-88ed-a7ce0995c753.png": 2,  # The High Priestess (무텍스트 변형)
    "450864ac-fc09-4dc6-817a-345204f59ff0.png": 17,  # The Star (무텍스트 변형)
}

# scripts/fill-dummy-readings.mjs 와 동일 순서 (0 = The Fool)
TAROT_EN = [
    "The Fool",
    "The Magician",
    "The High Priestess",
    "The Empress",
    "The Emperor",
    "The Hierophant",
    "The Lovers",
    "The Chariot",
    "Strength",
    "The Hermit",
    "Wheel of Fortune",
    "Justice",
    "The Hanged Man",
    "Death",
    "Temperance",
    "The Devil",
    "The Tower",
    "The Star",
    "The Moon",
    "The Sun",
    "Judgement",
    "The World",
    "Ace of Wands",
    "Two of Wands",
    "Three of Wands",
    "Four of Wands",
    "Five of Wands",
    "Six of Wands",
    "Seven of Wands",
    "Eight of Wands",
    "Nine of Wands",
    "Ten of Wands",
    "Page of Wands",
    "Knight of Wands",
    "Queen of Wands",
    "King of Wands",
    "Ace of Cups",
    "Two of Cups",
    "Three of Cups",
    "Four of Cups",
    "Five of Cups",
    "Six of Cups",
    "Seven of Cups",
    "Eight of Cups",
    "Nine of Cups",
    "Ten of Cups",
    "Page of Cups",
    "Knight of Cups",
    "Queen of Cups",
    "King of Cups",
    "Ace of Swords",
    "Two of Swords",
    "Three of Swords",
    "Four of Swords",
    "Five of Swords",
    "Six of Swords",
    "Seven of Swords",
    "Eight of Swords",
    "Nine of Swords",
    "Ten of Swords",
    "Page of Swords",
    "Knight of Swords",
    "Queen of Swords",
    "King of Swords",
    "Ace of Pentacles",
    "Two of Pentacles",
    "Three of Pentacles",
    "Four of Pentacles",
    "Five of Pentacles",
    "Six of Pentacles",
    "Seven of Pentacles",
    "Eight of Pentacles",
    "Nine of Pentacles",
    "Ten of Pentacles",
    "Page of Pentacles",
    "Knight of Pentacles",
    "Queen of Pentacles",
    "King of Pentacles",
]


def norm_key(s: str) -> str:
    s = s.upper().strip()
    s = re.sub(r"[^A-Z0-9\s]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s


def fix_ocr_joins(blob: str) -> str:
    blob = norm_key(blob)
    blob = blob.replace("JUDGMENT", "JUDGEMENT")
    for role in ("KNIGHT", "QUEEN", "KING", "PAGE"):
        blob = blob.replace(f"{role}OF ", f"{role} OF ")
        blob = blob.replace(f"{role}OF", f"{role} OF")
    return blob


def best_match(ocr_blob: str) -> tuple[int | None, str | None]:
    blob = fix_ocr_joins(ocr_blob)
    if not blob:
        return None, None
    best_len = 0
    best_idx: int | None = None
    best_name: str | None = None
    for i, en in enumerate(TAROT_EN):
        nk = norm_key(en)
        variants = [nk]
        if nk.startswith("THE "):
            variants.append(nk[4:])
        for variant in variants:
            if not variant:
                continue
            if variant in blob and len(variant) > best_len:
                best_len = len(variant)
                best_idx = i
                best_name = en
    return best_idx, best_name


def ocr_region(reader, im: Image.Image, box: tuple[int, int, int, int]) -> str:
    crop = im.crop(box)
    arr = np.array(crop.convert("RGB"))
    lines = reader.readtext(arr, detail=0, paragraph=False)
    return " ".join(lines) if lines else ""


def parse_top_index(reader, path: Path) -> int | None:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    crop = im.crop((int(w * 0.25), 0, int(w * 0.75), int(h * 0.16)))
    crop = crop.resize((crop.width * 3, crop.height * 3), Image.Resampling.LANCZOS)
    g = ImageEnhance.Contrast(crop.convert("L")).enhance(2.0)
    arr = np.array(g.convert("RGB"))
    raw = reader.readtext(arr, detail=0, allowlist="0123456789", paragraph=False)
    if not raw:
        raw = reader.readtext(arr, detail=0, paragraph=False)
    if not raw:
        return None
    blob = " ".join(raw)
    digits = "".join(re.findall(r"\d+", blob))
    if not digits:
        return None
    for token in re.findall(r"\d+", blob):
        n = int(token)
        if 0 <= n <= 77:
            return n
    n = int(digits)
    if 0 <= n <= 77:
        return n
    if len(digits) >= 2:
        n2 = int(digits[-2:])
        if 0 <= n2 <= 77:
            return n2
    return None


def ocr_bottom(reader, path: Path, frac: float = 0.64) -> str:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    return ocr_region(reader, im, (0, int(h * frac), w, h))


def ocr_full(reader, path: Path) -> str:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    return ocr_region(reader, im, (0, 0, w, h))


def resolve_index(reader, path: Path) -> tuple[int | None, str]:
    base = path.name
    if base in MANUAL_INDEX_BY_BASENAME:
        return MANUAL_INDEX_BY_BASENAME[base], "manual"

    bottom = ocr_bottom(reader, path)
    if not bottom.strip():
        bottom = ocr_full(reader, path)

    by_title, _ = best_match(bottom)
    if by_title is not None:
        return by_title, "title"

    top = parse_top_index(reader, path)
    if top is not None:
        return top, "top"

    return None, bottom[:120]


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: rename-solomon-cards.py <folder>", file=sys.stderr)
        return 1
    folder = Path(sys.argv[1]).expanduser().resolve()
    if not folder.is_dir():
        print(f"Not a directory: {folder}", file=sys.stderr)
        return 1

    import easyocr

    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    pngs = sorted(p for p in folder.glob("*.png") if not re.fullmatch(r"\d+\.png", p.name))

    resolved: list[tuple[Path, int, str]] = []
    failed: list[tuple[Path, str]] = []

    for p in pngs:
        try:
            idx, how = resolve_index(reader, p)
        except Exception as e:
            failed.append((p, str(e)))
            continue
        if idx is None:
            failed.append((p, how))
            continue
        resolved.append((p, idx, how))

    if failed:
        print("--- 실패 ---")
        for p, msg in failed:
            print(f"  {p.name}: {msg!r}")
        print("\nMANUAL_INDEX_BY_BASENAME 에 추가하거나 이미지에 제목/번호를 넣은 뒤 다시 실행하세요.", file=sys.stderr)
        return 2

    by_idx: dict[int, list[Path]] = defaultdict(list)
    for p, idx, _ in resolved:
        by_idx[idx].append(p)
    for idx in by_idx:
        by_idx[idx].sort(key=lambda x: x.name)

    how_by_path = {p: how for p, _, how in resolved}
    idx_by_path = {p: idx for p, idx, _ in resolved}

    plan: list[tuple[Path, str]] = []
    for idx in sorted(by_idx.keys()):
        paths = by_idx[idx]
        for i, p in enumerate(paths):
            if i == 0:
                plan.append((p, f"{idx}.png"))
            else:
                plan.append((p, f"{idx}__{i + 1}.png"))

    for p, final_name in plan:
        i = idx_by_path[p]
        print(f"{p.name} -> {final_name} ({TAROT_EN[i]}) [{how_by_path[p]}]")

    tmp_tag = ".solomon_renaming.png"
    tmp_paths: list[tuple[Path, str]] = []
    for p, final_name in plan:
        tmp = folder / f"{p.stem}{tmp_tag}"
        if tmp.exists():
            tmp.unlink()
        p.rename(tmp)
        tmp_paths.append((tmp, final_name))

    for tmp, final_name in tmp_paths:
        dest = folder / final_name
        if dest.exists() and dest != tmp:
            dest.unlink()
        tmp.rename(dest)

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
