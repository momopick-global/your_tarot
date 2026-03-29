import { FaqFetchRoot } from "./FaqFetchRoot";
import styles from "./faq.module.css";

function FaqIntro() {
  return (
    <header className={styles.intro}>
      <h1 className={styles.introTitle}>자주 묻는 질문</h1>
      <p className={styles.introText}>
        타로는 카드 상징을 바탕으로 지금의 흐름과 감정을 읽는 타로 해석 활동입니다. 유어타로는 웹 브라우저에서 바로 이용하는
        타로 서비스로, 질문을 고르고 카드를 받으면 타로 해석 문장을 확인할 수 있습니다.
      </p>
      <p className={styles.introText}>
        유어타로가 제시하는 타로 해석은 미래를 단정하지 않으며, 선택과 감정을 점검하기 위한 방향성과 참고 메시지입니다. 아래
        질문은 검색과 AI 답변에 맞춘 문장으로, 답변은 정의형으로 짧게 정리했습니다.
      </p>
    </header>
  );
}

export default function FaqPage() {
  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <FaqIntro />
        <FaqFetchRoot />
      </div>
    </main>
  );
}
