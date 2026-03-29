"use client";

import type { FaqData } from "@/lib/faqJsonLd";
import { buildFaqPageJsonLd } from "@/lib/faqJsonLd";
import { withAssetBase } from "@/lib/publicPath";
import { Suspense, useEffect, useState } from "react";
import { FaqView } from "./FaqView";
import styles from "./faq.module.css";

function Loading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      FAQ를 불러오는 중…
    </div>
  );
}

/**
 * FAQ 본문(탭·질문·답변)은 전부 fetch한 faq.json만으로 렌더링합니다.
 * 질문/답변 문자열을 이 파일이나 FaqView에 하드코딩하지 않습니다.
 * FAQPage JSON-LD는 동일 payload로 mainEntity 전체를 채운 뒤 head에 1회 삽입합니다.
 */
export function FaqFetchRoot() {
  const [data, setData] = useState<FaqData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const url = withAssetBase("/data/faq.json");
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<FaqData>;
      })
      .then((json) => {
        if (!cancelled && json?.faq?.length) setData(json);
        else if (!cancelled) setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    const id = "faq-jsonld";
    document.getElementById(id)?.remove();
    const s = document.createElement("script");
    s.id = id;
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(buildFaqPageJsonLd(data));
    document.head.appendChild(s);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data]);

  if (error) {
    return (
      <p className={styles.error} role="alert">
        FAQ를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.
      </p>
    );
  }
  if (!data) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <FaqView data={data} />
    </Suspense>
  );
}
