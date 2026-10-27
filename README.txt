HR COMP 포털 메뉴 미표시 원인 수정

원인: 원본 portal.js의 updateMode()는 #mode 요소를 참조하지만, 수정 index.html에서 해당 요소가 삭제되어 JavaScript가 메뉴 렌더링 전에 중단됨.
수정: index.html에 <span id="mode" hidden aria-hidden="true"></span> 복원.

적용: index.html 한 파일만 저장소 루트에 교체. CSS/JS는 교체하지 마십시오.
검증: 메뉴 7개 그룹, 23개 항목, 4열 표시 및 활성 메뉴 열기 확인.
주의: 정적 코드 검사만 수행; 브라우저 배포 검증은 필요합니다.
