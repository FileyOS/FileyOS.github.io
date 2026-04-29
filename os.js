/* ─── FileyOS Core ─── */
'use strict';

// ── State ──────────────────────────────────────────────────────
const OS = {
  windows: {},
  zCounter: 200,
  activeWin: null,
  wallpaperIndex: 0,
  wallpapers: ['aurora','mesh','waves','grid'],
  settings: {
    blur: true,
    animations: true,
    notifications: true,
  }
};

// ── Boot Sequence ───────────────────────────────────────────────
const bootMessages = [
  'Initializing kernel...',
  'Loading FileyFS...',
  'Starting window manager...',
  'Mounting virtual drives...',
  'Loading Scramjet proxy...',
  'Starting desktop...'
];

window.addEventListener('DOMContentLoaded', () => {
  let i = 0;
  const statusEl = document.getElementById('boot-status');
  const interval = setInterval(() => {
    if (i < bootMessages.length) {
      statusEl.textContent = bootMessages[i++];
    } else {
      clearInterval(interval);
    }
  }, 580);

  setTimeout(() => {
    const boot = document.getElementById('boot-screen');
    boot.classList.add('fade-out');
    setTimeout(() => {
      boot.style.display = 'none';
      document.getElementById('lock-screen').style.display = 'flex';
      startClocks();
    }, 800);
  }, 3800);

  drawWallpaper();
  window.addEventListener('resize', drawWallpaper);
  setupDesktop();

  // Pre-init Scramjet in background so browser opens instantly
  initScramjet();
});

// ── Clocks ──────────────────────────────────────────────────────
function startClocks() {
  function update() {
    const now = new Date();
    const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const d = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const lc = document.getElementById('lock-clock');
    const ld = document.getElementById('lock-date');
    const tc = document.getElementById('tray-clock');
    if (lc) lc.textContent = t;
    if (ld) ld.textContent = d;
    if (tc) tc.textContent = t;
  }
  update();
  setInterval(update, 1000);
}

// ── Lock / Unlock ────────────────────────────────────────────────
function unlock() {
  const lock = document.getElementById('lock-screen');
  lock.style.opacity = '0';
  lock.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    lock.style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    notify('Welcome', 'FileyOS is ready. Double-click icons to open apps.', '🗂️');
  }, 500);
}

function lockScreen() {
  closeStartMenu();
  document.getElementById('desktop').style.display = 'none';
  const lock = document.getElementById('lock-screen');
  lock.style.display = 'flex';
  lock.style.opacity = '1';
  lock.style.transition = '';
}

function shutdown() {
  document.body.innerHTML = `
    <div style="background:#000;width:100vw;height:100vh;display:flex;align-items:center;
      justify-content:center;flex-direction:column;gap:16px;">
      <div style="font-size:60px">⏻</div>
      <div style="color:#fff;font-family:Syne,sans-serif;font-size:24px;font-weight:800">
        Shutting down FileyOS...</div>
      <div style="color:#555;font-family:'JetBrains Mono',monospace;font-size:13px">
        It is now safe to close your browser.</div>
    </div>`;
}

// ── Wallpaper ────────────────────────────────────────────────────
function drawWallpaper() {
  const canvas = document.getElementById('wallpaper-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const w = canvas.width, h = canvas.height;

  const wallpapers = {
    aurora: () => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#050d1e');
      g.addColorStop(0.3, '#0a1a3d');
      g.addColorStop(0.6, '#071630');
      g.addColorStop(1, '#02080f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      [[0.3,0.4,'#00d4ff'],[0.5,0.6,'#6600ff'],[0.7,0.5,'#00ff88']].forEach(([cx, cy, color]) => {
        const rg = ctx.createRadialGradient(w*cx, h*cy, 0, w*cx, h*cy, w*0.6);
        rg.addColorStop(0, color + '22');
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, w, h);
      });
      for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.6+0.1})`;
        ctx.fill();
      }
    },
    mesh: () => {
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = 'rgba(0,212,255,0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      [[0.5,0.5,'#00d4ff'],[0.8,0.2,'#6600ff'],[0.2,0.8,'#ff6b35']].forEach(([cx,cy,c]) => {
        const rg = ctx.createRadialGradient(w*cx,h*cy,0,w*cx,h*cy,w*0.4);
        rg.addColorStop(0,c+'33'); rg.addColorStop(1,'transparent');
        ctx.fillStyle=rg; ctx.fillRect(0,0,w,h);
      });
    },
    waves: () => {
      const g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#020810'); g.addColorStop(1,'#030d1e');
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h*0.5);
        for (let x = 0; x <= w; x += 5) {
          ctx.lineTo(x, h*0.4 + Math.sin((x/w)*Math.PI*4 + i*0.8)*60 + i*20);
        }
        ctx.strokeStyle = `rgba(0,212,255,${0.03+i*0.01})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    grid: () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,w,h);
      const size = 30;
      for (let x = 0; x <= w; x += size) {
        for (let y = 0; y <= h; y += size) {
          ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2);
          ctx.fillStyle='rgba(0,212,255,0.15)'; ctx.fill();
        }
      }
      const rg = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w*0.6);
      rg.addColorStop(0,'rgba(0,212,255,0.08)'); rg.addColorStop(1,'transparent');
      ctx.fillStyle=rg; ctx.fillRect(0,0,w,h);
    }
  };
  wallpapers[OS.wallpapers[OS.wallpaperIndex]]();
}

