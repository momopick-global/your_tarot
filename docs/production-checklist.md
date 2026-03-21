# 프로덕션 점검 체크리스트 (YourTarot)

배포 URL(예: Cloudflare Pages)에서 아래를 **순서대로** 확인하세요. 항목마다 ✅/❌를 표시해 두면 재배포 후에도 비교하기 좋습니다.

**점검 일시:** ________  
**배포 URL:** ________  
**배포 커밋/빌드 ID:** ________

---

## A. Cloudflare Pages 설정

| # | 확인 항목 | 메모 |
|---|-----------|------|
| A1 | **Settings → Environment variables**에 `NEXT_PUBLIC_SUPABASE_URL` 존재 | Production(및 Preview 필요 시) |
| A2 | **Settings → Environment variables**에 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 존재 | **anon public** 키 (service_role 넣지 말 것) |
| A3 | 변수 이름 오타 없음 (`NEXT_PUBLIC_` 접두사 필수) | 빌드 시점에 클라이언트에 포함됨 |
| A4 | **Build** 설정: Command `npm run build`, Output `out` | `next.config` 가 `output: "export"` |
| A5 | 최근 배포가 **Success** | Deployments 탭 |

---

## B. Supabase 프로젝트

| # | 확인 항목 | 메모 |
|---|-----------|------|
| B1 | **Authentication → URL configuration**에 배포 도메인이 **Site URL** 또는 **Redirect URLs**에 포함 | OAuth 콜백 실패 방지. 앱은 로그인 후 **`/`(루트)** 로 돌아온 뒤 `returnTo`로 클라이언트 이동 — **Site URL** 은 프로덕션 루트 URL과 일치해야 함 |
| B2 | 사용 중인 로그인 방식(Google/Kakao 등) **Provider 활성화** | |
| B3 | `tarot_results` 테이블에 **`reading_id`** 컬럼 및 **`(user_id, reading_id)` 유니크** 적용됨 | 마이그레이션 `20260322120000_tarot_results_reading_id.sql` |
| B4 | **RLS** 켜짐 + `authenticated`용 SELECT/INSERT/UPDATE/DELETE 정책 | upsert는 UPDATE 필요 |
| B5 | Table **Privileges**에서 API(anon/authenticated) 접근 가능 | `permission denied` 시 확인 |

---

## C. 브라우저 수동 테스트 (시크릿 창 권장)

**준비:** 배포 URL을 연다. 개발자 도구 → Network에서 실패 요청(빨간 줄) 유의.

### C1. 비로그인 · 결과 페이지

| # | 동작 | 기대 결과 |
|---|------|-----------|
| C1-1 | 플로우를 거쳐 **카드 해석(결과) 페이지**까지 진입 | 해석 문구·이미지 정상 |
| C1-2 | **저장하기** 클릭 | 저장 요청 **없음** → 토스트 후 로그인 이동 또는 안내 |
| C1-3 | **다시하기** 등 다른 버튼 | 해당 페이지로 이동 |

### C2. 로그인

| # | 동작 | 기대 결과 |
|---|------|-----------|
| C2-1 | 소셜/이메일로 로그인 | 세션 생성, 홈 또는 리다이렉트 후 오류 없음 |
| C2-2 | 로그인 실패 시 | Supabase 대시보드 Redirect URL·Provider 설정 재확인 |

### C3. 로그인 후 · 저장 → 마이페이지

| # | 동작 | 기대 결과 |
|---|------|-----------|
| C3-1 | 결과 페이지에서 **저장하기** 클릭 | 토스트 **「마이페이지에 저장했어요」**, 버튼 **저장됨** |
| C3-2 | Network에 Supabase `tarot_results` 요청 | **200** (또는 upsert 성공). 401/403이면 RLS·세션 확인 |
| C3-3 | **마이페이지** 진입 | 방금 저장한 항목이 목록에 표시 (`reading_id` 가 `v1:…` 인 행만 노출) |
| C3-4 | 목록 **삭제** | 해당 행 제거, 새로고침 후에도 반영 |
| C3-5 | 같은 카드로 다시 저장 | DB에 **중복 행이 늘지 않고** upsert(갱신)되는지 Supabase Table Editor로 샘플 확인(선택) |

### C4. 로그아웃

| # | 동작 | 기대 결과 |
|---|------|-----------|
| C4-1 | 마이페이지 등에서 **로그아웃** | 세션 해제 |
| C4-2 | 결과 페이지에서 다시 **저장하기** | 비로그인 동작과 동일(저장 안 됨) |

---

## D. 자주 나는 오류

| 증상 | 점검할 곳 |
|------|-----------|
| 로그인 팝업 후 `redirect_uri_mismatch` | Supabase Redirect URLs, OAuth 콘솔 콜백 URL |
| 저장 시 `permission denied` / 401 | RLS 정책, 로그인 세션, anon 키 사용 여부 |
| 저장 시 컬럼/유니크 관련 에러 | `reading_id` 마이그레이션 적용 여부 |
| 마이페이지가 비어 있음 | `reading_id`가 `v1:%` 패턴인지, 필터 조건과 일치하는지 |
| 빌드는 되는데 사이트에서 Supabase 없음 | Cloudflare **환경 변수**가 Production에 없거나 재배포 전 |

---

## E. 점검 완료 요약

- [ ] A (Cloudflare) 전부 확인  
- [ ] B (Supabase) 전부 확인  
- [ ] C (브라우저) 전부 확인  

**이슈 메모:**

```
(여기에 실패한 항목 번호와 스크린샷/에러 문구를 적기)
```

---

이 문서는 코드와 함께 저장소에 두고, 배포·릴리즈 전에 팀이 공유해 사용하면 됩니다.
