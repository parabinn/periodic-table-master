# ⚛️ 주기율표 마스터 (SPA + PWA)

주기율표를 **보고 · 이해하고 · 외우고 · 확인하는** 학습 앱입니다.
페이지를 새로 불러오지 않고 화면만 바꾸는 **SPA** 구조에, 설치와 오프라인 실행이 되는 **PWA** 기능을 더했습니다.

## 기능
- 🧪 주기율표: 원소를 누르면 특징·활용·전자 배치·영상 속 이야기가 나옴
- 📈 주기적 성질: 색칠 주기율표와 원자번호 그래프
- ⚛️ 전자 배치: 3D 오비탈과 보어 모형 애니메이션
- ❓ 퀴즈 · 🎯 맞춤 복습(약점 분석) · 🃏 플래시카드 · 📅 학습달력 · 🏆 순위표(점수 코드)
- 🌓 다크 모드 · 📱 반응형 화면

## SPA · PWA 구조
| 항목 | 방식 |
|---|---|
| 화면 전환 | 해시 라우팅(`#quiz`, `#ec` …): 새로고침 없이 바뀌고, 뒤로 가기와 바로가기 링크가 동작 |
| 코드 분할 | 3D 엔진(three.js, 약 600KB)은 ⚛️ 전자 배치 탭을 열 때만 불러옴 |
| 서비스 워커 | `vite-plugin-pwa`(Workbox)가 앱 전체를 미리 저장(precache) → 한 번 열면 오프라인에서도 모든 탭 사용 가능 |
| 업데이트 | 새 버전이 배포되면 "🆕 새 버전이 준비됐어요 → 지금 업데이트" 알림 (공부 중에 갑자기 새로고침되지 않음) |
| 설치 | Chrome·Edge·삼성 인터넷: 헤더의 **📲 앱 설치** 버튼 / iPhone Safari: 공유 → 홈 화면에 추가 |
| 매니페스트 바로가기 | 앱 아이콘을 길게 누르면 퀴즈·맞춤 복습·플래시카드로 바로 이동 |

```
├─ index.html             화면 구조
├─ src/
│  ├─ main.js             앱 본체 (SPA 라우팅, 퀴즈, 3D 등)
│  ├─ pwa.js              서비스 워커 등록 · 업데이트 알림 · 설치 버튼 · 오프라인 표시
│  ├─ style.css           스타일 (반응형 + 다크 모드)
│  └─ data/               원소·주기적 성질·전자 배치 데이터
├─ public/                아이콘 (make_icons.py로 생성)
├─ vite.config.js         빌드 + PWA(매니페스트·서비스 워커) 설정
└─ firebase.json          Firebase Hosting 설정 (캐시 규칙, SPA 경로 처리)
```

## 개발
```bash
npm install
npm run dev        # 개발 서버 (서비스 워커는 꺼져 있음)
npm run build      # dist/ 에 배포용 파일 생성
npm run preview    # 빌드 결과를 PWA 그대로 미리 보기 (http://localhost:4173)
```

## 🐙 GitHub Pages 배포 (자동)
`main` 브랜치에 push하면 `.github/workflows/pages.yml`이 빌드해서 `https://<계정>.github.io/<저장소>/`에 올립니다.
처음 한 번: 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 선택하세요(워크플로가 자동으로 켜기도 합니다).

## 🔥 Firebase Hosting 배포
1. [Firebase 콘솔](https://console.firebase.google.com/)에서 **프로젝트 만들기** → 왼쪽 메뉴 **Hosting → 시작하기**
2. `.firebaserc`의 `여기에-파이어베이스-프로젝트-ID`를 내 프로젝트 ID로 바꾸기
3. 터미널에서:
   ```bash
   npm install
   npm run firebase:login     # 브라우저가 열리면 Google 계정으로 로그인 (처음 한 번)
   npm run deploy             # 빌드 + 배포
   ```
4. 끝나면 `https://<프로젝트ID>.web.app` 주소가 나옵니다. HTTPS라서 설치·오프라인이 바로 동작합니다.

> 배포 전에 Firebase와 똑같은 규칙으로 미리 보려면: `npm run firebase:preview` → http://127.0.0.1:5000

### (선택) GitHub Actions로 Firebase 배포
저장소 Secrets에 `FIREBASE_SERVICE_ACCOUNT`(서비스 계정 JSON)를 넣고, Actions 탭에서 **Deploy to Firebase Hosting → Run workflow**를 누르세요.

## 참고
- 🏆 온라인 실시간 순위표는 claude.ai 아티팩트 전용 기능이라, Firebase 버전에서는 **점수 코드** 방식으로 동작합니다.
- 학습 기록은 각 기기의 브라우저(localStorage)에 저장됩니다.
- 데이터 출처: IUPAC, RSC 주기율표, 파이썬 패키지 mendeleev v1.3.0. 학습용 요약이므로 정확하지 않을 수 있습니다.
- 3D 엔진: three.js r128 (MIT License)
