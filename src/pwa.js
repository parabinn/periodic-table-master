/* =========================================================
   PWA: 서비스 워커 등록 · 새 버전 알림 · 오프라인 표시 · 앱 설치 버튼
   서비스 워커와 매니페스트는 vite-plugin-pwa(Workbox)가 빌드할 때 만듭니다.
   ========================================================= */
import { registerSW } from 'virtual:pwa-register';

function toast(html, actions = [], { sticky = false } = {}) {
  const box = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.innerHTML = `<span>${html}</span>`;
  actions.forEach(([label, fn, primary]) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = primary ? 'btn' : 'btn ghost';
    b.onclick = () => { fn && fn(); t.remove(); };
    t.appendChild(b);
  });
  if (!actions.length || !sticky) {
    const x = document.createElement('button');
    x.className = 'toast-x'; x.setAttribute('aria-label', '닫기'); x.textContent = '×';
    x.onclick = () => t.remove(); t.appendChild(x);
  }
  box.appendChild(t);
  if (!sticky) setTimeout(() => t.remove(), 6000);
  return t;
}

export function initPWA() {
  // 1) 서비스 워커: 새 버전이 준비되면 사용자에게 물어보고 교체 (학습 중 갑자기 새로고침되지 않도록)
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        toast('🆕 새 버전이 준비됐어요.', [['지금 업데이트', () => updateSW(true), true], ['나중에', null]], { sticky: true });
      },
      onOfflineReady() {
        toast('✅ 이제 <b>인터넷 없이도</b> 쓸 수 있어요.');
      },
      onRegisterError(e) { console.warn('서비스 워커 등록 실패', e); }
    });
  }

  // 2) 오프라인/온라인 표시
  const badge = document.getElementById('netBadge');
  const net = () => { badge.hidden = navigator.onLine; };
  window.addEventListener('online', () => { net(); toast('🌐 다시 온라인이에요.'); });
  window.addEventListener('offline', () => { net(); toast('📴 오프라인이에요. 저장된 앱으로 계속 공부할 수 있어요.'); });
  net();

  // 3) 앱 설치 버튼 (Chrome·Edge·삼성 인터넷: 설치 창 / iPhone Safari: 안내)
  const btn = document.getElementById('installBtn');
  let deferred = null;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; btn.hidden = false; });
  window.addEventListener('appinstalled', () => { btn.hidden = true; deferred = null; toast('🎉 홈 화면에 설치됐어요!'); });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && !standalone) btn.hidden = false;
  btn.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; }
    else if (isIOS) toast('📲 Safari 아래쪽 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b>를 누르세요.', [], { sticky: false });
  };
}
