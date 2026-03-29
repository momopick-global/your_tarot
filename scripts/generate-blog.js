/**
 * data/blog/*.json → public/blog/ SSG (정적 HTML)
 * 실행: node scripts/generate-blog.js
 */
const fs = require("fs");
const path = require("path");

require("./load-env-local.cjs")();

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data", "blog");
const OUT_DIR = path.join(ROOT, "public", "blog");

const SITE_ORIGIN =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://www.yourtarot.cc").replace(/\/$/, "");
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const DEFAULT_OG_IMAGE = "/next.svg";
const PUBLIC_DIR = path.join(ROOT, "public");

function prefix(p) {
  const x = p.startsWith("/") ? p : `/${p}`;
  return `${BASE_PATH}${x}`;
}

function absoluteUrl(pathname) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${BASE_PATH}${p}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveOgImage(post) {
  // 1) JSON에서 직접 지정한 절대/상대 경로 우선
  if (typeof post.ogImage === "string" && post.ogImage.trim()) {
    const raw = post.ogImage.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const rel = raw.startsWith("/") ? raw : `/${raw}`;
    return absoluteUrl(rel);
  }

  // 2) /public/images/blog/{slug}.{ext} 자동 탐색
  const exts = ["jpg", "jpeg", "png", "webp"];
  for (const ext of exts) {
    const rel = `/images/blog/${post.slug}.${ext}`;
    const disk = path.join(PUBLIC_DIR, "images", "blog", `${post.slug}.${ext}`);
    if (fs.existsSync(disk)) return absoluteUrl(rel);
  }

  // 3) 기본 이미지
  return absoluteUrl(DEFAULT_OG_IMAGE);
}

function renderBlocks(content) {
  if (!Array.isArray(content)) return "";
  let html = "";
  for (const block of content) {
    const t = block.type;
    if (t === "h2") {
      html += `<h2>${escapeHtml(block.text)}</h2>\n`;
    } else if (t === "h3") {
      html += `<h3>${escapeHtml(block.text)}</h3>\n`;
    } else if (t === "p") {
      html += `<p>${escapeHtml(block.text)}</p>\n`;
    } else if (t === "ul" && Array.isArray(block.items)) {
      html += "<ul>\n";
      for (const item of block.items) {
        html += `  <li>${escapeHtml(item)}</li>\n`;
      }
      html += "</ul>\n";
    }
  }
  return html;
}

function renderFaq(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return { section: "", faqLd: null };
  let section = '<section class="blog-faq" id="faq">\n<h2>자주 묻는 질문</h2>\n';
  const mainEntity = [];
  for (const item of faq) {
    section += "<details>\n";
    section += `<summary>${escapeHtml(item.q)}</summary>\n`;
    section += `<p>${escapeHtml(item.a)}</p>\n`;
    section += "</details>\n";
    mainEntity.push({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    });
  }
  section += "</section>\n";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
  return { section, faqLd };
}

