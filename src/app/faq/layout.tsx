import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMeta";

export const metadata: Metadata = pageMetadata(
  "자주 묻는 질문",
  "유어타로의 타로 이해, 이용 방법, 결과 해석, 서비스·보안을 짧은 답변으로 정리했습니다. 모바일에서도 카테고리 탭과 FAQ를 빠르게 찾을 수 있습니다.",
  "/faq",
  {
    ogTitle: "유어타로 FAQ | 타로 이해·이용·결과 해석",
    ogDescription:
      "타로가 무엇인지, 유어타로 시작 방법, 결과 해석 팁을 한곳에서 확인하세요. 검색과 AI 요약에 맞춘 구조로 정리했습니다.",
  },
);

export default function FaqLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
