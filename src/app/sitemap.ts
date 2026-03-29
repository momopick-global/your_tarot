import type { MetadataRoute } from "next";
import { MASTERS_DETAIL_SLUGS } from "@/lib/mastersDetailSlugs";
import { absoluteSiteUrl } from "@/lib/siteUrl";

/** `output: "export"` 빌드에서 sitemap 정적 생성 허용 */
export const dynamic = "force-static";

const STATIC_PATHS = [
  "/",
  "/about/",
  "/login/",
  "/menu/",
  "/masters/",
  "/terms/",
  "/personal/",
  "/disclaimer/",
  "/recommended/",
  "/partner/",
  "/faq/",
  "/mypage/",
  "/draw/today/",
  "/tarot/start/",
  "/tarot/draw/",
  "/tarot/reveal/",
  "/tarot/analyze/",
  "/tarot/result/",
  "/masters/profile/",
  "/result/today/demo/",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteSiteUrl(path),
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const masterEntries: MetadataRoute.Sitemap = MASTERS_DETAIL_SLUGS.map((slug) => ({
    url: absoluteSiteUrl(`/masters/${slug}/`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...masterEntries];
}