function changeWallpaper() {
  OS.wallpaperIndex = (OS.wallpaperIndex + 1) % OS.wallpapers.length;
  drawWallpaper();
  closeContextMenu();
  notify('Wallpaper', `Changed to: ${OS.wallpapers[OS.wallpaperIndex]}`, '🖼️');
}

// ── Desktop Setup ────────────────────────────────────────────────
function setupDesktop() {
  const desktop = document.getElementById('desktop');
  desktop.addEventListener('contextmenu', e => {
    if (e.target.closest('.os-window') || e.target.closest('#taskbar')) return;
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
  });
  desktop.addEventListener('click', e => {
    if (!e.target.closest('#context-menu')) closeContextMenu();
    if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStartMenu();
    if (!e.target.closest('.desk-icon')) {
      document.querySelectorAll('.desk-icon.selected').forEach(el => el.classList.remove('selected'));
    }
  });
  const nc = document.createElement('div');
  nc.id = 'notif-container';
  document.body.appendChild(nc);
}

function showContextMenu(x, y) {
  const m = document.getElementById('context-menu');
  m.style.left = Math.min(x, window.innerWidth - 200) + 'px';
  m.style.top = Math.min(y, window.innerHeight - 160) + 'px';
  m.classList.add('visible');
}
function closeContextMenu() { document.getElementById('context-menu').classList.remove('visible'); }
function refreshDesktop() { closeContextMenu(); drawWallpaper(); }

// ── Start Menu ───────────────────────────────────────────────────
function toggleStartMenu() {
  const m = document.getElementById('start-menu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
function closeStartMenu() { document.getElementById('start-menu').style.display = 'none'; }

function filterApps(q) {
  document.querySelectorAll('.start-app').forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

// ── Notifications ────────────────────────────────────────────────
function notify(title, body, icon='🗂️') {
  if (!OS.settings.notifications) return;
  const container = document.getElementById('notif-container');
  if (!container) return;
  const n = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = `<div class="notif-title">${icon} ${title}</div><div class="notif-body">${body}</div>`;
  container.appendChild(n);
  setTimeout(() => {
    n.style.transition='opacity 0.4s'; n.style.opacity='0';
    setTimeout(()=>n.remove(), 400);
  }, 3500);
}

// ── Window Manager ────────────────────────────────────────────────
let winIdCounter = 0;

function createWindow({ id, title, icon, width=700, height=480, content, minW=280, minH=180 }) {
  const wid = id || ('win-' + (++winIdCounter));
  if (OS.windows[wid]) { focusWindow(wid); return null; }

  const template = document.getElementById('window-template');
  const win = template.content.cloneNode(true).querySelector('.os-window');
  win.dataset.id = wid;
  win.style.width = width + 'px';
  win.style.height = height + 'px';
  const offset = Object.keys(OS.windows).length * 24;
  win.style.left = (Math.max(90, (window.innerWidth - width) / 2 + offset)) + 'px';
  win.style.top = (Math.max(40, (window.innerHeight - height) / 2 + offset - 22)) + 'px';
  win.style.zIndex = ++OS.zCounter;

  win.querySelector('.win-icon').textContent = icon;
  win.querySelector('.win-title').textContent = title;
  win.querySelector('.win-body').innerHTML = content;

  win.querySelector('.win-close').onclick = () => closeWindow(wid);
  win.querySelector('.win-min').onclick   = () => minimizeWindow(wid);
  win.querySelector('.win-max').onclick   = () => maximizeWindow(wid);
  win.addEventListener('mousedown', () => focusWindow(wid));

  makeDraggable(win, win.querySelector('.win-titlebar'));
  makeResizable(win, win.querySelector('.win-resize-handle'), minW, minH);

  document.getElementById('windows-container').appendChild(win);
  OS.windows[wid] = { el: win, title, icon, minimized: false, maximized: false };
  addTaskbarItem(wid, title, icon);
  focusWindow(wid);
  return wid;
}

function focusWindow(wid) {
  Object.values(OS.windows).forEach(w => w.el.classList.remove('active'));
  document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active'));
  if (!OS.windows[wid]) return;
  OS.windows[wid].el.style.zIndex = ++OS.zCounter;
  OS.windows[wid].el.classList.add('active');
  document.querySelector(`.taskbar-item[data-wid="${wid}"]`)?.classList.add('active');
  OS.activeWin = wid;
}

function closeWindow(wid) {
  if (!OS.windows[wid]) return;
  OS.windows[wid].el.remove();
  delete OS.windows[wid];
  document.querySelector(`.taskbar-item[data-wid="${wid}"]`)?.remove();
}

function minimizeWindow(wid) {
  if (!OS.windows[wid]) return;
  OS.windows[wid].el.classList.toggle('minimized');
  OS.windows[wid].minimized = !OS.windows[wid].minimized;
}

function maximizeWindow(wid) {
  if (!OS.windows[wid]) return;
  const w = OS.windows[wid];
  if (w.maximized) {
    w.el.classList.remove('maximized');
    w.el.style.left   = w._prevLeft;
    w.el.style.top    = w._prevTop;
    w.el.style.width  = w._prevWidth;
    w.el.style.height = w._prevHeight;
    w.maximized = false;
  } else {
    w._prevLeft   = w.el.style.left;
    w._prevTop    = w.el.style.top;
    w._prevWidth  = w.el.style.width;
    w._prevHeight = w.el.style.height;
    w.el.classList.add('maximized');
    w.maximized = true;
  }
}

// ── Drag ─────────────────────────────────────────────────────────
function makeDraggable(win, handle) {
  let ox, oy, dragging = false;
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.win-controls')) return;
    if (OS.windows[win.dataset.id]?.maximized) return;
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    document.body.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, e.clientX - ox)) + 'px';
    win.style.top  = Math.max(0, Math.min(window.innerHeight - win.offsetHeight - 44, e.clientY - oy)) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; document.body.style.cursor = ''; });
}

