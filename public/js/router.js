// /public/js/router.js
const FALLBACK_PROD_API =
  'https://blog-hv22enazx-p-ling-2000s-projects.vercel.app';

let API_BASE = ''; // '' 代表同網域（會用相對路徑 /api/...）

async function detectApiBase() {
  try {
    const r = await fetch('/api/ping', { method: 'GET', cache: 'no-store' });
    if (r.ok) {
      API_BASE = '';
      return;
    }
  } catch (_) {}

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

  document.addEventListener('click', async (e) => {
    const link = e.target.closest('[data-panel]');
    if (!link) return;
    e.preventDefault();

    const panel = link.dataset.panel;
    await load(panel, true);
    setActive(panel);
  });

  window.addEventListener('popstate', () => {
    const panel = getPanelFromURL() || 'quiz';
    load(panel, false).then(() => setActive(panel));
  });

  function getPanelFromURL() {
    return location.hash ? location.hash.slice(1) : null;
  }

  async function load(panel, push) {
    try {
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
