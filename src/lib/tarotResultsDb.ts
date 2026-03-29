import type { CardReadingJson } from "@/lib/cardReadingTypes";
import { getSupabaseClient } from "@/lib/supabase";

/** Supabase `tarot_results` 행 (bigint id는 JSON에서 string으로 올 수 있음) */
export type TarotResultRow = {
  id: number | string;
  user_id: string;
  reading_id: string;
  card_name: string;
  master_name: string;
  card_image: string;
  interpretation: string | null;
  created_at: string;
};

/** DB upsert용 — (user_id, reading_id) 유니크와 동일 규칙 */
export function buildTarotReadingId(masterId: string, cardIndex: number): string {
  const n = Math.min(77, Math.max(0, Math.floor(cardIndex)));
  return `v1:${masterId}:${n}`;
}

function normalizeId(id: number | string): string {
  return String(id);
}

/** 카드 이미지 경로에서 카드 인덱스 (0~77) 추출 */
export function cardIndexFromStoredImagePath(path: string): number {
  const m = /\/(\d+)\.(png|webp)(?:\?.*)?$/i.exec(path);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? Math.min(77, Math.max(0, n)) : 0;
}

/** DB `interpretation` 컬럼용 텍스트 */
export function buildInterpretationText(reading: CardReadingJson): string {
  const lines: string[] = [];
  lines.push(`[요약]\n${reading.summary}`);
  lines.push(`\n[업무/학업]\n${reading.categories.work}`);
  lines.push(`\n[애정]\n${reading.categories.love}`);
  lines.push(`\n[금전]\n${reading.categories.money}`);
  if (reading.advice.quote) lines.push(`\n[오늘의 문장]\n${reading.advice.quote}`);
  lines.push(`\n[행운의 아이템]\n${reading.advice.luckyItem || "—"}`);
  lines.push(`\n[행운의 장소]\n${reading.advice.luckyPlace || "—"}`);
  lines.push(`\n[주의할 점]\n${reading.advice.caution || "—"}`);
  if (reading.keywords.length) lines.push(`\n[키워드]\n${reading.keywords.join(" · ")}`);
  return lines.join("\n");
}

/**
 * (user_id, reading_id) 충돌 시 해석·카드 메타를 갱신(upsert).
 * 마이그레이션 전 DB에는 reading_id/유니크가 없을 수 있음 → 그때는 에러가 나므로 SQL 마이그레이션을 먼저 적용하세요.
 */
export async function upsertTarotResult(input: {
  userId: string;
  readingId: string;
  cardName: string;
  masterName: string;
  cardImage: string;
  interpretation: string;
}): Promise<{ data: { id: number | string } | null; error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: new Error("Supabase가 설정되지 않았습니다.") };
  }

  const row = {
    user_id: input.userId,
    reading_id: input.readingId,
    card_name: input.cardName,
    master_name: input.masterName,
    card_image: input.cardImage,
    interpretation: input.interpretation,
  };

  const { data, error } = await supabase
    .from("tarot_results")
    .upsert(row, { onConflict: "user_id,reading_id" })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as { id: number | string }, error: null };
}

export async function fetchTarotResultsForUser(userId: string): Promise<{
  data: TarotResultRow[];
  error: Error | null;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: [], error: new Error("Supabase가 설정되지 않았습니다.") };
  }

  const { data, error } = await supabase
    .from("tarot_results")
    .select("id,user_id,reading_id,card_name,master_name,card_image,interpretation,created_at")
    .eq("user_id", userId)
    /** 결과 페이지 「저장하기」로 쌓인 행만 (`v1:{masterId}:{card}`). 마이그레이션 백필 `migrated:*` 등 제외 */
    .like("reading_id", "v1:%")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  return { data: (data ?? []) as TarotResultRow[], error: null };
}

export async function deleteTarotResultById(
  id: number | string,
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: new Error("Supabase가 설정되지 않았습니다.") };
  }

  const { error } = await supabase.from("tarot_results").delete().eq("id", normalizeId(id));

  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}

export async function deleteAllTarotResultsForUser(userId: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: new Error("Supabase가 설정되지 않았습니다.") };
  }

  const { error } = await supabase.from("tarot_results").delete().eq("user_id", userId);

  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}
