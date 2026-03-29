"use client";

import type { FaqCategory, FaqData, FaqItem } from "@/lib/faqJsonLd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./faq.module.css";

export type { FaqCategory, FaqData, FaqItem } from "@/lib/faqJsonLd";

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

function findItemById(data: FaqData, id: string): { cat: FaqCategory; item: FaqItem } | null {
  for (const cat of data.faq) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return { cat, item };
  }
  return null;
}

/** trailingSlash 대응: `/faq/` */
function faqPathname(): string {
  const raw = `${BASE_PATH}/faq/`.replace(/\/{2,}/g, "/");
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function readHashId(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hash.replace(/^#/, "");
  return h.trim();
}

function readTabSlug(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("tab")?.trim() ?? "";
}

export function FaqView({ data }: Readonly<{ data: FaqData }>) {
  const searchParams = useSearchParams();
  const first = data.faq[0];
  const [activeSlug, setActiveSlug] = useState(first?.slug ?? "");
  const [openItemId, setOpenItemId] = useState<string | null>(first?.items[0]?.id ?? null);
  const hydratedFromUrl = useRef(false);

  const slugSet = useMemo(() => new Set(data.faq.map((c) => c.slug)), [data.faq]);

  const applyUrl = useCallback((slug: string, itemId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.pathname = faqPathname();
    url.search = `?tab=${encodeURIComponent(slug)}`;
    url.hash = itemId ? `#${itemId}` : "";
    window.history.replaceState(null, "", url.toString());
  }, []);

  /**
   * 초기 로드 시 URL 반영: hash(#질문id)가 있으면 해당 카테고리·질문 우선.
   * 그다음 ?tab=slug. 둘 다 없으면 첫 탭·첫 질문(기본).
   * (상태 갱신은 microtask로 한 틱 미뤄 eslint react-hooks/set-state-in-effect 경고를 피함)
   */
  useEffect(() => {
    if (hydratedFromUrl.current) return;
    const tabFromNext = searchParams.get("tab")?.trim() ?? "";
    const hashId = readHashId();
    const tabFromWindow = readTabSlug();
    const tab = tabFromWindow || tabFromNext;

    const apply = () => {
      if (hashId) {
        const found = findItemById(data, hashId);
        if (found) {
          setActiveSlug(found.cat.slug);
          setOpenItemId(found.item.id);
          hydratedFromUrl.current = true;
          return;
        }
      }

      if (tab && slugSet.has(tab)) {
        const cat = data.faq.find((c) => c.slug === tab);
        setActiveSlug(tab);
        setOpenItemId(cat?.items[0]?.id ?? null);
        hydratedFromUrl.current = true;
        return;
      }

      if (first) {
        setActiveSlug(first.slug);
        setOpenItemId(first.items[0]?.id ?? null);
      }
      hydratedFromUrl.current = true;
    };

    queueMicrotask(apply);
  }, [data, first, searchParams, slugSet]);

  useEffect(() => {
    const onPop = () => {
      queueMicrotask(() => {
        const hashId = readHashId();
        const tab = readTabSlug();
        if (hashId) {
          const found = findItemById(data, hashId);
          if (found) {
            setActiveSlug(found.cat.slug);
            setOpenItemId(found.item.id);
            return;
          }
        }
        if (tab && slugSet.has(tab)) {
          const cat = data.faq.find((c) => c.slug === tab);
          setActiveSlug(tab);
          setOpenItemId(cat?.items[0]?.id ?? null);
          return;
        }
        if (first) {
          setActiveSlug(first.slug);
          setOpenItemId(first.items[0]?.id ?? null);
        }
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [data, first, slugSet]);

  const activeCategory = data.faq.find((c) => c.slug === activeSlug) ?? first;

  const onSelectTab = (slug: string) => {
    const cat = data.faq.find((c) => c.slug === slug);
    const firstId = cat?.items[0]?.id ?? null;
    setActiveSlug(slug);
    setOpenItemId(firstId);
    applyUrl(slug, firstId);
  };

  /**
   * 싱글 오픈: openItemId는 항상 하나(또는 null)만 유지.
   * 다른 질문을 열면 이전 id는 덮어써져 자동으로 닫힌다(배열 토글이 아님).
   * 같은 질문 재클릭 시 닫힘(0개 열림 허용).
   */
  const onToggleItem = (itemId: string) => {
    if (openItemId === itemId) {
      setOpenItemId(null);
      applyUrl(activeSlug, null);
      return;
    }
    setOpenItemId(itemId);
    applyUrl(activeSlug, itemId);
  };

  if (!first) {
    return <p className={styles.error}>FAQ 데이터가 없습니다.</p>;
  }

  return (
    <>
      <div className={styles.tabScroll} role="tablist" aria-label="FAQ 카테고리">
        {data.faq.map((cat) => {
          const selected = cat.slug === activeSlug;
          return (
            <button
              key={cat.slug}
              type="button"
              role="tab"
              id={`tab-${cat.slug}`}
              aria-selected={selected}
              aria-controls={`panel-${cat.slug}`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
              onClick={() => onSelectTab(cat.slug)}
            >
              {cat.category}
            </button>
          );
        })}
      </div>

      {data.faq.map((cat) => {
        const visible = cat.slug === activeSlug;
        return (
          <section
            key={cat.slug}
            id={`panel-${cat.slug}`}
            role="tabpanel"
            aria-labelledby={`tab-${cat.slug}`}
            hidden={!visible}
            className={visible ? styles.panel : styles.hidden}
          >
            <div className={styles.cardStack}>
              {cat.items.map((item) => {
                const open = openItemId === item.id;
                const panelId = `faq-answer-${item.id}`;
                return (
                  <article key={item.id} className={styles.card} data-faq-id={item.id}>
                    <h3 className={styles.questionHeading}>
                      <button
                        type="button"
                        className={styles.questionBtn}
                        aria-expanded={open}
                        aria-controls={panelId}
                        id={`faq-q-${item.id}`}
                        onClick={() => onToggleItem(item.id)}
                      >
                        <span
                          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                          aria-hidden
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className={styles.questionText}>{item.question}</span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={`faq-q-${item.id}`}
                      className={`${styles.answerWrap} ${open ? styles.answerWrapOpen : ""}`}
                    >
                      <div className={styles.answerInner}>
                        <p className={styles.answer}>{item.answer}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* SEO·접근성: 활성 카테고리 외에도 스크린 리더가 구조를 알 수 있도록 숨김 요약(선택). 활성 패널만 visible */}
      <span className={styles.srOnly}>
        현재 선택된 카테고리: {activeCategory?.category ?? ""}
      </span>
    </>
  );
}
