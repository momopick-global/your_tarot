/**
 * 유어타로 FAQ — Vanilla JS
 * 규칙: 탭 전환 시 해당 카테고리 첫 질문 자동 오픈.
 * 아코디언: 동시에 하나만 열림. 같은 질문 재클릭 시 닫힘(0개 열림 가능).
 * URL: ?tab=slug, #item-id
 */
(function () {
  const root = document.getElementById("faq-app");
  if (!root) return;

  const DATA_URL = new URL("../data/faq.json", window.location.href).href;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findItemById(data, id) {
    for (const cat of data.faq) {
      const item = cat.items.find((i) => i.id === id);
      if (item) return { cat, item };
    }
    return null;
  }

  function buildJsonLd(data) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faq.flatMap((cat) =>
        cat.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      ),
    };
  }

  function readHash() {
    return window.location.hash.replace(/^#/, "").trim();
  }

  function readTab() {
    return new URLSearchParams(window.location.search).get("tab")?.trim() ?? "";
  }

  function applyUrl(slug, itemId) {
    const url = new URL(window.location.href);
    url.search = `?tab=${encodeURIComponent(slug)}`;
    url.hash = itemId ? `#${itemId}` : "";
    window.history.replaceState(null, "", url.toString());
  }

  function injectJsonLd(data) {
    document.querySelectorAll('script[data-faq-jsonld="1"]').forEach((el) => el.remove());
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-faq-jsonld", "1");
    s.textContent = JSON.stringify(buildJsonLd(data));
    document.head.appendChild(s);
  }

  function initialState(data) {
    const first = data.faq[0];
    if (!first) return { activeSlug: "", openId: null };
    const slugSet = new Set(data.faq.map((c) => c.slug));
    const hashId = readHash();
    if (hashId) {
      const f = findItemById(data, hashId);
      if (f) return { activeSlug: f.cat.slug, openId: f.item.id };
    }
    const tab = readTab();
    if (tab && slugSet.has(tab)) {
      const cat = data.faq.find((c) => c.slug === tab);
      return { activeSlug: tab, openId: cat?.items[0]?.id ?? null };
    }
    return { activeSlug: first.slug, openId: first.items[0]?.id ?? null };
  }

  function renderIntro() {
    return `
      <header class="faq-intro">
        <h1>자주 묻는 질문</h1>
        <p>유어타로는 웹에서 바로 이용할 수 있는 타로 서비스입니다. 아래에서는 타로의 기본 개념, 이용 절차, 결과 읽는 법, 서비스·보안까지 짧은 문장으로 정리해 두었습니다.</p>
        <p>검색·AI 답변에도 잘 전달되도록 질문은 의도가 드러나게, 답변은 정의형으로 통일했습니다. 상단 탭으로 카테고리를 고른 뒤 항목을 펼쳐 보시면 됩니다.</p>
      </header>`;
  }

  function renderTabs(data, activeSlug) {
    const buttons = data.faq
      .map((cat) => {
        const active = cat.slug === activeSlug;
        return `<button type="button" role="tab" id="tab-${esc(cat.slug)}" aria-selected="${active}" aria-controls="panel-${esc(
          cat.slug,
        )}" tabindex="${active ? 0 : -1}" class="faq-tab${active ? " faq-tab--active" : ""}" data-tab-slug="${esc(
          cat.slug,
        )}">${esc(cat.category)}</button>`;
      })
      .join("");
    return `<div class="faq-tab-scroll" role="tablist" aria-label="FAQ 카테고리">${buttons}</div>`;
  }

  function renderPanels(data, activeSlug, openId) {
    return data.faq
      .map((cat) => {
        const visible = cat.slug === activeSlug;
        const cards = cat.items
          .map((item) => {
            const open = openId === item.id;
            const panelId = `faq-answer-${item.id}`;
            return `<article class="faq-card" data-faq-id="${esc(item.id)}">
            <h3 class="faq-qh">
              <button type="button" class="faq-qbtn" aria-expanded="${open}" aria-controls="${esc(panelId)}" id="faq-q-${esc(
                item.id,
              )}" data-item-id="${esc(item.id)}">
                <span class="faq-chevron${open ? " faq-chevron--open" : ""}" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span class="faq-qtext">${esc(item.question)}</span>
              </button>
            </h3>
            <div id="${esc(panelId)}" role="region" aria-labelledby="faq-q-${esc(item.id)}" class="faq-awrap${
              open ? " faq-awrap--open" : ""
            }">
              <div class="faq-ainner"><p class="faq-answer">${esc(item.answer)}</p></div>
            </div>
          </article>`;
          })
          .join("");
        return `<section id="panel-${esc(cat.slug)}" role="tabpanel" aria-labelledby="tab-${esc(cat.slug)}" ${
          visible ? "" : "hidden"
        } class="faq-panel"><div class="faq-card-stack">${cards}</div></section>`;
      })
      .join("");
  }

  function fullRender(data, state) {
    const cat = data.faq.find((c) => c.slug === state.activeSlug) ?? data.faq[0];
    root.innerHTML =
      renderIntro() +
      renderTabs(data, state.activeSlug) +
      renderPanels(data, state.activeSlug, state.openId) +
      `<span class="faq-sr">현재 선택된 카테고리: ${esc(cat?.category ?? "")}</span>`;
  }

  async function main() {
    let state = { activeSlug: "", openId: null };

    try {
      const res = await fetch(DATA_URL, { credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.faq?.length) throw new Error("empty faq");

      injectJsonLd(data);

      state = initialState(data);
      fullRender(data, state);

      root.addEventListener("click", (e) => {
        const tabBtn = e.target.closest("[data-tab-slug]");
        if (tabBtn) {
          const slug = tabBtn.getAttribute("data-tab-slug");
          const cat = data.faq.find((c) => c.slug === slug);
          const firstId = cat?.items[0]?.id ?? null;
          state = { activeSlug: slug, openId: firstId };
          applyUrl(slug, firstId);
          fullRender(data, state);
          return;
        }
        const qBtn = e.target.closest("[data-item-id]");
        if (qBtn) {
          const id = qBtn.getAttribute("data-item-id");
          if (state.openId === id) {
            state = { ...state, openId: null };
            applyUrl(state.activeSlug, null);
          } else {
            state = { ...state, openId: id };
            applyUrl(state.activeSlug, id);
          }
          fullRender(data, state);
        }
      });

      window.addEventListener("popstate", () => {
        state = initialState(data);
        fullRender(data, state);
      });
    } catch (err) {
      console.error(err);
      root.innerHTML = `<p class="faq-error" role="alert">FAQ를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
