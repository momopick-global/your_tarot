"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthReturnRedirect } from "@/components/AuthReturnRedirect";
import { useUser } from "@/hooks/useUser";
import { loginUrlWithReturnTo, MYPAGE_PATH } from "@/lib/authReturnPath";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteFrame({
  children,
  hideFooter,
}: Readonly<{
  children: React.ReactNode;
  hideFooter?: boolean;
}>) {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const hideHeader = pathname?.startsWith("/page_07_reading-result_typea");
  const mypageHref = user ? MYPAGE_PATH : loginUrlWithReturnTo(MYPAGE_PATH);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMenuMounted, setIsMenuMounted] = React.useState(false);
  const [isMenuActive, setIsMenuActive] = React.useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  React.useEffect(() => {
    if (isMenuOpen) {
      setIsMenuMounted(true);
      const timeoutId = window.setTimeout(() => setIsMenuActive(true), 16);
      return () => window.clearTimeout(timeoutId);
    }

    setIsMenuActive(false);
    const timeoutId = window.setTimeout(() => setIsMenuMounted(false), 280);
    return () => window.clearTimeout(timeoutId);
  }, [isMenuOpen]);

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen w-full bg-[#202139] text-neutral-10">
      <AuthReturnRedirect />
      {!hideHeader ? <Header onMenuClick={() => setIsMenuOpen(true)} /> : null}
      <div className="min-h-[1px]">{children}</div>
      {!hideFooter ? (
        <>
          <div className="mx-auto h-[20px] w-full max-w-[390px] bg-[#17182E]" />
          <Footer />
        </>
      ) : null}

      {isMenuMounted ? (
        <div
          className="fixed inset-0 z-50"
          aria-hidden={!isMenuOpen}
        >
          <div className="mx-auto h-full w-full max-w-[390px] overflow-hidden">
            <div className="relative h-full w-full">
              <button
                type="button"
                onClick={closeMenu}
                className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
                  isMenuActive ? "opacity-100" : "opacity-0"
                }`}
                aria-label="메뉴 닫기"
              />

              <aside
                className={`absolute left-0 top-0 h-full w-[82%] max-w-[330px] bg-neutral-10 p-6 text-neutral-90 shadow-2xl transition-transform duration-300 ${
                  isMenuActive ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <button
                  type="button"
                  onClick={closeMenu}
                  className="absolute left-0 top-0 grid h-[42px] w-[42px] place-items-center bg-transparent"
                  aria-label="메뉴 닫기"
                >
                  <span className="text-[16px] leading-none">×</span>
                </button>
                <div className="relative flex items-center justify-center">
                  <div className="text-[22px] font-semibold">YourTarot</div>
                </div>

                <nav className="mt-8 space-y-5 text-[18px] font-semibold">
                  <Link href="/page_01_masters_list_1" onClick={closeMenu} className="block">
                    오늘의 운세 보기
                  </Link>
                  <Link href="/about" onClick={closeMenu} className="block">
                    서비스 소개
                  </Link>
                  <Link href="/masters" onClick={closeMenu} className="block">
                    타로 마스터 소개
                  </Link>
                  <Link href="/recommended" onClick={closeMenu} className="block">
                    의견 받아요
                  </Link>
                  <Link href="/partner" onClick={closeMenu} className="block">
                    제휴 문의
                  </Link>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        void logout();
                      }}
                      className="block text-left"
                    >
                      로그아웃
                    </button>
                  ) : (
                    <Link href="/login" onClick={closeMenu} className="block">
                      로그인
                    </Link>
                  )}
                  <Link href={mypageHref} onClick={closeMenu} className="block">
                    마이페이지
                  </Link>
                </nav>

                <div className="mt-8 border-t border-neutral-30 pt-4 text-[16px] text-neutral-60">
                  <Link href="/terms" onClick={closeMenu} className="hover:underline">
                    이용약관
                  </Link>
                  {" · "}
                  <Link href="/personal" onClick={closeMenu} className="hover:underline">
                    개인정보처리방침
                  </Link>
                  {" · "}
                  <Link href="/disclaimer" onClick={closeMenu} className="hover:underline">
                    면책조항
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

