"use client";

import Link from "next/link";
import { withAssetBase } from "@/lib/publicPath";

export function MenuContent({
  mypageHref,
  onLinkClick,
}: Readonly<{
  mypageHref: string;
  onLinkClick?: () => void;
}>) {
  const blogHref = withAssetBase("/blog/index.html");

  const navLinkClass =
    "flex items-center gap-3 text-[18px] font-semibold text-neutral-90 transition-colors hover:text-primary";

  return (
    <>
      <div className="mt-2 flex items-center">
        <div className="text-[22px] font-semibold">YourTarot</div>
      </div>

      <div className="mt-[30px] space-y-7">
        <div className="space-y-3">
          <Link href="/tarot/start" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>🔮</span>
            오늘의 운세 보기
          </Link>
        </div>

        <div className="space-y-3">
          <Link href="/about" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>✨</span>
            서비스 소개
          </Link>
          <Link href="/faq/" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>❓</span>
            자주 묻는 질문
          </Link>
          <Link href={blogHref} onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>📝</span>
            블로그
          </Link>
          <Link href="/masters" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>👤</span>
            타로 마스터 소개
          </Link>
        </div>

        <div className="space-y-3">
          <Link href="/recommended" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>💬</span>
            서비스 개선 의견 보내기
          </Link>
          <Link href="/partner" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>🤝</span>
            제휴 문의
          </Link>
        </div>

        <div className="space-y-3">
          <Link href="/login" onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>🔑</span>
            로그인
          </Link>
          <Link href={mypageHref} onClick={onLinkClick} className={navLinkClass}>
            <span aria-hidden>🏠</span>
            마이페이지
          </Link>
        </div>

        <div className="mt-6 pt-2 text-[16px] text-neutral-60">
          <Link href="/terms" onClick={onLinkClick} className="transition-colors hover:text-primary hover:underline">
            이용약관
          </Link>
          {" · "}
          <Link href="/personal" onClick={onLinkClick} className="transition-colors hover:text-primary hover:underline">
            개인정보처리방침
          </Link>
          {" · "}
          <Link href="/disclaimer" onClick={onLinkClick} className="transition-colors hover:text-primary hover:underline">
            면책조항
          </Link>
        </div>
      </div>

      <div className="mt-16 text-[16px]">
        <div className="text-neutral-60">😄</div>
        <Link
          href={mypageHref}
          onClick={onLinkClick}
          className="mt-1 inline-block text-neutral-90 transition-colors hover:text-primary"
        >
          탈퇴하기
        </Link>
      </div>
    </>
  );
}
