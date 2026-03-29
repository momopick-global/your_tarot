"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthReturnRedirect } from "@/components/AuthReturnRedirect";
import { MenuContent } from "@/components/MenuContent";
import { MYPAGE_PATH } from "@/lib/authReturnPath";
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
  const hideHeader =
    pathname?.startsWith("/tarot/draw") ||
    pathname?.startsWith("/page_07_reading-result_typea") ||
    pathname?.startsWith("/page_03_card-selection_1");
  const hideFooterByPath =
    pathname?.startsWith("/tarot/draw") ||
    pathname?.startsWith("/tarot/analyze") ||
    pathname?.startsWith("/page_03_card-selection_1") ||
    pathname?.startsWith("/page_06_analyzing");
  const mypageHref = MYPAGE_PATH;
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
      {!hideFooter && !hideFooterByPath ? (
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
                className={`absolute left-0 top-0 h-full w-[82%] max-w-[330px] overflow-y-auto bg-neutral-10 px-6 py-10 text-neutral-90 shadow-2xl transition-transform duration-300 ${
                  isMenuActive ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <button
                  type="button"
                  onClick={closeMenu}
                  className="absolute left-0 top-0 grid h-[42px] w-[42px] place-items-center bg-transparent"
                  aria-label="메뉴 닫기"
                >
                  <span className="inline-block origin-center scale-150 text-[16px] leading-none">×</span>
                </button>
                <MenuContent mypageHref={mypageHref} onLinkClick={closeMenu} />
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