// ── Resize ────────────────────────────────────────────────────────
function makeResizable(win, handle, minW, minH) {
  let resizing = false, startX, startY, startW, startH;
  handle.addEventListener('mousedown', e => {
    e.stopPropagation();
    resizing = true;
    startX = e.clientX; startY = e.clientY;
    startW = win.offsetWidth; startH = win.offsetHeight;
    document.body.style.cursor = 'se-resize';
  });
  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    win.style.width  = Math.max(minW, startW + (e.clientX - startX)) + 'px';
    win.style.height = Math.max(minH, startH + (e.clientY - startY)) + 'px';
  });
  document.addEventListener('mouseup', () => { resizing = false; document.body.style.cursor = ''; });
}

// ── Taskbar Items ─────────────────────────────────────────────────
function addTaskbarItem(wid, title, icon) {
  const bar  = document.getElementById('taskbar-apps');
  const item = document.createElement('div');
  item.className   = 'taskbar-item';
  item.dataset.wid = wid;
  item.innerHTML   = `<span>${icon}</span><span>${title}</span>`;
  item.onclick = () => {
    const w = OS.windows[wid];
    if (!w) return;
    if (w.minimized) { w.el.classList.remove('minimized'); w.minimized = false; focusWindow(wid); }
    else if (OS.activeWin === wid) { minimizeWindow(wid); }
    else { focusWindow(wid); }
  };
  bar.appendChild(item);
}

// ── App Launcher ──────────────────────────────────────────────────
function openApp(appName) {
  closeStartMenu();
  const apps = {
    browser:    openBrowser,
    files:      openFiles,
    games:      openGames,
    terminal:   openTerminal,
    notepad:    openNotepad,
    calculator: openCalculator,
    settings:   openSettings,
    paint:      openPaint,
  };
  if (apps[appName]) apps[appName]();
}

// ═════════════════════════════════════════════════════════════════
// SCRAMJET PROXY
// ═════════════════════════════════════════════════════════════════
//
// Required files in your repo root (from release zips):
//
//   /sw.js                      ← Scramjet service worker (see sw.js file)
//   /scram/scramjet.all.js      ← loaded in <head>
//   /scram/scramjet.wasm.wasm   ← WASM rewriter
//   /scram/scramjet.sync.js     ← sync helper
//   /baremux/bare.cjs           ← loaded in <head>
//   /baremux/worker.js          ← BareMux transport worker
//   /epoxy/index.mjs            ← Wisp transport module
//
// Download links:
//   Scramjet  → https://github.com/MercuryWorkshop/scramjet/releases/latest
//   BareMux   → https://github.com/MercuryWorkshop/bare-mux/releases/latest
//   Epoxy     → https://github.com/MercuryWorkshop/epoxy-transport/releases/latest

let _sjReady       = false;
let _sjInitPromise = null;
let _sjController  = null;

async function initScramjet() {
  if (_sjReady) return true;
  if (_sjInitPromise) return _sjInitPromise;

  _sjInitPromise = (async () => {
    try {
      // 1 ── Register the Scramjet service worker at repo root
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers not supported.');
      }
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      console.log('[FileyOS] SW registered ✓');

      // 2 ── Build ScramjetController
      //      $scramjetLoadController() is exposed by /scram/scramjet.all.js
      const { ScramjetController } = $scramjetLoadController();

      _sjController = new ScramjetController({
        prefix: '/scramjet/',
        files: {
          wasm: '/scram/scramjet.wasm.wasm',
          all:  '/scram/scramjet.all.js',
          sync: '/scram/scramjet.sync.js',
        },
        codec: {
          encode: (url) => encodeURIComponent(url),
          decode: (url) => decodeURIComponent(url),
        },
        flags: {
          captureErrors:  true,
          strictRewrites: false,
        },
      });

      await _sjController.init();

      // 3 ── Set Wisp as the transport via BareMux
      //      BareMux is exposed by /baremux/bare.cjs
      const conn = new BareMux.BareMuxConnection('/baremux/worker.js');
      await conn.setTransport('/epoxy/index.mjs', [
        { wisp: 'wss://wisp.mercuryworkshop.com/' }
      ]);

      _sjReady = true;
      console.log('[FileyOS] Scramjet ready ✓');
      return true;
    } catch (err) {
      console.error('[FileyOS] Scramjet init failed:', err);
      _sjInitPromise = null; // allow retry
      return false;
    }
  })();

  return _sjInitPromise;
}

// ═════════════════════════════════════════════════════════════════
// BROWSER APP
// ═════════════════════════════════════════════════════════════════
function openBrowser() {
  if (OS.windows['browser']) { focusWindow('browser'); return; }
  createWindow({
    id: 'browser', title: 'FileyBrowser', icon: '🌐',
    width: 900, height: 580,
    content: buildBrowserUI(),
  });
  setupBrowserEvents();
}

