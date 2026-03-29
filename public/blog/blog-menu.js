/**
 * 블로그 정적 페이지 — 앱 SiteFrame과 동일한 왼쪽 슬라이드 메뉴
 */
(function () {
  var layer = document.getElementById("blog-menu-layer");
  if (!layer) return;

  var openers = document.querySelectorAll("[data-blog-menu-open]");
  var closers = layer.querySelectorAll("[data-blog-menu-close]");

  function openMenu() {
    layer.classList.add("is-open");
    layer.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      layer.classList.add("is-ready");
    });
  }

  function closeMenu() {
    layer.classList.remove("is-ready");
    window.setTimeout(function () {
      layer.classList.remove("is-open");
      layer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 280);
  }

  openers.forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openMenu();
    });
  });

  closers.forEach(function (el) {
    el.addEventListener("click", function () {
      closeMenu();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && layer.classList.contains("is-open")) {
      closeMenu();
    }
  });

  var aside = layer.querySelector(".blog-menu-aside");
  if (aside) {
    aside.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (a) closeMenu();
    });
  }
})();
