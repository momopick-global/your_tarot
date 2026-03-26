import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleTagManagerNoScript, GoogleTagManagerScript } from "@/components/GoogleTagManager";
import { SiteFrame } from "@/components/SiteFrame";
import { WebSiteJsonLd } from "@/components/WebSiteJsonLd";
import { OG_IMAGE_PATH } from "@/lib/seo/pageMeta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourtarot.cc";

/** Next.js가 <head>에 viewport 메타로 주입합니다. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "유어타로 | 오늘의 마음과 타로 힌트",
    template: "%s | 유어타로",
  },
  description:
    "타로 카드로 오늘의 감정 흐름과 행동 힌트를 확인하세요. 유어타로는 직관적인 리딩을 제공합니다.",
  keywords: ["타로", "타로카드", "운세", "오늘의 운세", "타로 테스트"],
  alternates: {
    canonical: "/",
  },
  /** index,follow 명시 — noindex 누락 실수 방지, 하위 페이지는 기본 상속 */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "유어타로",
    title: "오늘의 마음, 카드가 먼저 알아챕니다 | 유어타로",
    description:
      "1분이면 충분해요. 감정 흐름·행동 힌트를 타로로 확인하고 친구에게도 공유해 보세요.",
    url: "/",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "유어타로 — 타로 리딩 미리보기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "오늘의 마음, 카드가 먼저 알아챕니다 | 유어타로",
    description:
      "1분이면 충분해요. 감정 흐름·행동 힌트를 타로로 확인하고 친구에게도 공유해 보세요.",
    images: [OG_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-neutral-90 text-neutral-10">
        <GoogleTagManagerNoScript />
        <GoogleTagManagerScript />
        <WebSiteJsonLd />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