function buildBrowserUI() {
  return `
  <div style="display:flex;flex-direction:column;height:100%;">
    <div class="browser-bar">
      <button class="browser-nav-btn" id="bb-back"    title="Back">◀</button>
      <button class="browser-nav-btn" id="bb-forward" title="Forward">▶</button>
      <button class="browser-nav-btn" id="bb-reload"  title="Reload">↺</button>
      <input  class="browser-url" id="bb-url" type="text"
              placeholder="Enter URL or search…" autocomplete="off" />
      <button class="browser-go" id="bb-go">Go</button>
    </div>
    <div id="bb-content" style="flex:1;overflow:hidden;position:relative;">
      ${buildBrowserHome()}
    </div>
  </div>`;
}

function buildBrowserHome() {
  return `
  <div class="browser-home">
    <div style="font-size:48px">🌐</div>
    <h2>FileyBrowser</h2>
    <p>Powered by <strong>Scramjet</strong> + Wisp — no backend server required.</p>
    <div class="browser-bookmarks">
      <div class="bookmark" onclick="browserNavigate('https://google.com')">🔍 Google</div>
      <div class="bookmark" onclick="browserNavigate('https://youtube.com')">▶️ YouTube</div>
      <div class="bookmark" onclick="browserNavigate('https://github.com')">🐙 GitHub</div>
      <div class="bookmark" onclick="browserNavigate('https://wikipedia.org')">📚 Wikipedia</div>
      <div class="bookmark" onclick="browserNavigate('https://reddit.com')">🤖 Reddit</div>
      <div class="bookmark" onclick="browserNavigate('https://discord.com')">💬 Discord</div>
    </div>
    <p style="font-size:11px;color:#3a5a7a;max-width:480px;line-height:1.6;">
      Ensure <code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px">/sw.js</code>,
      <code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px">/scram/</code>,
      <code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px">/baremux/</code> and
      <code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px">/epoxy/</code>
      are present in your GitHub Pages repo.
    </p>
  </div>`;
}

function setupBrowserEvents() {
  setTimeout(() => {
    const win = OS.windows['browser']?.el;
    if (!win) return;

    const urlInput = win.querySelector('#bb-url');
    const goBtn    = win.querySelector('#bb-go');
    const backBtn  = win.querySelector('#bb-back');
    const fwdBtn   = win.querySelector('#bb-forward');
    const relBtn   = win.querySelector('#bb-reload');

    const navigate = () => {
      const val = urlInput?.value.trim();
      if (val) browserNavigate(val);
    };

    goBtn?.addEventListener('click', navigate);
    urlInput?.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(); });

    backBtn?.addEventListener('click', () => {
      win.querySelector('#bb-proxy-frame')?.contentWindow?.history.back();
    });
    fwdBtn?.addEventListener('click', () => {
      win.querySelector('#bb-proxy-frame')?.contentWindow?.history.forward();
    });
    relBtn?.addEventListener('click', () => {
      win.querySelector('#bb-proxy-frame')?.contentWindow?.location.reload();
    });
  }, 60);
}

