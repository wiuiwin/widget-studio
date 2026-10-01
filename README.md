# Widget Studio

노션에 임베드하는 위젯 만들기 (Indify 참고). 지금은 시계 위젯만 있습니다.

- 에디터: `index.html` — 설정을 바꾸고 임베드 링크를 복사
- 임베드: `widgets/clock.html?…` — 설정은 전부 URL 쿼리로 받음
- 순수 HTML/CSS/JS, 빌드 없음

로컬 실행: `py -3.11 -m http.server 5180`
