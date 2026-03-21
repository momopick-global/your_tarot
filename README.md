# YourTarot 2

`yourtarot2`는 유어타로 서비스의 화면 구현 중심 웹 프로젝트입니다.  
현재는 **Next.js App Router** 기반으로 주요 화면 흐름과 정책 페이지(원문 Markdown 렌더링)를 구성한 상태입니다.

## 기술 스택

- `next@16`
- `react@19`
- `typescript`
- `tailwindcss@4`
- `react-markdown` + `remark-gfm`

## 실행 방법

```bash
npm install
npm run dev
```

기본 실행 주소: `http://localhost:3000`  
포트 충돌 시:

```bash
npm run dev -- --port 3025
```

## 주요 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 검사

## 현재 라우트 구조 (`src/app`)

- `/` 홈
- `/about` 서비스 소개
- `/login` 로그인
- `/mypage` 마이페이지
- `/menu` 메뉴
- `/masters`, `/masters/[slug]` 마스터 목록/상세
- `/draw/today` 오늘의 타로
- `/result/today/[id]` 결과 페이지
- `/partner` 제휴 문의
- `/disclaimer`, `/personal`, `/terms` 정책/약관
- `/recommended` 추천 페이지
- 플로우 화면:
  - `/page_01_masters_list_1`
  - `/page_02_masters_list_2`
  - `/page_03_card-selection_1`
  - `/page_04_card-selection_2`
  - `/page_05_masters_list5`
  - `/page_06_analyzing`
  - `/page_07_reading-result_typea`
  - `/page-master-profile_01`

## 프로젝트 구조 요약

- `src/app`: 페이지 라우트(App Router)
- `src/components`: 공용 UI 컴포넌트 (`SiteFrame`, `FlowScene`, `MarkdownArticle` 등)
- `src/lib`: 공통 유틸/상수/API 클라이언트
- `src/data`: 정적 데이터(JSON)
- `src/hooks`: 커스텀 훅
- `src/context`: 전역 컨텍스트
- `docs`: 설계/스펙 문서
- `public/assets`: 디자인 에셋 이미지

## 문서

- `docs/design-system.md`
- `docs/data-model.md`
- `docs/api-spec.md`
- `docs/folder-structure.md`
- `docs/production-checklist.md` — **프로덕션(Cloudflare Pages + Supabase) 배포 후 점검**
- `docs/supabase-tarot-results.md` — `tarot_results`·RLS·저장 정책

## 참고 사항

- 현재 프로젝트는 화면 구현 중심 단계이며, 문서의 API 스펙은 구현 목표 기준입니다.
- 실제 API 핸들러(`src/app/api/**/route.ts`)는 아직 포함되어 있지 않습니다.
