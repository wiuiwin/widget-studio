# Widget Studio

노션에 임베드하는 시계, 타이머, CD·LP 플레이어, 날씨 위젯입니다.

- 홈: `index.html` — 위젯 목록
- 에디터: `clock/`, `timer/`, `weather/`(날씨·온도·습도·미세먼지, `?kind=`) — 모두 `js/editor.js` 의 `initEditor` 공유
- 임베드: `widgets/clock.html?…`, `widgets/timer.html?…`, `widgets/weather.html?…`
- CD·LP 플레이어: `player/`에서 공개 HTTPS 오디오 파일과 커버를 설정합니다. MP3 자동 커버는 파일 서버가 CORS를 허용하고 지원하는 ID3v2.3/2.4 이미지가 파일 앞부분에 있을 때 표시합니다. 이미지 URL도 직접 지정할 수 있습니다.
- 날씨 데이터: Open-Meteo (무료·키 없음, 15분 캐시). 미세먼지는 Open-Meteo 대기질 모델(예측값) — 설정은 전부 URL 쿼리로 받음 (노션에 붙은 주소라 경로를 바꾸지 않는다)
- 순수 HTML/CSS/JS, 빌드 없음

로컬 실행: `py -3.11 -m http.server 5180`

## 배포할 때

CSS/JS 를 바꿨으면 파일 주소의 `?v=숫자` 를 올린다 (노션·브라우저가 옛 파일을 캐시하는 것 방지).
모든 HTML 과 `js/*.js` 의 import 에 있는 `?v=` 를 같은 숫자로 맞춘다.
