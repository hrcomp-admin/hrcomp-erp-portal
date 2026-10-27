# HR COMP WEB ERP PORTAL V1

## 구조
독립형 GitHub Pages 정적 웹 프로젝트. PC는 업무 모듈을 새 탭으로, 모바일(화면 너비 700px 이하)은 현재 탭으로 엽니다. DB 변경 및 업무 모듈 변경 없음.

## 파일
- index.html: 포털 기본 화면
- css/portal.css: PC/모바일 반응형 디자인
- js/menu-config.js: 전체 VBA 메뉴 및 독립 모듈 URL/활성화 설정
- js/portal.js: 메뉴 생성 및 PC/모바일 이동 동작

## 연결 현황
- 고객주문관리: https://hrcomp-admin.github.io/hrcomp-customer-order-pages/
- 고객주문 납기관리: https://hrcomp-admin.github.io/hrcomp-delivery-pages/
- 현재재고/재고실사: 기존 hrcomp-mobile 저장소의 **실제 운영 Pages 주소를 확인**하여 menu-config.js에서 각각 url 설정 후 enabled:true로 변경. 같은 앱에 두 기능이 있는 경우 같은 URL로 연결할 수 있으며, 해당 앱에서 기능 선택이 필요합니다.
- 나머지 VBA 메뉴: 비활성 표시

## 실행 및 배포
1. 압축 해제 후 폴더 안에서 `python -m http.server 8080` 실행 (또는 VS Code Live Server).
2. http://localhost:8080/ 에서 화면 확인.
3. GitHub에 신규 `hrcomp-erp-portal` 저장소 생성 후 파일 업로드.
4. Settings → Pages → Deploy from a branch → main / (root) 설정.
5. PC 및 모바일에서 메뉴 이동 테스트.

## 인증 / 모바일 복귀
이 V1은 **메뉴 링크 기능만** 구현합니다. Supabase 로그인·통합 세션·권한 검증은 아직 미구현이며, 각 업무 모듈이 자체적으로 접근을 보호해야 합니다. 모바일은 브라우저 뒤로 가기로 포털 복귀가 가능합니다. 업무 모듈의 공통 'ERP 메뉴' 버튼은 해당 모듈 소스 수정이 필요하므로 이번 버전에 포함되지 않았습니다.

## 검증 사항
- 실제 Pages URL 및 GitHub 계정/소유자 확인
- 각 업무 모듈 자체 인증 및 권한 확인
- 700px 이하 모바일 및 PC에서 열기 방식 확인
- 포털 URL 확정 후 업무 모듈의 'ERP 메뉴' 복귀 버튼 별도 구현


## V1.1 연결
- 현재재고: https://hr-comp.github.io/hrcomp-mobile/?menu=stock
- 재고실사: https://hr-comp.github.io/hrcomp-mobile/?menu=count
- 위 링크는 **함께 제공한 hrcomp-mobile 수정본을 배포한 뒤에만** 직접 진입합니다.
- 모바일에서 통합 메뉴 복귀는 현재 브라우저 뒤로 가기를 이용합니다. 포털 배포 URL 확정 후 업무별 ERP 메뉴 버튼 추가 예정.
- 운영 중인 hrcomp-mobile은 수정본 테스트 후 별도로 배포하십시오.


## 2026-10-27 포털 레이아웃 개선
- PC 4열 / 중간 3·2열 / 모바일 1열 반응형 메뉴. 카드/버튼 간격 축소.
- 상단 제목 `ERP 메뉴`, 우측 사용자 정보 표시 공간 마련.
- 현재 포털에 로그인/세션 연계가 없어 `사용자 정보 미연결`을 표시합니다. 실제 인증 확인 후 `window.hrcompPortalSetUser(검증된사용자명)`으로 표시할 수 있습니다. 로그인·로그아웃·권한 기능은 추가하지 않았습니다.
- 기존 메뉴 URL, 활성 상태, 새 탭 실행 방식 유지.


## 2026-10-27 메뉴 빈 화면 방지 패치
- 메뉴 스크립트/설정 파일 로딩 오류가 발생하면 빈 화면 대신 오류 안내를 표시합니다.
- 브라우저 캐시 충돌을 줄이도록 portal.js 및 menu-config.js 로딩 버전을 갱신했습니다.
- 반드시 index.html, css/portal.css, js/portal.js, js/menu-config.js 4개를 동일 배포본으로 업로드하세요.
- GitHub Pages 배포 완료 후 Ctrl+F5로 새로고침하십시오.
- 계속 비어 있으면 개발자 도구(F12) Console/Network의 오류를 확인해야 정확한 원인을 특정할 수 있습니다.
