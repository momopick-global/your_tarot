export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  category: string;
  slug: string;
  items: FaqItem[];
};

export type FaqData = {
  faq: FaqCategory[];
};

/** faq.json 전체 카테고리·항목을 빠짐없이 mainEntity에 넣는다(일부만 수동 넣지 않음). */
export function buildFaqPageJsonLd(data: FaqData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    ),
  };
}
