"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

const FALLBACK_COPY = "지금까지 많은 분이 테스트했어요.";

/**
 * Supabase에 `get_public_test_participant_count` RPC가 있으면
 * tarot_results에 저장 이력이 있는 **서로 다른 사용자 수**를 표시합니다.
 * (비로그인·로컬만 저장한 경우는 집계에 안 잡힐 수 있음)
 */
export function HomeParticipantCount() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      queueMicrotask(() => setLabel(FALLBACK_COPY));
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data, error } = await supabase.rpc("get_public_test_participant_count");
      if (cancelled) return;
      if (error || data == null) {
        setLabel(FALLBACK_COPY);
        return;
      }
      const n = typeof data === "number" ? data : Number(data);
      if (!Number.isFinite(n) || n < 0) {
        setLabel(FALLBACK_COPY);
        return;
      }
      if (n === 0) {
        setLabel("첫 번째로 테스트해 보세요!");
        return;
      }
      setLabel(`지금까지 ${n.toLocaleString("ko-KR")}명이 테스트했어요.`);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p className="mb-[40px] mt-5 min-h-[24px] text-center text-[16px] text-white">
      {label ?? " "}
    </p>
  );
}
