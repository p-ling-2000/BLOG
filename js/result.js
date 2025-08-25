// js/result.js
(() => {
  // ===== 言語設定 =====
  const LANGS = ['ja', 'zh'];
  const ls = window.localStorage;
  const getSavedLang = () => ls.getItem('lang');
  let lang = LANGS.includes(getSavedLang()) ? getSavedLang() : 'ja';
  document.documentElement.lang = lang;

  const $ = (s, r = document) => r.querySelector(s);
  const elMain = $('#result');
  const elToggle = $('#lang-toggle');

  // ===== 植物データ =====
  const PLANTS = {
    monstera: {
      name: { ja: 'モンステラ', zh: '龜背芋（Monstera）' },
      why: {
        ja: 'ユニークな葉の切れ込みが“個性派・アート好き”にぴったり。',
        zh: '獨特裂葉很對「個性派／愛藝術感」的胃口。',
      },
      tips: {
        ja: '明るい場所で。水は土が乾いたらたっぷり。',
        zh: '明亮散射光；土乾再澆透。',
      },
    },
    pothos: {
      name: { ja: 'ポトス', zh: '綠蘿（Pothos）' },
      why: {
        ja: '丸みのある葉とツルの動きが“やさしい・ナチュラル派”に。',
        zh: '圓潤葉形與垂墜蔓型，適合溫柔自然派。',
      },
      tips: {
        ja: '丈夫で初心者向け。水やりは気持ち控えめでもOK。',
        zh: '耐陰好養，新手友善；澆水略少也行。',
      },
    },
    sansevieria: {
      name: { ja: 'サンスベリア', zh: '虎尾蘭（Sansevieria）' },
      why: {
        ja: '直立ミニマル。忙しくても形が崩れにくい。',
        zh: '直立極簡，耐操不易亂長，忙碌也能顧。',
      },
      tips: {
        ja: '乾燥気味を好む。水やりは少なめで。',
        zh: '喜乾不喜濕；寧乾勿濕。',
      },
    },
    pachira: {
      name: { ja: 'パキラ', zh: '發財樹（Pachira）' },
      why: {
        ja: '明るく元気。新芽がどんどん出る“主役級”。',
        zh: '明亮有朝氣，新芽勤快，存在感主角級。',
      },
      tips: {
        ja: '明るい室内で。風通しよく、夏は水多め。',
        zh: '室內明亮通風；夏季水量稍多。',
      },
    },
    gajumaru: {
      name: { ja: 'ガジュマル', zh: '榕樹（Ficus microcarpa）' },
      why: {
        ja: '樹形づくりを楽しみたい“じっくり派”に最高。',
        zh: '適合喜歡細心修剪、慢慢養型的你。',
      },
      tips: {
        ja: '明るい日陰で。剪定で“自分だけの樹姿”に。',
        zh: '明亮散射光；適度修剪做出專屬樹形。',
      },
    },
  };
  const MAP = ['monstera', 'pothos', 'sansevieria', 'pachira']; // 1→4択のマップ

  function compute(answers) {
    const score = { monstera: 0, pothos: 0, sansevieria: 0, pachira: 0 };
    answers.forEach((ans) => {
      if (typeof ans === 'number') score[MAP[ans]]++;
    });
    // ガジュマル加点（Q5=②, Q7=②） 0-based index
    const IDX_Q5 = 4; // Q5 の配列インデックス
    const IDX_Q7 = 6; // Q7 の配列インデックス
    let gBonus = 0;
    if (answers[IDX_Q5] === 1) gBonus++;
    if (answers[IDX_Q7] === 1) gBonus++;

    // ランキング
    const list = Object.entries(score).sort((a, b) => b[1] - a[1]);
    const [topKey, topPts] = list[0];
    const secondPts = list[1] ? list[1][1] : 0;

    // 条件：g>=2 && (topPts - secondPts) <= 1 → ガジュマル
    const key = gBonus >= 2 && topPts - secondPts <= 1 ? 'gajumaru' : topKey;
    return { key, score, g: gBonus };
  }

  function render() {
    const el = elMain || document.body;
    el.innerHTML = '';

    const answers = JSON.parse(ls.getItem('quiz_answers') || '[]');
    if (!answers.length) {
      const p = document.createElement('p');
      p.textContent =
        lang === 'ja'
          ? '回答が見つかりません。最初からやり直してください。'
          : '找不到作答資料，請從頭再試一次。';
      el.appendChild(p);
      return;
    }

    const { key, score, g } = compute(answers);
    const plant = PLANTS[key];

    const card = document.createElement('section');
    card.style.padding = '16px';
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '12px';
    card.style.marginTop = '8px';

    const h2 = document.createElement('h2');
    h2.textContent = lang === 'ja' ? '診断結果' : '診斷結果';
    card.appendChild(h2);

    const name = document.createElement('p');
    name.style.font = '700 18px/1.2 system-ui';
    name.textContent =
      (lang === 'ja' ? 'あなたにぴったり：' : '最適植物：') + plant.name[lang];
    card.appendChild(name);

    const why = document.createElement('p');
    why.textContent = plant.why[lang];
    card.appendChild(why);

    const tips = document.createElement('p');
    tips.textContent =
      (lang === 'ja' ? 'お世話ヒント：' : '照顧小撇步：') + plant.tips[lang];
    card.appendChild(tips);

    const scoreBox = document.createElement('p');
    scoreBox.style.background = '#f8f8f8';
    scoreBox.style.padding = '10px';
    const rows = MAP.map((k) => {
      const label = PLANTS[k].name[lang];
      return `${label}: ${score[k]}`;
    }).join(' / ');
    scoreBox.textContent =
      (lang === 'ja' ? 'スコア - ' : '分數 - ') +
      rows +
      (g
        ? lang === 'ja'
          ? `（ガジュマル加点 ${g}）`
          : `（榕樹加分 ${g}）`
        : '');
    card.appendChild(scoreBox);

    const again = document.createElement('button');
    again.type = 'button';
    again.textContent = lang === 'ja' ? 'もう一度やる' : '再玩一次';
    again.style.marginTop = '12px';
    again.style.padding = '10px 14px';
    again.style.border = 'none';
    again.style.borderRadius = '999px';
    again.style.background = '#4caf50';
    again.style.color = '#fff';
    again.addEventListener('click', () => {
      // 回答状態をリセット（言語設定 app_lang は残す）
      ls.removeItem('quiz_answers');
      ls.removeItem('quiz_current');
      // 最初の画面へ戻る
      location.replace('index.html'); // ← 履歴を置き換える（戻るで結果に戻らない）
      // location.assign("index.html"); // ← 戻るで結果に戻りたい場合はこちら
    });
    card.appendChild(again);

    el.appendChild(card);
  }

  if (elToggle) {
    elToggle.addEventListener('click', () => {
      const newLang = lang === 'ja' ? 'zh' : 'ja';
      ls.setItem('app_lang', newLang);
      document.documentElement.lang = newLang;
      lang = newLang;
      render();
    });
    elToggle.textContent = lang === 'ja' ? 'JA | ZH' : 'ZH | JA';
  }

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
