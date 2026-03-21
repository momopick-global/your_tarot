"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Master } from "@/lib/flowData";

export function MasterIntroPopup({
  master,
  onCardReceive,
  /** 진입 후 팝업을 보이기까지 대기 (ms). 0이면 즉시 */
  openDelayMs = 1000,
}: Readonly<{
  master: Master;
  onCardReceive?: () => void;
  openDelayMs?: number;
}>) {
  const [open, setOpen] = useState(true);
  const [delayPassed, setDelayPassed] = useState(openDelayMs <= 0);

  useEffect(() => {
    if (openDelayMs <= 0) return;
    const id = window.setTimeout(() => setDelayPassed(true), openDelayMs);
    return () => window.clearTimeout(id);
  }, [openDelayMs]);

  if (!open || !delayPassed) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-5" role="dialog" aria-modal="true">
      {/* 배경 탭으로 닫히지 않음 — 카드받기 / 마스터 선택으로만 진행 */}
      <div className="absolute inset-0 bg-[rgba(2,1,10,0.55)] backdrop-blur-[3px]" aria-hidden />
      <div className="relative z-10 w-full max-w-[350px] rounded-xl border border-primary bg-[rgba(9,7,28,0.94)] p-4 text-white shadow-2xl">
        <div className="min-w-0 text-[14px] leading-[1.6] text-white">
          별들은 이미 답을 알고 있습니다.
          <br />
          이제 당신의 카드를 확인해 봅시다.
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (onCardReceive) {
                setOpen(false);
                onCardReceive();
                return;
              }
              window.location.href = `/page_05_masters_list5?master=${master.id}&card=40`;
            }}
            className="rounded-lg bg-[#6422AB] px-3 py-2 text-center text-[16px] font-semibold"
          >
            카드받기
          </button>
          <Link
            href="/page_01_masters_list_1"
            className="rounded-lg border border-primary px-3 py-2 text-center text-[16px] text-[#d6cbff]"
          >
            마스터 선택
          </Link>
        </div>
      </div>
    </div>
  );
}

