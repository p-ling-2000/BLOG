const I18N = {
  ja: {
    title: 'あなたにぴったりの観葉植物',
    intro: '性格×インテリアの好みから',
    start: '診断',
    result_title: 'あなたにぴったりの観葉植物は...',
  },
  zh: {
    title: '最適合你的觀葉植物',
    intro: '個性×居家風格',
    start: '測驗',
    result_title: '最適合你的觀葉植物是...',
  },
};

const KEY = 'lang';
const SUPPORTED = ['ja', 'zh'];
const $ = (s) => document.querySelector(s);

function normalizeLang(l) {
  return SUPPORTED.includes(l) ? l : 'ja';
}

function getLang() {
  const saved = localStorage.getItem(KEY);
  return normalizeLang(saved || document.documentElement.lang || 'ja');
}

function setLang(l) {
  localStorage.setItem(KEY, normalizeLang(l));
}

function applyI18n() {
  const lang = getLang();
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const token = el.getAttribute('data-i18n');
    const text = I18N[lang]?.[token];
    if (typeof text === 'string') el.textContent = text;
  });

  // ボタン表示も更新（「現在: JA｜切替先: ZH」の例）
  const btn = $('#lang-toggle');
  if (btn) {
    btn.textContent = lang === 'ja' ? '日本語' : '繁中';
    btn.setAttribute('aria-label', `toggle language (current: ${lang})`);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // もし過去に en が保存されていたら初回で矯正
  setLang(getLang());
  applyI18n();

  const btn = $('#lang-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = getLang() === 'ja' ? 'zh' : 'ja';
      setLang(next);
      applyI18n();
    });
  }
});