window.browserNavigate = async function(url) {
  const win = document.querySelector('.os-window[data-id="browser"]');
  if (!win) return;

  const content  = win.querySelector('#bb-content');
  const urlInput = win.querySelector('#bb-url');

  // Normalise URL
  let target = url.trim();
  if (!target.startsWith('http') && !target.includes('.')) {
    target = 'https://www.google.com/search?q=' + encodeURIComponent(target);
  } else if (!target.startsWith('http')) {
    target = 'https://' + target;
  }

  if (urlInput) urlInput.value = target;

  // Loading spinner
  content.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;
      justify-content:center;height:100%;gap:14px;color:#7a9bb5;">
      <div style="font-size:38px;animation:float 1.5s ease-in-out infinite">🌐</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;">
        Connecting via Scramjet…</div>
      <div style="font-size:11px;opacity:0.5">${target}</div>
    </div>`;

  // Init Scramjet (no-op if already done)
  const ok = await initScramjet();

  if (!ok || !_sjController) {
    content.innerHTML = `
      <div class="browser-home">
        <div style="font-size:48px">⚠️</div>
        <h2 style="color:#ff6b35">Scramjet failed to load</h2>
        <p>Make sure all proxy files are present in your repo and
           <code>/sw.js</code> is in the root. Check the browser console for details.</p>
        <div class="browser-bookmarks">
          <div class="bookmark" onclick="window.open('${target}','_blank')">
            ↗️ Open directly in new tab
          </div>
          <div class="bookmark"
            onclick="document.querySelector('#bb-content').innerHTML=buildBrowserHome()">
            🏠 Home
          </div>
        </div>
      </div>`;
    return;
  }

  try {
    // Encode the target URL through Scramjet
    const proxyUrl = _sjController.encodeUrl(target);

    content.innerHTML = '';
    const frame = document.createElement('iframe');
    frame.id = 'bb-proxy-frame';
    frame.style.cssText = 'width:100%;height:100%;border:none;background:#fff;';
    frame.src = proxyUrl;

    // Sync address bar when proxied page navigates internally
    frame.addEventListener('load', () => {
      try {
        const decoded = _sjController.decodeUrl(
          frame.contentWindow?.location.href || ''
        );
        if (decoded && urlInput) urlInput.value = decoded;
      } catch (_) { /* cross-origin — ignore */ }
    });

    content.appendChild(frame);
  } catch (err) {
    console.error('[FileyOS] browserNavigate error:', err);
    content.innerHTML = `
      <div class="browser-home">
        <div style="font-size:48px">⚠️</div>
        <h2 style="color:#ff6b35">Navigation Error</h2>
        <p>${err.message}</p>
        <div class="browser-bookmarks">
          <div class="bookmark" onclick="window.open('${target}','_blank')">
            ↗️ Open in new tab
          </div>
          <div class="bookmark"
            onclick="document.querySelector('#bb-content').innerHTML=buildBrowserHome()">
            🏠 Home
          </div>
        </div>
      </div>`;
  }
};

// ═════════════════════════════════════════════════════════════════
// FILES APP
// ═════════════════════════════════════════════════════════════════
const virtualFS = {
  Desktop:   { type: 'folder', children: { 'readme.txt': { type: 'file', content: 'Welcome to FileyOS!' } } },
  Documents: { type: 'folder', children: { 'notes.txt': { type: 'file', content: 'My notes…' } } },
  Downloads: { type: 'folder', children: {} },
  Music:     { type: 'folder', children: {} },
  Pictures:  { type: 'folder', children: {} },
  Videos:    { type: 'folder', children: {} },
};

function openFiles() {
  if (OS.windows['files']) { focusWindow('files'); return; }
  createWindow({ id: 'files', title: 'Files', icon: '🗂️', width: 700, height: 460,
    content: buildFilesUI() });
}

function buildFilesUI() {
  const entries = Object.entries(virtualFS).map(([name, meta]) => `
    <div class="file-item">
      <div class="file-icon">${meta.type === 'folder' ? '📁' : '📄'}</div>
      <div class="file-name">${name}</div>
    </div>`).join('');
  return `<div class="files-body">
    <div class="files-path">🏠 FileyOS &nbsp;›&nbsp; Home</div>
    <div class="files-grid">${entries}</div>
  </div>`;
}

// ═════════════════════════════════════════════════════════════════
// GAMES LAUNCHER
// ═════════════════════════════════════════════════════════════════
const gamesList = [
  { name: 'Snake',       icon: '🐍', desc: 'Classic snake',    file: 'games/snake.html' },
  { name: 'Tetris',      icon: '🟦', desc: 'Block stacking',   file: 'games/tetris.html' },
  { name: 'Breakout',    icon: '🧱', desc: 'Break the bricks', file: 'games/breakout.html' },
  { name: 'Memory',      icon: '🃏', desc: 'Card matching',    file: 'games/memory.html' },
  { name: 'Minesweeper', icon: '💣', desc: 'Find the mines',   file: 'games/minesweeper.html' },
  { name: 'Pong',        icon: '🏓', desc: 'Classic 2-player', file: 'games/pong.html' },
  { name: '2048',        icon: '🔢', desc: 'Number merging',   file: 'games/2048.html' },
  { name: 'Flappy Bird', icon: '🐦', desc: 'Tap to fly',       file: 'games/flappy.html' },
];

function openGames() {
  if (OS.windows['games']) { focusWindow('games'); return; }
  const cards = gamesList.map(g => `
    <div class="game-card" onclick="launchGame('${g.name}','${g.icon}','${g.file}')">
      <div class="game-card-icon">${g.icon}</div>
      <div class="game-card-name">${g.name}</div>
      <div class="game-card-desc">${g.desc}</div>
    </div>`).join('');
  createWindow({ id: 'games', title: 'Games', icon: '🎮', width: 620, height: 440,
    content: `<div style="padding:10px 0 0"><div class="games-grid">${cards}</div></div>` });
}

window.launchGame = function(name, icon, file) {
  createWindow({
    id: 'game-' + name, title: name, icon,
    width: 620, height: 520,
    content: `<iframe src="${file}"
      style="width:100%;height:100%;border:none;background:#000;"
      allow="autoplay"></iframe>`,
  });
};

// ═════════════════════════════════════════════════════════════════
// TERMINAL APP
// ═════════════════════════════════════════════════════════════════
const termHistory = [];
let termHistIdx = -1;
let termCwd = '~';

function openTerminal() {
  if (OS.windows['terminal']) { focusWindow('terminal'); return; }
  createWindow({
    id: 'terminal', title: 'Terminal', icon: '💻', width: 640, height: 400,
    content: `
    <div class="terminal-body" id="term-body">
      <div class="terminal-output" id="term-out">
        <span class="info">FileyOS Terminal v1.0</span>\n<span class="info">Type 'help' for commands.</span>\n\n
      </div>
      <div class="terminal-input-row">
        <span class="terminal-prompt" id="term-prompt">guest@fileos:~$&nbsp;</span>
        <input class="terminal-input" id="term-input" type="text"
               spellcheck="false" autocomplete="off" />
      </div>
    </div>`,
  });
  setTimeout(() => {
    const input = document.getElementById('term-input');
    if (!input) return;
    input.focus();
    input.addEventListener('keydown', handleTermInput);
  }, 60);
}

function handleTermInput(e) {
  const input = e.target;
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    if (cmd) { termHistory.unshift(cmd); termHistIdx = -1; }
    input.value = '';
    termRun(cmd);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (termHistIdx < termHistory.length - 1) { termHistIdx++; input.value = termHistory[termHistIdx]; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (termHistIdx > 0) { termHistIdx--; input.value = termHistory[termHistIdx]; }
    else { termHistIdx = -1; input.value = ''; }
  }
}

function termRun(cmd) {
  const out    = document.getElementById('term-out');
  const prompt = document.getElementById('term-prompt');
  if (!out) return;

  const append = (text, cls='') => {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text;
    out.appendChild(span);
    out.appendChild(document.createTextNode('\n'));
  };

  append(`guest@fileos:${termCwd}$ ${cmd}`);
  const [base, ...args] = cmd.trim().split(/\s+/);

  const commands = {
    help:     () => append('Commands: help, ls, pwd, cd, echo, clear, date, whoami, neofetch, open, uname', 'info'),
    ls:       () => append('Desktop  Documents  Downloads  Music  Pictures  Videos'),
    pwd:      () => append('/home/guest/' + termCwd.replace('~', '')),
    cd:       () => { termCwd = args[0] || '~'; if (prompt) prompt.textContent = `guest@fileos:${termCwd}$\u00a0`; },
    echo:     () => append(args.join(' ')),
    clear:    () => { out.innerHTML = ''; },
    date:     () => append(new Date().toString()),
    whoami:   () => append('guest', 'info'),
    uname:    () => append('FileyOS 1.0.0 x86_64 WebEngine/Scramjet'),
    neofetch: () => append(
`  🗂️  FileyOS
  ──────────────────────────
  OS:      FileyOS 1.0
  Kernel:  WebEngine 1.0
  Shell:   FileyTerminal
  Browser: FileyBrowser
  Proxy:   Scramjet + Wisp
  CPU:     JavaScript Runtime
  RAM:     ∞ MB`, 'info'),
    open: () => { if (args[0]) openApp(args[0]); else append('Usage: open <appname>', 'err'); },
    '':   () => {},
  };

  if (commands[base] !== undefined) commands[base]();
  else append(`Command not found: ${base}. Type 'help' for help.`, 'err');

  out.scrollTop = out.scrollHeight;
}

// ═════════════════════════════════════════════════════════════════
// NOTEPAD
// ═════════════════════════════════════════════════════════════════
function openNotepad() {
  if (OS.windows['notepad']) { focusWindow('notepad'); return; }
  createWindow({
    id: 'notepad', title: 'Notepad', icon: '📝', width: 580, height: 460,
    content: `
    <div class="notepad-body">
      <div class="notepad-toolbar">
        <button onclick="notepadSave()">💾 Save</button>
        <button onclick="notepadClear()">🗑️ Clear</button>
        <button onclick="notepadCopy()">📋 Copy</button>
        <select id="notepad-font"
          onchange="document.getElementById('notepad-ta').style.fontFamily=this.value"
          style="background:var(--surface2);border:1px solid var(--border);
                 color:var(--text);border-radius:6px;padding:4px;font-size:12px;">
          <option value="'JetBrains Mono',monospace">Monospace</option>
          <option value="Syne,sans-serif">Syne</option>
          <option value="serif">Serif</option>
        </select>
      </div>
      <textarea class="notepad-textarea" id="notepad-ta"
                placeholder="Start typing…"></textarea>
    </div>`,
  });
}

window.notepadSave = function() {
  const text = document.getElementById('notepad-ta')?.value || '';
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'note-' + Date.now() + '.txt';
  a.click();
  notify('Notepad', 'File saved!', '📝');
};
window.notepadClear = function() { const ta = document.getElementById('notepad-ta'); if (ta) ta.value = ''; };
window.notepadCopy  = function() {
  const text = document.getElementById('notepad-ta')?.value || '';
  navigator.clipboard.writeText(text).then(() => notify('Notepad', 'Copied!', '📋'));
};

// ═════════════════════════════════════════════════════════════════
// CALCULATOR
// ═════════════════════════════════════════════════════════════════
function openCalculator() {
  if (OS.windows['calculator']) { focusWindow('calculator'); return; }
  createWindow({
    id: 'calculator', title: 'Calculator', icon: '🧮',
    width: 300, height: 460, minW: 280, minH: 420,
    content: buildCalcUI(),
  });
}

function buildCalcUI() {
  const btns = [
    ['C','cls','clear'], ['±','pm','op'], ['%','pct','op'], ['÷','div','op'],
    ['7','7',''],        ['8','8',''],    ['9','9',''],    ['×','mul','op'],
    ['4','4',''],        ['5','5',''],    ['6','6',''],    ['−','sub','op'],
    ['1','1',''],        ['2','2',''],    ['3','3',''],    ['＋','add','op'],
    ['0','0','zero'],    ['.','.','' ],   ['=','eq','eq'],
  ];
  const grid = btns.map(([label, val, cls]) =>
    `<button class="calc-btn ${cls}" onclick="calcInput('${val}')">${label}</button>`
  ).join('');
  return `
  <div class="calc-body">
    <div class="calc-display">
      <div class="calc-expr"   id="calc-expr"></div>
      <div class="calc-result" id="calc-result">0</div>
    </div>
    <div class="calc-grid" style="grid-template-columns:repeat(4,1fr)">${grid}</div>
  </div>`;
}

const calc = { expr: '', result: '0', op: null, prev: null, fresh: true };

window.calcInput = function(val) {
  const expr = document.getElementById('calc-expr');
  const res  = document.getElementById('calc-result');
  if (!res) return;
  switch (val) {
    case 'cls': calc.expr=''; calc.result='0'; calc.op=null; calc.prev=null; calc.fresh=true; break;
    case 'pm':  calc.result = (parseFloat(calc.result) * -1).toString(); break;
    case 'pct': calc.result = (parseFloat(calc.result) / 100).toString(); break;
    case 'div': case 'mul': case 'sub': case 'add':
      calc.prev  = parseFloat(calc.result); calc.op = val;
      calc.expr  = calc.result + ' ' + { div:'÷', mul:'×', sub:'−', add:'＋' }[val];
      calc.fresh = true; break;
    case 'eq':
      if (calc.op && calc.prev !== null) {
        const a = calc.prev, b = parseFloat(calc.result);
        const ops = { div: a/b, mul: a*b, sub: a-b, add: a+b };
        calc.result = (ops[calc.op] ?? 0).toString();
        if (calc.result.length > 12)
          calc.result = parseFloat(parseFloat(calc.result).toPrecision(10)).toString();
        calc.expr=''; calc.op=null; calc.prev=null; calc.fresh=true;
      } break;
    case '.':
      if (calc.fresh) { calc.result='0.'; calc.fresh=false; }
      else if (!calc.result.includes('.')) calc.result += '.';
      break;
    default:
      if (calc.fresh) { calc.result=val; calc.fresh=false; }
      else { calc.result = calc.result==='0' ? val : calc.result+val; }
  }
  if (res)  res.textContent  = calc.result;
  if (expr) expr.textContent = calc.expr;
};

// ═════════════════════════════════════════════════════════════════
// SETTINGS
// ═════════════════════════════════════════════════════════════════
function openSettings() {
  if (OS.windows['settings']) { focusWindow('settings'); return; }
  createWindow({ id: 'settings', title: 'Settings', icon: '⚙️', width: 640, height: 440,
    content: buildSettingsUI() });
}

function buildSettingsUI() {
  return `
  <div class="settings-body">
    <div class="settings-sidebar">
      <div class="settings-nav-item active" onclick="settingsNav(this,'general')">🖥️ General</div>
      <div class="settings-nav-item"        onclick="settingsNav(this,'appearance')">🎨 Appearance</div>
      <div class="settings-nav-item"        onclick="settingsNav(this,'proxy')">🌐 Proxy</div>
      <div class="settings-nav-item"        onclick="settingsNav(this,'about')">ℹ️ About</div>
    </div>
    <div class="settings-content" id="settings-content">
      ${settingsGeneral()}
    </div>
  </div>`;
}

function settingsGeneral() {
  return `
  <div class="settings-section">
    <h3>General</h3>
    <div class="settings-row">
      <span class="settings-label">Notifications</span>
      <div class="settings-toggle ${OS.settings.notifications?'on':''}"
           onclick="toggleSetting(this,'notifications')"></div>
    </div>
    <div class="settings-row">
      <span class="settings-label">Blur Effects</span>
      <div class="settings-toggle ${OS.settings.blur?'on':''}"
           onclick="toggleSetting(this,'blur')"></div>
    </div>
    <div class="settings-row">
      <span class="settings-label">Animations</span>
      <div class="settings-toggle ${OS.settings.animations?'on':''}"
           onclick="toggleSetting(this,'animations')"></div>
    </div>
  </div>`;
}

window.settingsNav = function(el, section) {
  document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  const content = document.getElementById('settings-content');
  if (!content) return;
  const sections = {
    general: settingsGeneral,
    appearance: () => `
      <div class="settings-section">
        <h3>Appearance</h3>
        <div class="settings-row">
          <span class="settings-label">Wallpaper</span>
          <button style="background:var(--accent);color:#000;border:none;padding:6px 14px;
            border-radius:8px;cursor:pointer;font-family:var(--font);font-weight:700;"
            onclick="changeWallpaper()">Change</button>
        </div>
        <div style="margin-top:16px;color:var(--text2);font-size:13px;">
          Current: ${OS.wallpapers[OS.wallpaperIndex]}
        </div>
      </div>`,
    proxy: () => `
      <div class="settings-section">
        <h3>Proxy — Scramjet</h3>
        <div class="settings-row">
          <span class="settings-label">Status</span>
          <span style="color:${_sjReady?'#00ff88':'#ff6b35'};font-size:13px;font-family:var(--mono);">
            ${_sjReady ? '✓ Ready' : '○ Not initialised'}
          </span>
        </div>
        <div class="settings-row">
          <span class="settings-label">Transport</span>
          <span style="font-size:12px;color:var(--text2);font-family:var(--mono);">
            Wisp — wss://wisp.mercuryworkshop.com/
          </span>
        </div>
        <div class="settings-row">
          <span class="settings-label">Service Worker</span>
          <span style="font-size:13px;font-family:var(--mono);color:var(--text2);">/sw.js</span>
        </div>
        <div style="margin-top:14px;">
          <button onclick="initScramjet()"
            style="background:var(--accent);color:#000;border:none;padding:8px 18px;
            border-radius:8px;cursor:pointer;font-family:var(--font);font-weight:700;">
            Re-initialise Scramjet
          </button>
        </div>
      </div>`,
    about: () => `
      <div class="settings-section">
        <h3>About FileyOS</h3>
        <div style="font-size:48px;margin-bottom:12px;">🗂️</div>
        <div style="font-size:24px;font-weight:800;margin-bottom:6px;">FileyOS v1.0</div>
        <div style="color:var(--text2);font-size:13px;line-height:1.9;">
          A web-based OS hosted on GitHub Pages.<br>
          Built with vanilla HTML, CSS &amp; JavaScript.<br><br>
          <span style="color:var(--accent)">Browser</span> — Scramjet + Wisp proxy<br>
          <span style="color:var(--accent)">Window Manager</span> — custom drag &amp; resize<br>
          <span style="color:var(--accent)">Games</span> — 8 built-in games
        </div>
      </div>`,
  };
  content.innerHTML = (sections[section] || sections.general)();
};

window.toggleSetting = function(el, key) {
  el.classList.toggle('on');
  OS.settings[key] = el.classList.contains('on');
};

// ═════════════════════════════════════════════════════════════════
// PAINT
// ═════════════════════════════════════════════════════════════════
function openPaint() {
  if (OS.windows['paint']) { focusWindow('paint'); return; }
  createWindow({ id: 'paint', title: 'Paint', icon: '🎨', width: 720, height: 520,
    content: buildPaintUI() });
  setTimeout(() => initPaint(), 60);
}

function buildPaintUI() {
  const colors = [
    '#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00',
    '#ff00ff','#00ffff','#ff6b35','#00d4ff','#6600ff','#ff4488','#888888','#ffaa00',
  ];
  const colorBtns = colors.map(c =>
    `<div class="paint-color" style="background:${c}" onclick="paintSetColor('${c}')"></div>`
  ).join('');
  return `
  <div class="paint-body">
    <div class="paint-toolbar">
      <div class="paint-colors">${colorBtns}</div>
      <label style="font-size:12px;color:var(--text2);">Size:</label>
      <input class="paint-size" type="number" id="paint-size" value="4" min="1" max="50" style="width:50px;" />
      <button class="paint-btn active" id="paint-pen"    onclick="paintTool('pen')">✏️ Pen</button>
      <button class="paint-btn"        id="paint-eraser" onclick="paintTool('eraser')">🧽 Eraser</button>
      <button class="paint-btn"        id="paint-fill"   onclick="paintTool('fill')">🪣 Fill</button>
      <button class="paint-btn" onclick="paintClear()">🗑️ Clear</button>
      <button class="paint-btn" onclick="paintDownload()">💾 Save</button>
    </div>
    <div class="paint-canvas-wrap">
      <canvas class="paint-canvas" id="paint-canvas" width="1200" height="800"></canvas>
    </div>
  </div>`;
}

const paint = { drawing: false, color: '#000000', tool: 'pen', lastX: 0, lastY: 0 };

function initPaint() {
  const canvas = document.getElementById('paint-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  canvas.addEventListener('mousedown', e => {
    paint.drawing = true;
    const r  = canvas.getBoundingClientRect();
    const sx = canvas.width  / r.width;
    const sy = canvas.height / r.height;
    paint.lastX = (e.clientX - r.left) * sx;
    paint.lastY = (e.clientY - r.top)  * sy;
    if (paint.tool === 'fill') {
      floodFill(ctx, Math.round(paint.lastX), Math.round(paint.lastY), paint.color);
      paint.drawing = false;
    }
  });
  canvas.addEventListener('mousemove', e => {
    if (!paint.drawing) return;
    const r  = canvas.getBoundingClientRect();
    const sx = canvas.width  / r.width;
    const sy = canvas.height / r.height;
    const x  = (e.clientX - r.left) * sx;
    const y  = (e.clientY - r.top)  * sy;
    const size = parseInt(document.getElementById('paint-size')?.value || '4');
    ctx.beginPath();
    ctx.lineWidth   = paint.tool === 'eraser' ? size * 4 : size;
    ctx.strokeStyle = paint.tool === 'eraser' ? '#ffffff' : paint.color;
    ctx.moveTo(paint.lastX, paint.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    paint.lastX = x; paint.lastY = y;
  });
  canvas.addEventListener('mouseup',    () => { paint.drawing = false; });
  canvas.addEventListener('mouseleave', () => { paint.drawing = false; });
}

window.paintSetColor = function(c) {
  paint.color = c;
  document.querySelectorAll('.paint-color').forEach(el => {
    el.classList.toggle('active',
      el.style.background === c || el.style.background === hexToRgb(c));
  });
};
window.paintTool = function(t) {
  paint.tool = t;
  ['pen','eraser','fill'].forEach(n => document.getElementById('paint-'+n)?.classList.remove('active'));
  document.getElementById('paint-'+t)?.classList.add('active');
};
window.paintClear = function() {
  const canvas = document.getElementById('paint-canvas');
  if (!canvas) return;
  canvas.getContext('2d').fillStyle = '#fff';
  canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
};
window.paintDownload = function() {
  const canvas = document.getElementById('paint-canvas');
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = 'paint-' + Date.now() + '.png';
  a.href = canvas.toDataURL();
  a.click();
  notify('Paint', 'Image saved!', '🎨');
};

function hexToRgb(hex) {
  return `rgb(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)})`;
}
function floodFill(ctx, x, y, fillColor) {
  const canvas    = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data      = imageData.data;
  const idx       = (y * canvas.width + x) * 4;
  const target    = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
  const fill      = hexToRgbArr(fillColor);
  if (target.every((v,i) => v === fill[i])) return;
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    const i = (cy * canvas.width + cx) * 4;
    if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
    if (!matchColor(data, i, target)) continue;
    data[i]=fill[0]; data[i+1]=fill[1]; data[i+2]=fill[2]; data[i+3]=255;
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
  }
  ctx.putImageData(imageData, 0, 0);
}
function matchColor(data, i, t) {
  return data[i]===t[0] && data[i+1]===t[1] && data[i+2]===t[2] && data[i+3]===t[3];
}
function hexToRgbArr(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16), 255];
}
