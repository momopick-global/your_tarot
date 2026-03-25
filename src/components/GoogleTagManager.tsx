import Script from "next/script";

/** 미설정 시 운영 컨테이너. 스테이징·로컬은 .env에서 덮어쓰기 */
const GTM_DEFAULT_ID = "GTM-5D6VW4MD";

function gtmContainerId(): string {
  return process.env.NEXT_PUBLIC_GTM_ID?.trim() || GTM_DEFAULT_ID;
}

/** head 초기화용 — Next.js가 beforeInteractive를 가능한 한 이르게 주입합니다. */
export function GoogleTagManagerScript() {
  const id = gtmContainerId();
  const inline = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`;

  return (
    // App Router에는 _document 없음 · GTM은 초기 주입 권장 (Pages 전용 ESLint 규칙 예외)
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="google-tag-manager"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: inline }}
    />
  );
}

/** body 직후 — 자바스크립트 꺼진 환경용 */
export function GoogleTagManagerNoScript() {
  const id = gtmContainerId();
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
