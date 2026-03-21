/**
 * 로그인 후 돌아갈 **같은 사이트 내 경로**만 sessionStorage에 보관합니다. (오픈 리다이렉트 방지)
 */

export const AUTH_RETURN_PATH_KEY = "yourtarot.authReturnPath";

/** OAuth 시작 직전에 세팅 — 콜백 후에만 복귀 처리에 사용 */
export const OAUTH_PENDING_KEY = "yourtarot.oauthPending";

/** 허용: `/path`, `/path?a=1`. 거부: `//`, `http:`, 프로토콜 상대 URL 등 */
export function sanitizeAuthReturnPath(path: string | null | undefined): string | null {
  if (path == null || path === "") return null;
  const p = path.trim();
  if (!p.startsWith("/")) return null;
  if (p.startsWith("//")) return null;
  if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(p)) return null;
  return p;
}

export function setAuthReturnPathFromQuery(raw: string | null): void {
  if (typeof window === "undefined" || raw == null) return;
  try {
    const decoded = decodeURIComponent(raw);
    const safe = sanitizeAuthReturnPath(decoded);
    if (safe) {
      sessionStorage.setItem(AUTH_RETURN_PATH_KEY, safe);
    }
  } catch {
    /* 잘못된 인코딩 무시 */
  }
}

/** 읽고 즉시 제거 (1회용) */
export function consumeAuthReturnPath(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);
  if (!v) return null;
  sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
  return sanitizeAuthReturnPath(v);
}
