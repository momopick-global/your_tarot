import type { FaqData } from "@/lib/faqJsonLd";
import { buildFaqPageJsonLd } from "@/lib/faqJsonLd";
import faqData from "@/data/faq.json";
import { Suspense } from "react";
import { FaqView } from "./FaqView";
import styles from "./faq.module.css";

const data = faqData as FaqData;
const faqJsonLd = buildFaqPageJsonLd(data);

function FaqIntro() {
  return (
    <header className={styles.intro}>
      <h1 className={styles.introTitle}>자주 묻는 질문</h1>
      <p className={styles.introText}>
        유어타로는 웹에서 바로 이용할 수 있는 타로 서비스입니다. 아래에서는 타로의 기본 개념, 이용 절차, 결과 읽는 법,
        서비스·보안까지 짧은 문장으로 정리해 두었습니다.
      </p>
      <p className={styles.introText}>
        검색·AI 답변에도 잘 전달되도록 질문은 의도가 드러나게, 답변은 정의형으로 통일했습니다. 상단 탭으로 카테고리를
        고른 뒤 항목을 펼쳐 보시면 됩니다.
      </p>
    </header>
  );
}

function FaqFallback() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      FAQ를 불러오는 중…
    </div>
  );
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className={styles.page}>
        <div className={styles.pageInner}>
          <FaqIntro />
          <Suspense fallback={<FaqFallback />}>
            <FaqView data={data} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
