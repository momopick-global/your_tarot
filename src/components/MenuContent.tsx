"use client";

import Link from "next/link";

export function MenuContent({
  mypageHref,
  onLinkClick,
}: Readonly<{
  mypageHref: string;
  onLinkClick?: () => void;
}>) {
  return (
    <>
      <div className="mt-2 flex items-center">
        <div className="text-[22px] font-semibold">YourTarot</div>
      </div>

      <div className="mt-[30px] space-y-7">
        <div className="space-y-3">
          <Link href="/page_01_masters_list_1" onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>🔮</span>
            오늘의 운세 보기
          </Link>
        </div>

        <div className="space-y-3">
          <Link href="/about" onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>✨</span>
            서비스 소개
          </Link>
          <Link href="/masters" onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>👤</span>
            타로 마스터 소개
          </Link>
        </div>

        <div className="space-y-3">
          <Link href="/recommended" onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>💬</span>
            의견 받아요
          </Link>
          <Link href="/partner" onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>🤝</span>
            제휴 문의
          </Link>
        </div>

        <div className="space-y-3">
          <Link href="/login" onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>🔑</span>
            로그인
          </Link>
          <Link href={mypageHref} onClick={onLinkClick} className="flex items-center gap-3 text-[18px] font-semibold">
            <span aria-hidden>🏠</span>
            마이페이지
          </Link>
        </div>

        <div className="mt-6 pt-2 text-[16px] text-neutral-60">
          <Link href="/terms" onClick={onLinkClick} className="hover:underline">
            이용약관
          </Link>
          {" · "}
          <Link href="/personal" onClick={onLinkClick} className="hover:underline">
            개인정보처리방침
          </Link>
          {" · "}
          <Link href="/disclaimer" onClick={onLinkClick} className="hover:underline">
            면책조항
          </Link>
        </div>
      </div>

      <div className="mt-16 text-[16px]">
        <div className="text-neutral-60">😄</div>
        <Link href={mypageHref} onClick={onLinkClick} className="mt-1 inline-block">
          탈퇴하기
        </Link>
      </div>
    </>
  );
}
