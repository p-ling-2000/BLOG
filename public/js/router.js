// /public/js/router.js
// ---- API BASE 自動偵測 ----
// 規則：
// 1) 若同網域有 /api/ping → 用同網域（Vercel 全端部署時）
// 2) 若在本機，但前端是靜態檔 → 試 http://localhost:3000
// 3) 否則 → 用你提供的正式 API 網域（請改成你的 vercel 網域）
const FALLBACK_PROD_API =
  'https://blog-hv22enazx-p-ling-2000s-projects.vercel.app';

let API_BASE = ''; // '' 代表同網域（會用相對路徑 /api/...）

async function detectApiBase() {
  // 嘗試同網域
  try {
    const r = await fetch('/api/ping', { method: 'GET', cache: 'no-store' });
    if (r.ok) {
      API_BASE = ''; // 同網域可用
      return;
    }
  } catch (_) {}

  // 嘗試本機 Vercel dev（給本機用 GitHub Pages 或 file:// 測試時）
  if (location.hostname !== 'localhost') {
    try {
      const r = await fetch('http://localhost:3000/api/ping', {
        method: 'GET',
        cache: 'no-store',
      });
      if (r.ok) {
        API_BASE = 'http://localhost:3000';
        return;
      }
    } catch (_) {}
  }

  // 最後用正式 Vercel 網域
  API_BASE = FALLBACK_PROD_API;
}

function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path; // '' => 同網域
}

document.addEventListener('DOMContentLoaded', async () => {
  await detectApiBase();

  const right = document.getElementById('right');
  const initial = getPanelFromURL() || 'quiz';
  load(initial, false).then(() => setActive(initial));

  // 側邊導覽的點擊（data-panel）
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('[data-panel]');
    if (!link) return;
    e.preventDefault();

    const panel = link.dataset.panel;
    await load(panel, true);
    setActive(panel);
  });

  // 返回/前進維持同步
  window.addEventListener('popstate', () => {
    const panel = getPanelFromURL() || 'quiz';
    load(panel, false).then(() => setActive(panel));
  });

  function getPanelFromURL() {
    return location.hash ? location.hash.slice(1) : null;
  }

  async function load(panel, push) {
    try {
      // ⚠️ 用「相對路徑」：確保在 GitHub Pages 的子路徑也能抓到
      const res = await fetch(`partials/${panel}.html`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      right.innerHTML = html;

      if (push) history.pushState({ panel }, '', `#${panel}`);
      document.title = titleFor(panel);
      right.scrollTop = 0;

      initPanelScripts(panel, right);
    } catch (err) {
      console.error('load failed:', panel, err);
      right.innerHTML = `<p>読み込みに失敗しました。（${panel}）</p>`;
    }
  }

  function setActive(panel) {
    document
      .querySelectorAll('.nb-link.active')
      .forEach((a) => a.classList.remove('active'));
    const target = document.querySelector(`.nb-link[data-panel="${panel}"]`);
    if (target) target.classList.add('active');
  }

  function titleFor(panel) {
    const map = {
      quiz: '色々診断 | お部屋にぴったりの観葉植物診断',
      food: '美味しい食べ物',
      travel: '旅行',
      life: '日本生活',
      contact: 'ご連絡',
    };
    return map[panel] || 'Home';
  }

  function initPanelScripts(panel, root) {
    if (panel === 'quiz') {
      root.querySelector('.btn')?.addEventListener('click', () => {
        alert('診断を開始します（例）');
      });
    }

    if (panel === 'contact') {
      const form =
        root.querySelector('#contact-form') ||
        root.querySelector('.contact-form');
      if (!form) return;

      const statusEl =
        root.querySelector('.form-status') ||
        (() => {
          const p = document.createElement('p');
          p.className = 'form-status';
          form.appendChild(p);
          return p;
        })();

      // HTML5 驗證訊息（改日文）
      const nameI = form.querySelector('[name="name"]');
      const mailI = form.querySelector('[name="email"]');
      const msgT = form.querySelector('[name="message"]');
      [nameI, mailI, msgT].forEach((el) =>
        el.addEventListener('input', () => el.setCustomValidity(''))
      );
      nameI.addEventListener('invalid', () => {
        if (nameI.validity.valueMissing)
          nameI.setCustomValidity('お名前を入力してください。');
      });
      mailI.addEventListener('invalid', () => {
        if (mailI.validity.valueMissing)
          mailI.setCustomValidity('メールアドレスを入力してください。');
        else if (mailI.validity.typeMismatch)
          mailI.setCustomValidity('有効なメールアドレスを入力してください。');
      });
      msgT.addEventListener('invalid', () => {
        if (msgT.validity.valueMissing)
          msgT.setCustomValidity('お問い合わせ内容を入力してください。');
      });

      // 送出到 API
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const data = {
          name: nameI.value.trim(),
          email: mailI.value.trim(),
          message: msgT.value.trim(),
          _gotcha: form.querySelector('[name="_gotcha"]')?.value || '',
        };

        statusEl.textContent = '送信中…';
        try {
          const res = await fetch(apiUrl('/api/contact'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const body = await res.json().catch(() => ({}));

          if (res.ok && body.ok) {
            form.reset();
            statusEl.textContent = '送信しました。ありがとうございました。';
          } else {
            statusEl.textContent =
              body.error || `送信に失敗しました。（${res.status}）`;
          }
        } catch (err) {
          console.error(err);
          statusEl.textContent = '通信エラーが発生しました。';
        }
      });
    }
  }
});