/** 슬러그 기반 시드 — 글마다 다른 조합, 같은 글은 재빌드해도 동일 (HTML-only, JS 없음) */
function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h) || 1;
}

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded(arr, seed) {
  const a = arr.slice();
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 관련 글 2~3개: 다른 글 중 시드 셔플 후 2 또는 3개 (글 수가 부족하면 가능한 만큼) */
function relatedPostsRandom(current, all) {
  const others = all.filter((p) => p.slug !== current.slug);
  if (others.length === 0) return [];
  const seed = hashString(`related:${current.slug}`);
  const shuffled = shuffleSeeded(others, seed);
  const pickRnd = mulberry32(seed + 10007);
  let n = others.length === 1 ? 1 : others.length === 2 ? 2 : 2 + Math.floor(pickRnd() * 2);
  n = Math.min(n, others.length, 3);
  return shuffled.slice(0, n);
}

const QUIZ_LINKS = [
  { href: "/quiz/love-test", label: "연애 타로 테스트" },
  { href: "/quiz/tarot-reading", label: "타로 리딩" },
];

function renderSiteHeader(opts = {}) {
  const home = prefix("/");
  const login = prefix("/login");
  const imgMenu = prefix("/assets/icon-menu-header-v3.png");
  const imgEye = prefix("/assets/icon-eye-header-v2.png");
  const imgGuest = prefix("/assets/icon-user-guest-v1.png");
  const toolbar =
    opts.backHref && opts.backLabel
      ? `<div class="blog-toolbar">
    <a class="blog-back" href="${escapeHtml(opts.backHref)}">${escapeHtml(opts.backLabel)}</a>
  </div>`
      : "";
  return `<header class="blog-site-header">
    <div class="blog-site-header-inner">
      <button type="button" class="blog-icon-btn" data-blog-menu-open aria-label="메뉴 열기"><img src="${escapeHtml(imgMenu)}" alt="" width="42" height="42" loading="lazy" decoding="async" /></button>
      <a class="blog-logo" href="${escapeHtml(home)}" aria-label="홈"><img src="${escapeHtml(imgEye)}" alt="YourTarot" width="46" height="46" loading="lazy" decoding="async" /></a>
      <a class="blog-icon-btn" href="${escapeHtml(login)}" aria-label="로그인 페이지로 이동"><img src="${escapeHtml(imgGuest)}" alt="" width="42" height="42" loading="lazy" decoding="async" /></a>
    </div>
  </header>
${toolbar}`;
}

/** 앱 `MenuContent`와 동일 항목 — 왼쪽 슬라이드 메뉴 (blog-menu.js 토글) */
function renderBlogMenuDrawer() {
  const blogHref = prefix("/blog/");
  const mypageHref = prefix("/mypage");
  const link = (href, icon, label) =>
    `<a href="${escapeHtml(prefix(href))}" class="blog-menu-link"><span class="blog-menu-ico" aria-hidden="true">${icon}</span>${escapeHtml(label)}</a>`;
  return `<div id="blog-menu-layer" class="blog-menu-layer" aria-hidden="true">
  <div class="blog-menu-viewport">
    <div class="blog-menu-stage">
      <button type="button" class="blog-menu-overlay" data-blog-menu-close aria-label="메뉴 닫기"></button>
      <aside class="blog-menu-aside" role="dialog" aria-modal="true" aria-label="사이트 메뉴">
        <button type="button" class="blog-menu-close" data-blog-menu-close aria-label="메뉴 닫기"><span aria-hidden="true">×</span></button>
        <div class="blog-menu-brand">YourTarot</div>
        <nav class="blog-menu-nav" aria-label="주 메뉴">
          <div class="blog-menu-block">${link("/tarot/start", "🔮", "오늘의 운세 보기")}</div>
          <div class="blog-menu-block">
            ${link("/about", "✨", "서비스 소개")}
            ${link("/faq/", "❓", "자주 묻는 질문")}
            <a href="${escapeHtml(blogHref)}" class="blog-menu-link"><span class="blog-menu-ico" aria-hidden="true">📝</span>${escapeHtml("블로그")}</a>
            ${link("/masters", "👤", "타로 마스터 소개")}
          </div>
          <div class="blog-menu-block">
            ${link("/recommended", "💬", "서비스 개선 의견 보내기")}
            ${link("/partner", "🤝", "제휴 문의")}
          </div>
          <div class="blog-menu-block">
            ${link("/login", "🔑", "로그인")}
            <a href="${escapeHtml(mypageHref)}" class="blog-menu-link"><span class="blog-menu-ico" aria-hidden="true">🏠</span>${escapeHtml("마이페이지")}</a>
          </div>
          <div class="blog-menu-foot">
            <a href="${escapeHtml(prefix("/terms"))}" class="blog-menu-footlink">${escapeHtml("이용약관")}</a>
            <span class="blog-menu-dot" aria-hidden="true"> · </span>
            <a href="${escapeHtml(prefix("/personal"))}" class="blog-menu-footlink">${escapeHtml("개인정보처리방침")}</a>
            <span class="blog-menu-dot" aria-hidden="true"> · </span>
            <a href="${escapeHtml(prefix("/disclaimer"))}" class="blog-menu-footlink">${escapeHtml("면책조항")}</a>
          </div>
          <div class="blog-menu-withdraw">
            <div class="blog-menu-withdraw-ico" aria-hidden="true">😄</div>
            <a href="${escapeHtml(mypageHref)}" class="blog-menu-withdraw-link">${escapeHtml("탈퇴하기")}</a>
          </div>
        </nav>
      </aside>
    </div>
  </div>
</div>`;
}

function blogMenuScript() {
  return `<script src="${escapeHtml(prefix("/blog/blog-menu.js"))}" defer></script>`;
}

/** 앱 `Footer.tsx`와 동일 구조·링크 (정적 HTML) */
function renderBlogSiteFooter() {
  const eye = prefix("/assets/svg-logo-yourtarot.svg-699577b6-cedf-4beb-8082-e9fc60a6227c.png");
  const ig = prefix("/assets/svg-ic-social-instagram.svg-2aa4e1f6-9ec8-47a4-8c99-29d5317dd055.png");
  const talk = prefix("/assets/svg-ic-social-kakao.svg-20eca7d6-4d65-40b8-954f-17463d423b00.png");
  const sep = '<span class="blog-footer-sep" aria-hidden="true">|</span>';
  const navLink = (href, label) =>
    `<a class="blog-footer-nav-link" href="${escapeHtml(prefix(href))}">${escapeHtml(label)}</a>`;
  return `<div class="blog-footer-spacer" aria-hidden="true"></div>
<footer class="blog-site-footer">
  <div class="blog-site-footer-inner">
    <img class="blog-footer-eye" src="${escapeHtml(eye)}" alt="" width="37" height="28" loading="lazy" decoding="async" />
    <div class="blog-footer-rule"></div>
    <nav class="blog-footer-nav" aria-label="푸터 링크">
      ${navLink("/masters", "타로 마스터 소개")}
      ${sep}
      ${navLink("/about", "서비스 소개")}
      ${sep}
      ${navLink("/faq/", "FAQ")}
      ${sep}
      ${navLink("/terms", "이용약관")}
      ${sep}
      ${navLink("/personal", "개인정보처리방침")}
      ${sep}
      ${navLink("/disclaimer", "면책조항")}
      ${sep}
      ${navLink("/partner", "제휴문의")}
    </nav>
    <div class="blog-footer-rule blog-footer-rule--tight"></div>
    <div class="blog-footer-legal">
      <div>ASOG Co., Ltd. | CEO: jungyoungcheol</div>
      <div>Address: Hancheon-Ro, Gangbuk-Gu, Seoul, Republic Of Korea</div>
      <div>Business Registration Number: 370-54-00601</div>
      <div>Mail-Order Business Registration Number: 2021-Seoul-Seodaemun-0013</div>
      <div>Copyright© YourTarot Co., Ltd. All Rights Reserved.</div>
    </div>
    <div class="blog-footer-social">
      <a href="#" aria-label="인스타그램" class="blog-footer-social-btn"><img src="${escapeHtml(ig)}" alt="" width="36" height="36" loading="lazy" decoding="async" /></a>
      <a href="#" aria-label="카카오톡" class="blog-footer-social-btn"><img src="${escapeHtml(talk)}" alt="" width="36" height="36" loading="lazy" decoding="async" /></a>
    </div>
  </div>
</footer>`;
}

function loadPosts() {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn("generate-blog: data/blog 없음 — 건너뜀");
    return [];
  }
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const posts = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
    const data = JSON.parse(raw);
    if (!data.slug || !data.title) {
      console.warn(`generate-blog: 스킵 (slug/title 없음): ${f}`);
      continue;
    }
    posts.push(data);
  }
  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return posts;
}

