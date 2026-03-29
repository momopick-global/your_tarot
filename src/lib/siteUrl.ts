/** 배포 URL (trailing slash 없음) */
export function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "https://www.yourtarot.cc";
}

/** GitHub Pages 등 basePath (선행 슬래시, 끝 슬래시 없음) */
export function basePathPrefix(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
}

/** 절대 URL (경로는 선행 슬래시 권장, trailingSlash 설정과 맞춤) */
export function absoluteSiteUrl(path: string): string {
  const base = siteOrigin();
  const prefix = basePathPrefix();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${p}`;
}

export function absoluteSitemapUrl(): string {
  return absoluteSiteUrl("/sitemap.xml");
}
