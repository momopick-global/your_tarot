import type { Metadata } from "next";

/** SNS 공유용 기본 이미지 (metadataBase와 결합해 절대 URL로 출력) */
export const OG_IMAGE_PATH = "/og/yourtarot_og_kr2.png";

const OG_IMAGE = {
  width: 1200,
  height: 630,
} as const;

/** trailingSlash와 맞춘 canonical / og:url 경로 (선행 슬래시, 끝 슬래시) */
export function canonicalPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.endsWith("/") ? p : `${p}/`;
}

export type PageSocialOptions = {
  /** og:title / twitter:title — 클릭 유도 (미입력 시 `${title} | 유어타로`) */
  ogTitle?: string;
  /** og:description / twitter:description — 호기심·요약 (미입력 시 페이지 description) */
  ogDescription?: string;
};

/**
 * 페이지별 title, description, canonical + Open Graph + Twitter 카드.
 * og:image는 상대 경로로 두고 루트 layout의 metadataBase로 https 절대 URL이 됩니다.
 */
export function pageMetadata(
  title: string,
  description: string,
  pathname: string,
  social?: PageSocialOptions,
): Metadata {
  const canonical = canonicalPath(pathname);
  const ogTitle = social?.ogTitle ?? `${title} | 유어타로`;
  const ogDescription = social?.ogDescription ?? description;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "유어타로",
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE_PATH],
    },
  };
}
