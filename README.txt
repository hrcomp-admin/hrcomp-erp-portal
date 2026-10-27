포털 메뉴 미표시 원인 수정

원인: index.html 내 destinations 객체 선언 직후 즉시 실행 함수 사이 문장 구분 누락으로 발생한 JavaScript 런타임 오류.
수정: destinations 선언 종료에 세미콜론 추가.
적용: 저장소 루트 index.html만 교체 후 배포. 나머지 파일 유지.
