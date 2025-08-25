// js/quiz.js
(() => {
  // ===== 言語設定（共通） =====
  const LANGS = ['ja', 'zh'];
  const ls = window.localStorage;
  const getSavedLang = () => ls.getItem('lang');
  const setSavedLang = (lang) => ls.setItem('lang', lang);

  // 預設是日文
  let lang;
  if (LANGS.includes(getSavedLang())) {
    lang = getSavedLang();
  } else {
    lang = 'ja';
  }

  document.documentElement.lang = lang;

  const getEl = (s, r = document) => r.querySelector(s);
  const getAll = (s, r = document) => Array.from(r.querySelectorAll(s));
  const elMain = getEl('#quiz');
  const elToggle = getEl('#lang-toggle');

  // ===== 質問データ（必要なら data/quiz.json に外出し可） =====
  const QUESTIONS = [
    {
      id: 'q1',
      prompt: { ja: '今のおうちのインテリアは…', zh: '我家現在的室內風格是…' },
      options: [
        { ja: '個性派アートっぽい！', zh: '個性派、很有藝術感！' },
        { ja: 'ふんわりナチュラルだよ。', zh: '柔柔的自然風。' },
        { ja: 'すっきりミニマル！', zh: '俐落極簡！' },
        { ja: 'ぱっと明るく主役だよ♪', zh: '明亮、就是主角♪' },
      ],
    },
    {
      id: 'q2',
      prompt: { ja: '形は…のが好き！', zh: '我喜歡…的形狀！' },
      options: [
        { ja: 'ユニーク（穴・切れ込み）', zh: '獨特（有孔洞／裂口）' },
        { ja: '丸みとたれ感♡', zh: '圓潤、有垂墜感♡' },
        { ja: 'シャープで端正', zh: '銳利又端正' },
        { ja: '大きな葉で映え', zh: '大葉子、很顯眼' },
      ],
    },
    {
      id: 'q3',
      prompt: { ja: 'お世話のペースは…がいいな。', zh: '照顧節奏…最剛好。' },
      options: [
        { ja: '週1〜2回くらい', zh: '大約每週 1〜2 次' },
        { ja: 'こまめ', zh: '勤快照顧' },
        { ja: '最小限', zh: '越少越好' },
        { ja: 'ときどき様子見', zh: '偶爾看看狀況' },
      ],
    },
    {
      id: 'q4',
      prompt: { ja: '育ち方は…のが楽しい！', zh: '生長方式…最讓我開心！' },
      options: [
        { ja: '大きな葉がドラマチックに開く', zh: '大葉子戲劇性地展開' },
        { ja: 'つる〜っと伸びる♪', zh: '蔓蔓地往外長♪' },
        { ja: 'しゃんと直立してくれる', zh: '挺直站好不倒' },
        { ja: '新芽がどんどん出る', zh: '新芽一直冒' },
      ],
    },
    {
      id: 'q5',
      prompt: { ja: '…とき、いちばんうれしいな。', zh: '…的時候，我最開心。' },
      options: [
        { ja: '模様や穴がふえる', zh: '花紋或孔洞變多' },
        {
          ja: '樹形づくりをじっくり楽しめる♡（※加点）',
          zh: '能慢慢修出理想樹形♡（※加分）',
        },
        { ja: '手がかからない', zh: '省手省心' },
        { ja: '新芽で部屋が明るくなる', zh: '新芽讓房間更明亮' },
      ],
    },
    {
      id: 'q6',
      prompt: { ja: '置き場所は…がいいな。', zh: '擺放位置…最好。' },
      options: [
        { ja: '明るい見せ場', zh: '明亮的展示位' },
        { ja: '棚や窓辺', zh: '層架或窗邊' },
        { ja: 'やや暗め', zh: '偏暗處' },
        { ja: 'デスクまわり', zh: '書桌周邊' },
      ],
    },
    {
      id: 'q7',
      prompt: { ja: 'ほしい効果は…かな？', zh: '我想要的效果是…嗎？' },
      options: [
        { ja: 'クリエイティブにわくわく', zh: '讓創作力嗨起來' },
        {
          ja: 'ほっと落ち着いて愛着を育てたい♡（※加点）',
          zh: '想要放鬆沉靜、培養感情♡（※加分）',
        },
        { ja: '生活をしゃんと整える', zh: '把生活整理得更有條理' },
        { ja: '元気と開放感', zh: '活力與開闊感' },
      ],
    },
    {
      id: 'q8',
      prompt: { ja: 'サイズ感は…がちょうどいい♪', zh: '尺寸感…剛剛好♪' },
      options: [
        { ja: '大きめで主役級', zh: '大尺寸、主角級' },
        { ja: '中くらい', zh: '中等' },
        { ja: 'スリムで省スペース', zh: '纖細、省空間' },
        { ja: '小〜中の“ちいさな木”感', zh: '小〜中等的「小小樹」感' },
      ],
    },
  ];

  // ===== 状態 =====
  let answers = JSON.parse(ls.getItem('quiz_answers') || '[]');
  let current = Number(ls.getItem('quiz_current') || 0);

  function stylePrimary(btn) {
    btn.style.padding = '10px 14px';
    btn.style.border = 'none';
    btn.style.borderRadius = '999px';
    btn.style.background = '#4caf50';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
  }
  function styleSecondary(btn) {
    btn.style.padding = '10px 14px';
    btn.style.border = '1px solid #bbb';
    btn.style.borderRadius = '999px';
    btn.style.background = '#fff';
    btn.style.color = '#333';
    btn.style.cursor = 'pointer';
  }

  function render() {
    elMain.innerHTML = '';
    const total = QUESTIONS.length;

    // 進度
    const bar = document.createElement('div');
    bar.innerHTML = `
      <div style="height:8px;background:#eee;border-radius:999px;overflow:hidden;">
        <div style="height:8px;background:#4caf50;width:${(current / total) * 100}%"></div>
      </div>
      <p style="margin:6px 0 0;font-size:12px;color:#666;">
        ${lang === 'ja' ? '質問' : '題目'} ${Math.min(current + 1, total)} / ${total}
      </p>`;
    elMain.appendChild(bar);

    if (current >= total) {
      // 全問回答チェック
      if (
        answers.length !== total ||
        answers.some((a) => typeof a !== 'number')
      ) {
        current = answers.findIndex((a) => typeof a !== 'number');
        if (current === -1) current = 0;
        ls.setItem('quiz_current', current);
        render();
        return;
      }
      // 保存＆遷移
      ls.setItem('quiz_answers', JSON.stringify(answers));
      window.location.href = 'result.html';
      return;
    }

    const q = QUESTIONS[current];
    const card = document.createElement('section');
    card.style.padding = '16px';
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '12px';
    card.style.marginTop = '8px';

    const h2 = document.createElement('h2');
    h2.textContent = q.prompt[lang];
    h2.style.margin = '0 0 12px';
    card.appendChild(h2);

    const list = document.createElement('div');
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt[lang];
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.textAlign = 'left';
      btn.style.padding = '12px';
      btn.style.margin = '8px 0';
      btn.style.border = '1px solid #ccc';
      btn.style.borderRadius = '10px';
      btn.style.background = answers[current] === i ? '#e8f5e9' : '#fff';
      btn.addEventListener('click', () => {
        answers[current] = i;
        ls.setItem('quiz_answers', JSON.stringify(answers));
        getAll('.quiz-option', list).forEach(
          (b) => (b.style.background = '#fff')
        );
        btn.style.background = '#e8f5e9';
      });
      btn.className = 'quiz-option';
      list.appendChild(btn);
    });
    card.appendChild(list);

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginTop = '12px';

    const back = document.createElement('button');
    back.textContent = lang === 'ja' ? 'もどる' : '上一步';
    back.disabled = current === 0;
    styleSecondary(back);
    back.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      ls.setItem('quiz_current', current);
      render();
    });

    const next = document.createElement('button');
    next.textContent =
      current < QUESTIONS.length - 1
        ? lang === 'ja'
          ? 'つぎへ'
          : '下一題'
        : lang === 'ja'
          ? '結果へ'
          : '看結果';
    stylePrimary(next);
    next.addEventListener('click', () => {
      if (typeof answers[current] !== 'number') {
        next.blur();
        next.style.transform = 'translateX(2px)';
        setTimeout(() => (next.style.transform = ''), 120);
        return;
      }
      current = Math.min(QUESTIONS.length, current + 1);
      ls.setItem('quiz_current', current);
      render();
    });

    row.append(back, next);
    card.appendChild(row);
    elMain.appendChild(card);
  }

  function updateLangButton() {
    if (!elToggle) return;
    elToggle.textContent = lang === 'ja' ? 'JA | ZH' : 'ZH | JA';
    elToggle.setAttribute(
      'aria-label',
      lang === 'ja' ? '言語を切り替え（日本語/中文）' : '切換語言（日文/中文）'
    );
  }
  if (elToggle) {
    elToggle.addEventListener('click', () => {
      lang = lang === 'ja' ? 'zh' : 'ja';
      document.documentElement.lang = lang;
      setSavedLang(lang);
      updateLangButton();
      render();
    });
    updateLangButton();
  }

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
