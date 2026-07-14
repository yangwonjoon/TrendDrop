# trendDrop 셋업 이슈 초안 — sticker-trend-app 경험 이전

> 작성일: 2026-06-24 · 목적: 내일 팀 논의용
>
> 이전에 혼자 만들던 **sticker-trend-app**(Next.js 16 + Firebase + Zustand + Tailwind, 테스트/CI까지 갖춘 앱)에서
> 직접 겪은 문제·해결법·구현 패턴을 정리해, **trendDrop에서는 같은 시행착오를 반복하지 않도록** 이슈로 옮긴 것.
> 근거: sticker-trend-app `docs/REVIEW.md` 전체 검토 기록 + 실제 코드.
>
> **전제**: 아래는 sticker-trend-app과 같은 계열(Next.js + Firebase + Vercel)을 가정. trendDrop 스택이 다르게 정해지면 *원칙*만 가져가면 됩니다. 이 스택 채택 여부 자체가 첫 논의 안건.
>
> ⚠️ 이 문서는 *어떻게 잘 만들까*(공통 엔지니어링)만 다룹니다. trendDrop을 *제품으로 다르게* 만드는 **도메인 차별점**은 → [domain-differentiators.md](domain-differentiators.md)

## 내일 논의 안건 (요약)
1. trendDrop도 Next.js + Firebase + Vercel 계열로 갈지 (→ 아래 이슈 거의 그대로 적용)
2. "인프라 먼저(테스트·CI·린트), 기능 나중" 순서에 합의할지 — sticker-app에서 이게 제일 잘한 선택이었음
3. 보안 규칙·비밀 키 관리는 **0일차에** 박아두기 (가장 크게 데였던 지점)
4. 이슈 우선순위/담당 나누기

---

## #1 🔴 데이터 접근 보안 규칙을 데이터 모델과 *동시에* 작성

**sticker-app에서 겪은 일**
DB 보안 규칙이 비어 있었고 콘솔엔 "테스트 모드"(특정 날짜까지 *누구나* 전체 읽기/쓰기/삭제, 이후 전면 차단)가 깔려 있었음. 데이터 보호가 클라이언트의 `where("userId","==",uid)` 필터 하나뿐이었는데, **이건 서버에서 아무것도 막아주지 않음**. 출시했으면 DB가 그대로 열려 있었을 사고.

**해결법 (그대로 재사용 가능)**
본인(`userId == auth.uid`) 문서만 접근하는 규칙으로 교체. create 시 새 문서의 userId 강제, update 시 소유권 탈취 방지, 그 외 경로 전면 차단. → sticker-app `firestore.rules` 복붙 수준으로 가져올 수 있음.

**trendDrop에서 할 일**
- [ ] 컬렉션 스키마 확정과 **같은 PR**에서 보안 규칙 작성
- [ ] "테스트 모드" 규칙으로 방치 금지 (캘린더에 만료일 알림 X, 처음부터 제대로)
- [ ] 규칙을 레포에 버전관리(`firestore.rules`) + 배포 스크립트(`firebase deploy --only firestore:rules`)
- [ ] 공개 피드(읽기 공개) vs 개인 데이터(저장/관심 키워드) 접근 정책을 분리 설계 — trendDrop은 공개 트렌드 + 개인 watchlist가 섞일 가능성이 큼

**완료 조건**: 비로그인/타인 uid로 읽기·쓰기 시도가 규칙 레벨에서 차단됨(에뮬레이터 또는 수동 검증).

---

## #2 🔴 비밀·환경변수 관리 규칙을 0일차에 못박기

**sticker-app에서 겪은 일**
`.env.example`이 없어 셋업이 구두 전달에 의존. 클라이언트 노출 변수(`NEXT_PUBLIC_`)와 서버 전용 키(AI 키)의 경계가 사고나기 쉬움.

**해결법**
- `.env.example` 템플릿 제공 + `.gitignore`에 `!.env.example` 예외
- 규칙: **서버 전용 키에는 절대 `NEXT_PUBLIC_` 금지** (붙이면 브라우저 번들에 노출). AI/외부 트렌드 API 키는 서버 라우트에서만.

**trendDrop에서 할 일**
- [ ] `.env.example` 작성 (Firebase 공개 설정 + 서버 전용 키 섹션 분리, 주석으로 노출 경계 명시)
- [ ] 외부 데이터 수집 API 키(인스타/메타/뉴스 등)는 전부 서버 사이드로 격리
- [ ] CI에는 더미값 주입 (sticker-app `ci.yml` 패턴)

