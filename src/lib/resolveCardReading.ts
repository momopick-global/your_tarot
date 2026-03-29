import type { CardReadingJson } from "@/lib/cardReadingTypes";
import { getCardResultById } from "@/lib/flowData";

import cassian from "@/data/readings/cassian.json";
import aiden from "@/data/readings/aiden.json";
import morgana from "@/data/readings/morgana.json";
import noa from "@/data/readings/noa.json";
import erebus from "@/data/readings/erebus.json";
import serina from "@/data/readings/serina.json";
import nyx from "@/data/readings/nyx.json";
import clotho from "@/data/readings/clotho.json";
import pipi from "@/data/readings/pipi.json";

type PartialEntry = Partial<{
  titleEn: string;
  titleKo: string;
  cardSubtitle: string;
  summary: string;
  categories: Partial<CardReadingJson["categories"]>;
  advice: Partial<CardReadingJson["advice"]>;
  keywords: string[];
}>;

const POOL: Record<string, Record<string, PartialEntry>> = {
  cassian: cassian as Record<string, PartialEntry>,
  aiden: aiden as Record<string, PartialEntry>,
  morgana: morgana as Record<string, PartialEntry>,
  noa: noa as Record<string, PartialEntry>,
  erebus: erebus as Record<string, PartialEntry>,
  serina: serina as Record<string, PartialEntry>,
  nyx: nyx as Record<string, PartialEntry>,
  clotho: clotho as Record<string, PartialEntry>,
  pipi: pipi as Record<string, PartialEntry>,
};

/** JSON 일부만 있어도 되고, 없는 필드는 기존 getCardResultById + 기본 문구로 채움 */
export function resolveCardReading(masterId: string, cardIndex: number): CardReadingJson {
  const key = String(cardIndex);
  const partial = POOL[masterId]?.[key] ?? {};
  const leg = getCardResultById(key);
  /** 에셋 인덱스(0.webp~77.webp)와 동일 — 첫 장 = 0번 카드 */
  const displayNo = cardIndex;
  const titleKo = partial.titleKo ?? leg.titleKo;
  const titleEn = partial.titleEn ?? leg.titleEn;

  return {
    titleEn,
    titleKo,
    cardSubtitle:
      partial.cardSubtitle ?? `${displayNo}번 카드, ${titleKo}`,
    summary: partial.summary ?? leg.summary,
    categories: {
      work: partial.categories?.work ?? leg.career,
      love: partial.categories?.love ?? leg.love,
      money: partial.categories?.money ?? leg.money,
      relationship: partial.categories?.relationship ?? "",
      health: partial.categories?.health ?? "",
      luck: partial.categories?.luck ?? "",
    },
    advice: {
      quote: partial.advice?.quote ?? "",
      luckyItem: partial.advice?.luckyItem ?? "",
      luckyPlace: partial.advice?.luckyPlace ?? "",
      caution: partial.advice?.caution ?? "",
    },
    keywords: partial.keywords?.length ? partial.keywords : [],
  };
}
