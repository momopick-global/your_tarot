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