**완료 조건**: 새 팀원이 `cp .env.example .env.local`만으로 로컬 구동 가능, 빌드 번들에 비밀 키 미포함.

---

## #3 🟠 인프라(테스트·린트·타입체크·CI)를 기능보다 먼저

**sticker-app에서 겪은 일**
회고의 결론: "**인프라는 탄탄했는데** 기능이 멈춰 있었다." 인프라를 먼저 깔아둔 덕에 이후 리팩터·수정이 안전했음. 반대로 쌓인 lint 에러로 CI가 빨간 상태였던 구간은 신뢰를 떨어뜨림.

**해결법 / 패턴 (재사용)**
- 스크립트 세트: `type-check`(tsc --noEmit) · `lint` · `test`/`test:coverage` · `build`
- CI: PR마다 type-check → lint → test → build 4단계 (sticker-app `.github/workflows/ci.yml` 거의 그대로)

**trendDrop에서 할 일**
- [ ] 첫 기능 PR 전에 Jest + Testing Library + (선택)Playwright e2e 골격 세팅
- [ ] GitHub Actions CI 4단계 도입, main 보호 규칙으로 CI 통과 강제
- [ ] "CI는 항상 초록" 합의

**완료 조건**: 빈 앱 상태에서도 CI 4단계가 초록으로 도는 베이스라인 PR 머지.

---

## #4 🟠 에러 처리 패턴을 표준화 (무한 로딩 / 멈춘 버튼 방지)

**sticker-app에서 겪은 일**
`try/catch`·`.catch()` 누락으로 네트워크/권한 오류 시 UI가 영구 정지하던 버그가 **5종**: 목록 "불러오는 중…" 영구, 등록 "저장 중…" 멈춤, 삭제 catch 없음, 상태변경 후 롤백 없음, AI 라우트가 잘못된 body에 스택 노출 500.

**해결법 (검증된 패턴 → 공유 유틸로)**
- 비동기 호출은 `try/catch` + `finally`로 로딩 해제 보장
- 변이는 **낙관적 업데이트 + 실패 시 롤백**
- 검증된 패턴을 한 곳(sticker-app은 `login/page.tsx`)에 만들고 재사용

**trendDrop에서 할 일**
- [ ] 데이터 fetch/변이 공용 훅 또는 래퍼에 로딩/에러/롤백 표준 내장
- [ ] 외부 트렌드 데이터 소스 장애(타임아웃/레이트리밋)에 대한 폴백 UI 정의 — trendDrop은 외부 SNS 데이터 의존도가 높아 더 중요
- [ ] "로딩 끝나지 않는 화면" 금지 체크리스트를 PR 리뷰 항목화

**완료 조건**: 네트워크 차단 상태에서 주요 화면이 멈추지 않고 에러 배너 + 재시도 노출.

---

## #5 🟢 표준 페이지(error / not-found / loading)를 처음부터

**sticker-app에서 겪은 일**
나중에야 `error.tsx`(렌더 에러 바운더리+재시도), `not-found.tsx`(404), `loading.tsx`(전환 폴백)를 추가. 처음 없었어서 깨진 상태가 그대로 노출되던 구간 존재.

**trendDrop에서 할 일**
- [ ] 프로젝트 스캐폴딩 단계에서 error/404/loading 3종 페이지 포함
- [ ] 공개 서비스인 만큼(=비로그인 방문자 많음) 404·에러 페이지 카피와 브랜딩 신경

**완료 조건**: 없는 경로/렌더 에러/라우트 전환 시 각각 전용 화면 노출.

---

## #6 🟡 CRUD는 생성·삭제뿐 아니라 *수정*까지 한 세트로

**sticker-app에서 겪은 일**
레퍼런스·아이디어가 생성·삭제만 되고 **수정이 빠져 있었음**. 뒤늦게 단건 조회(`getX`)와 편집 페이지를 추가. + Next 15/16의 async params breaking change를 피하려 클라이언트 `useParams` 기반으로 우회.

