import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMeta";

const faqMetaBase = pageMetadata(
  "자주 묻는 질문",
  "타로와 타로 해석, 유어타로 이용법, 무료 타로, 결과가 달라 보이는 이유, 연애·진로 타로를 질문형 문장과 짧은 정의형 답으로 정리했습니다. 유어타로는 방향성·참고용 타로 해석을 제공합니다.",
  "/faq",
  {
    ogTitle: "유어타로 FAQ | 타로 해석·무료 이용·결과 해석",
    ogDescription:
      "타로는 무엇인지, 유어타로는 무료인지, 타로 결과가 왜 달라 보이는지, 무료 타로 사이트로 유어타로를 써도 되는지 등 검색형 질문에 맞춘 타로 해석 FAQ입니다.",
  },
);

export const metadata: Metadata = {
  ...faqMetaBase,
  keywords: [
    "유어타로",
    "유어타로 FAQ",
    "타로 이용법",
    "타로 뜻",
    "오늘의 타로",
    "타로 결과 해석",
    "타로 무료",
    "타로 회원가입",
  ],
};

export default function FaqLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
