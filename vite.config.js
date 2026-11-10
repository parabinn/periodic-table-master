import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// 배포 경로: Firebase는 '/', GitHub Pages는 '/저장소이름/' (워크플로가 BASE_PATH로 넘겨줌)
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 700, // three.js(3D 엔진)는 전자 배치 탭에서만 따로 불러오는 큰 조각
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',          // 새 버전은 사용자가 '업데이트'를 누를 때 적용
      injectRegister: false,           // 등록은 src/pwa.js에서 직접
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: '주기율표 마스터 - 주기율표 외우기',
        short_name: '주기율표',
        description: '주기율표를 보고·이해하고·외우고·확인하는 학습 앱. 퀴즈, 플래시카드, 3D 오비탈, 맞춤 복습.',
        lang: 'ko',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        theme_color: '#4f46e5',
        background_color: '#f6f7fb',
        categories: ['education'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: '퀴즈 풀기', short_name: '퀴즈', url: base + '#quiz', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: '맞춤 복습', short_name: '복습', url: base + '#rv', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: '플래시카드', short_name: '카드', url: base + '#flash', icons: [{ src: 'icon-192.png', sizes: '192x192' }] }
        ]
      },
      workbox: {
        // 앱 전체(HTML·JS·CSS·아이콘, 3D 엔진 포함)를 미리 저장 → 처음 한 번 열면 오프라인에서도 모든 탭 사용 가능
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: base + 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true
      },
      devOptions: { enabled: false }
    })
  ]
});