**trendDrop에서 할 일**
- [ ] 개인 데이터(저장 키워드/메모/watchlist 등) 설계 시 read/create/**update**/delete 4종을 처음부터 한 세트로
- [ ] 동적 라우트(`[id]`) 사용 시 프레임워크 버전의 params 처리 방식 먼저 확인 (#8 참고)

**완료 조건**: 사용자 생성 엔티티 전부에 수정 경로 존재.

---

## #7 🟠 AI(Claude API) 연동 패턴 — trendDrop "왜 뜨나" 설명에 직결

**sticker-app에서 겪은 일**
`/api/ai-summary` 라우트는 만들었는데 **호출하는 곳이 0곳**이라 리포트가 100% 더미였음. 또 모델 ID 오타 버그(`claude-opus-4-7` → 정상값으로 수정). 키 미설정 시 처리도 필요했음.

**해결법 (그대로 가져올 만한 서버 라우트 틀)**
- 입력 검증 → 잘못된 body 400, 빈 입력 400
- 키 미설정 시 안내 메시지로 **graceful degradation**(앱이 죽지 않음)
- 외부 호출 실패 502 / API 실패 500 분리
- **모델 ID는 상수로 관리 + 검증** (오타가 런타임까지 안 새도록). 최신 모델 ID는 `claude-api` 스킬로 확인.

**trendDrop에서 할 일**
- [ ] trendDrop의 "왜 뜨는지 요약 / 트렌드 설명" 생성에 동일 서버 라우트 패턴 적용
- [ ] 라우트는 **서버 전용**, 키는 #2 규칙대로 격리
- [ ] 만든 라우트를 실제 화면에서 호출하는 것까지가 "완료" (틀만 만들고 방치 금지 — sticker-app의 교훈)
- [ ] 비용/레이트리밋 고려해 캐싱 또는 배치 생성 검토

**완료 조건**: 키 없을 때 안내 노출, 키 있을 때 실제 요약이 화면에 렌더.

---

## #8 🟢 프레임워크 버전 함정 문서화 (Next 16)

**sticker-app에서 겪은 일**
- `AGENTS.md`에 "이건 네가 아는 Next.js가 아니다 — breaking change 있으니 문서부터 읽어라" 규칙을 둠
- async params breaking change 회피 필요
- `output: 'export'`(정적/모바일 빌드) 켜면 동적 라우트 `[id]/edit`가 `generateStaticParams` 없이 안 잡히는 함정

**trendDrop에서 할 일**
- [ ] 채택 버전의 알려진 breaking change를 `AGENTS.md`/`CLAUDE.md`에 명시
- [ ] 정적 호스팅(현재 trendDrop은 GitHub Pages 정적) ↔ 동적 라우트/서버 라우트 충돌 지점 사전 합의 — 백엔드/AI 라우트가 생기면 호스팅 재검토 필요

**완료 조건**: 신규 합류자가 버전 함정 문서만 읽고 지뢰 회피 가능.

---

## #9 🟢 배포 파이프라인 정리

**sticker-app에서 겪은 일**
Vercel 배포 워크플로(`deploy.yml`): main push 시 type-check → test → `vercel --prod`, 토큰/프로젝트 ID는 GitHub Secrets. 서버 라우트(AI)가 있어 정적 호스팅으론 부족.

**trendDrop에서 할 일**
- [ ] 현재 GitHub Pages(정적) 유지 가능 여부 판단 — 서버 라우트/AI/외부 수집이 들어오면 Vercel 등으로 이전 필요
- [ ] 배포도 CI 통과를 게이트로 (sticker-app `deploy.yml` 패턴)
- [ ] 배포 비밀(토큰류)은 GitHub Secrets로만

**완료 조건**: main 머지 → CI 통과 → 자동 배포가 한 흐름으로 동작.

---

## 부록: sticker-app에서 바로 가져올 수 있는 자산
| 자산 | 파일 | 재사용도 |
|---|---|---|
| Firestore 보안 규칙 | `firestore.rules` | 컬렉션명만 바꾸면 거의 그대로 |
| CI 워크플로 | `.github/workflows/ci.yml` | 거의 그대로 |
| 배포 워크플로 | `.github/workflows/deploy.yml` | Vercel 쓰면 그대로 |
| 환경변수 템플릿 | `.env.example` | 키 항목만 교체 |
| AI 서버 라우트 틀 | `src/app/api/ai-summary/route.ts` | 프롬프트만 교체 |
| 에러 처리 패턴 | `src/app/login/page.tsx` 외 | 패턴 차용 |
| 회고 문서 포맷 | `docs/REVIEW.md` | 심각도별 정리 포맷 차용 |