function writeArticleHtml(post, allPosts) {
  const canonicalPath = `/blog/${post.slug}/`;
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = resolveOgImage(post);
  const hasCustomCover = ogImage !== absoluteUrl(DEFAULT_OG_IMAGE);
  const keywords = Array.isArray(post.tags) ? post.tags.join(", ") : "";
  const { section: faqSection, faqLd } = renderFaq(post.faq);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    image: ogImage,
    inLanguage: "ko-KR",
    articleSection: post.category || "general",
    keywords,
    author: {
      "@type": "Organization",
      name: "유어타로",
    },
    publisher: {
      "@type": "Organization",
      name: "유어타로",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/next.svg"),
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  const related = relatedPostsRandom(post, allPosts);
  let relatedHtml = '<footer class="blog-internal">\n';
  relatedHtml += '<section class="blog-related" aria-labelledby="related-heading">\n';
  relatedHtml += '<h2 id="related-heading">관련 글</h2>\n';
  if (related.length === 0) {
    relatedHtml += "<p>아직 다른 글이 없습니다. <a href=\"" + escapeHtml(prefix("/blog/")) + "\">블로그 목록</a>에서 글을 확인해 주세요.</p>\n";
  } else {
    relatedHtml += "<ul>\n";
    for (const r of related) {
      const u = prefix(`/blog/${r.slug}/`);
      relatedHtml += `<li><a href="${escapeHtml(u)}">${escapeHtml(r.title)}</a></li>\n`;
    }
    relatedHtml += "</ul>\n";
  }
  relatedHtml += "</section>\n";

  relatedHtml += '<section class="blog-quiz-links" aria-labelledby="quiz-heading">\n';
  relatedHtml += "<h2 id=\"quiz-heading\">타로 테스트</h2>\n<ul>\n";
  for (const q of QUIZ_LINKS) {
    const href = prefix(q.href.startsWith("/") ? q.href : `/${q.href}`);
    relatedHtml += `<li><a href="${escapeHtml(href)}">${escapeHtml(q.label)}</a></li>\n`;
  }
  relatedHtml += "</ul>\n</section>\n</footer>\n";

  const tagsStr = keywords;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(post.title)} | 유어타로</title>
  <meta name="description" content="${escapeHtml(post.description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="유어타로" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(post.description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:alt" content="${escapeHtml(`${post.title} | 유어타로 블로그`)}" />
  <meta property="article:published_time" content="${escapeHtml(post.date)}" />
  <meta property="article:modified_time" content="${escapeHtml(post.date)}" />
  <meta property="article:section" content="${escapeHtml(post.category || "general")}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(post.title)}" />
  <meta name="twitter:description" content="${escapeHtml(post.description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <link rel="stylesheet" href="${escapeHtml(prefix("/blog/blog.css"))}" />
  <script type="application/ld+json">${JSON.stringify(articleLd)}</script>
${faqLd ? `  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>\n` : ""}</head>
<body>
  <div class="blog-wrap">
${renderSiteHeader({ backHref: prefix("/blog/"), backLabel: "← 블로그 목록" })}
    <main class="blog-main">
      <article class="blog-article" itemscope itemtype="https://schema.org/Article">
        <h1 itemprop="headline">${escapeHtml(post.title)}</h1>
        <p class="blog-meta">
          <span class="cat">${escapeHtml(post.category || "기타")}</span>
          <time itemprop="datePublished" datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
          ${tagsStr ? ` · <span>${escapeHtml(tagsStr)}</span>` : ""}
        </p>
        ${
          hasCustomCover
            ? `<figure class="blog-cover">
          <img src="${escapeHtml(ogImage)}" alt="${escapeHtml(post.title)} 대표 이미지" loading="eager" decoding="async" />
        </figure>`
            : ""
        }
        <div itemprop="articleBody">
${renderBlocks(post.content)}
        </div>
      </article>
${faqSection}${relatedHtml}
    </main>
  </div>
${renderBlogSiteFooter()}
${renderBlogMenuDrawer()}
${blogMenuScript()}
</body>
</html>`;

  const slugDir = path.join(OUT_DIR, post.slug);
  fs.mkdirSync(slugDir, { recursive: true });
  fs.writeFileSync(path.join(slugDir, "index.html"), html, "utf8");
}

function writeIndex(posts) {
  let body = "";
  for (const p of posts) {
    const u = prefix(`/blog/${p.slug}/`);
    body += `<a class="blog-card" href="${escapeHtml(u)}">\n`;
    body += `<h2>${escapeHtml(p.title)}</h2>\n`;
    body += `<p>${escapeHtml(p.description)}</p>\n`;
    body += `<div class="blog-card-meta"><span class="cat">${escapeHtml(p.category || "기타")}</span>${escapeHtml(p.date)}</div>\n`;
    body += `</a>\n`;
  }

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>블로그 | 유어타로</title>
  <meta name="description" content="타로, 연애, 심리에 관한 글 — 유어타로 블로그" />
  <link rel="canonical" href="${escapeHtml(absoluteUrl("/blog/"))}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="블로그 | 유어타로" />
  <link rel="stylesheet" href="${escapeHtml(prefix("/blog/blog.css"))}" />
</head>
<body>
  <div class="blog-wrap">
${renderSiteHeader()}
    <main class="blog-main">
      <h1 class="blog-list-title">블로그</h1>
      <p class="blog-list-lead">검색과 AI 인용에 맞춘 정적 글 모음입니다.</p>
${body || "<p>아직 게시된 글이 없습니다.</p>\n"}
    </main>
  </div>
${renderBlogSiteFooter()}
${renderBlogMenuDrawer()}
${blogMenuScript()}
</body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html, "utf8");
}

function main() {
  const posts = loadPosts();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const p of posts) {
    writeArticleHtml(p, posts);
  }
  writeIndex(posts);
  console.log(`generate-blog: ${posts.length}개 글 → public/blog/`);
}

main();
