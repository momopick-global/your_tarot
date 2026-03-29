/**
 * data/blog/*.json + 사이트 고정 경로 → sitemap.xml (표준 XML, lastmod 포함)
 * 출력: public/sitemap.xml (배포용), 프로젝트 루트 sitemap.xml (동일 복사)
 * 실행: node scripts/write-sitemap-xml.cjs
 * prebuild에서 blog:generate 이후 호출
 */
const fs = require("fs");
const path = require("path");

require("./load-env-local.cjs")();

const ROOT = path.join(__dirname, "..");
const DATA_BLOG = path.join(ROOT, "data", "blog");
const PUBLIC = path.join(ROOT, "public");

const SITE_ORIGIN =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://www.yourtarot.cc").replace(/\/$/, "");
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
/** robots.txt Sitemap 줄 전용 (Search Console·크롤러가 apex 도메인으로 통일할 때) */
const ROBOTS_SITEMAP_ORIGIN =
  (process.env.NEXT_PUBLIC_ROBOTS_SITEMAP_ORIGIN || "https://yourtarot.cc").replace(/\/$/, "");

/** sitemap.ts와 동일한 정적 경로 (trailing slash) */
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
  "/blog/",
  "/mypage/",
  "/draw/today/",
  "/tarot/start/",
  "/tarot/draw/",
  "/tarot/reveal/",
  "/tarot/analyze/",
  "/tarot/result/",
  "/masters/profile/",
  "/result/today/demo/",
];

/** mastersDetailSlugs.ts 와 동기화 */
const MASTERS_DETAIL_SLUGS = [
  "cassian",
  "luna",
  "elin",
  "ari",
  "mira",
  "noah",
  "soren",
  "vivi",
  "astra",
];

function absUrl(pathname) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${BASE_PATH}${p}`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function loadBlogEntries() {
  if (!fs.existsSync(DATA_BLOG)) return [];
  const files = fs.readdirSync(DATA_BLOG).filter((f) => f.endsWith(".json"));
  const out = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(DATA_BLOG, f), "utf8");
    const data = JSON.parse(raw);
    if (!data.slug || !data.date) continue;
    out.push({
      slug: data.slug,
      date: data.date,
    });
  }
  return out;
}

function buildXml() {
  const buildDate = new Date();
  const buildDateStr = isoDate(buildDate);
  const urls = [];

  for (const pth of STATIC_PATHS) {
    const priority = pth === "/" ? "1.0" : "0.8";
    urls.push({
      loc: absUrl(pth),
      lastmod: buildDateStr,
      changefreq: "weekly",
      priority,
    });
  }

  for (const slug of MASTERS_DETAIL_SLUGS) {
    urls.push({
      loc: absUrl(`/masters/${slug}/`),
      lastmod: buildDateStr,
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  const blogPosts = loadBlogEntries();
  let blogLatest = buildDateStr;
  for (const post of blogPosts) {
    const d = new Date(post.date);
    const lm = isoDate(d);
    if (lm > blogLatest) blogLatest = lm;
    urls.push({
      loc: absUrl(`/blog/${post.slug}/`),
      lastmod: lm,
      changefreq: "monthly",
      priority: "0.75",
    });
  }

  const blogIndexIdx = urls.findIndex((u) => u.loc === absUrl("/blog/"));
  if (blogIndexIdx >= 0 && blogPosts.length > 0) {
    urls[blogIndexIdx] = { ...urls[blogIndexIdx], lastmod: blogLatest };
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const u of urls) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n`;
    if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    if (u.priority) xml += `    <priority>${u.priority}</priority>\n`;
    xml += "  </url>\n";
  }
  xml += "</urlset>\n";
  return xml;
}

function buildRobotsTxt() {
  const sitemapUrl = `${ROBOTS_SITEMAP_ORIGIN}${BASE_PATH}/sitemap.xml`;
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

function main() {
  const xml = buildXml();
  const robots = buildRobotsTxt();
  fs.mkdirSync(PUBLIC, { recursive: true });
  const publicPath = path.join(PUBLIC, "sitemap.xml");
  const rootPath = path.join(ROOT, "sitemap.xml");
  fs.writeFileSync(publicPath, xml, "utf8");
  fs.writeFileSync(rootPath, xml, "utf8");
  const robotsPublic = path.join(PUBLIC, "robots.txt");
  const robotsRoot = path.join(ROOT, "robots.txt");
  fs.writeFileSync(robotsPublic, robots, "utf8");
  fs.writeFileSync(robotsRoot, robots, "utf8");
  const nBlog = loadBlogEntries().length;
  console.log(`write-sitemap-xml: public/sitemap.xml + 루트 sitemap.xml (${nBlog}개 블로그 URL 포함)`);
  console.log(`write-sitemap-xml: public/robots.txt + 루트 robots.txt`);
}

main();
