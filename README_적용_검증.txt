HR COMP 비밀번호관리 1차 구현 (통합 포털 원본 기준)

포함: 원본 포털 파일 + 로그인 화면 비밀번호관리 링크 + password.html/js/password.js
로그인 전: 이메일 인증 링크 발송 -> 이메일 링크 접속 -> 새 비밀번호 등록
로그인 후: password.html?mode=change 에서 현재 비밀번호 확인 -> 변경

중요 배포 전 설정
1. Supabase Authentication > URL Configuration 의 Redirect URLs에 배포 주소 /password.html 추가
2. 메일 발송 설정, 사용자 이메일 등록/확인 상태 확인
3. 로그인 후 메뉴는 md_menu의 web_url에 배포된 password.html?mode=change 지정 (menu_code 실제값 확인)
4. 로그인 전 최초등록은 관리자에 의해 Supabase Auth 계정이 생성되어 있고 등록 이메일을 받을 수 있는 사용자만 가능
5. 기존 VBA md_pw는 변경하지 않음. WEB 로그인 암호(Supabase Auth)만 변경
6. 배포 전 테스트 환경에서 비밀번호 복구 링크와 세션 처리 검증 필수
7. 이 패치는 포털 저장소 안에 비밀번호 페이지를 배치하는 1차 방식. 별도 독립 배포 모듈로 이전할 경우 URL 및 포털 링크 조정 필요

검증: 정적 코드 작성. 실제 Supabase 메일/브라우저 테스트 미수행.
