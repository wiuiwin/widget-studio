# Widget Studio

노션에 임베드하는 시계, 타이머, CD·LP 플레이어, 날씨 위젯입니다.

- 홈: `index.html` — 위젯 목록
- 에디터: `clock/`, `timer/`, `weather/`(날씨·온도·습도·미세먼지, `?kind=`) — 모두 `js/editor.js` 의 `initEditor` 공유
- 임베드: `widgets/clock.html?…`, `widgets/timer.html?…`, `widgets/weather.html?…`
- CD·LP 플레이어: `player/`에서 오디오(최대 20MB)와 커스텀 이미지(최대 5MB)를 선택해 미리 보고, GitHub 키로 공개 저장소의 `media/`에 올린 뒤 노션 링크를 복사합니다. 키에는 `widget-studio` 저장소의 Contents 읽기·쓰기 권한만 지정합니다. 커스텀 이미지를 선택하지 않으면 지원되는 MP3의 내장 커버를 표시합니다.
- 임베드 위젯 위에 마우스를 올려 **위젯 수정**을 누르면 현재 설정을 이어서 편집할 수 있습니다. 복사한 새 링크로 노션의 임베드 주소를 교체합니다.
- 날씨 데이터: Open-Meteo (무료·키 없음, 15분 캐시). 미세먼지는 Open-Meteo 대기질 모델(예측값) — 설정은 전부 URL 쿼리로 받음 (노션에 붙은 주소라 경로를 바꾸지 않는다)
- 순수 HTML/CSS/JS, 빌드 없음

로컬 실행: `py -3.11 -m http.server 5180`

## 배포할 때

CSS/JS 를 바꿨으면 파일 주소의 `?v=숫자` 를 올린다 (노션·브라우저가 옛 파일을 캐시하는 것 방지).
모든 HTML 과 `js/*.js` 의 import 에 있는 `?v=` 를 같은 숫자로 맞춘다.
