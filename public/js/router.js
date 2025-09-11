// /public/js/router.js
/* eslint-disable no-unused-vars, no-empty */
// ファイル全体に適用

// ---- API BASE 自動偵測 ----
const FALLBACK_PROD_API =
  'https://blog-hv22enazx-p-ling-2000s-projects.vercel.app'; //備用的 Vercel正式 API 網址（固定不變）

let API_BASE = ''; // 根據執行環境（同網域 / localhost / 正式伺服器）決定要用哪個 API 基底網址

// ---- 不同步處理: 確保使用者不管用什麼網域都能使用api ----
async function detectApiBase() {
  // 1. 當來自不同網域時，使瀏覽器拿到cors許可，進一步拿取api。
  try {
    const r = await fetch('/api/ping', { method: 'GET', cache: 'no-store' }); //await fetch：等待請求回應。
    if (r.ok) {
      // 如果 r.ok 有收到回傳的布林值 true 代表許可同意。
      API_BASE = '';
      return;
    }
  } catch (_) {} //catch:捕捉錯誤 = 如果沒抓到，就什麼都不做

  // 2. 當來自不是localhost的網域時（例如 GitHub Pages 或 file://），嘗試用本機用 Vercel dev 部屬出 localhost:3000。
  if (location.hostname !== 'localhost') {
    try {
      const r = await fetch('http://localhost:3000/api/ping', {
        method: 'GET', //localhost:3000:「執行程式的人這台電腦」的本機網路埠，要 GET ，要先用 Vercle dev 跑過全部檔案，部屬出 localhost:3000。
        cache: 'no-store',
      });
      if (r.ok) {
        API_BASE = 'http://localhost:3000';
        return;
      }
    } catch (_) {}
  }

  // 3. 前面兩個方式都失敗，使用正式 Vercel 網域
  API_BASE = FALLBACK_PROD_API;
}

// ---- 組裝 apiUrl ----
function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;

  // 三元運算子:判斷 API_BASE ? ... : ...
  // 如果 API_BASE 有值（非空字串），就組合成：API_BASE + path
  // 如果 API_BASE 是空字串 ''，就直接回傳 path
}

// ---- 註冊：監聽HTML，DOMContentLoaded:整份 HTML 結構載入完成後再執行，避免在 DOM 還沒生成時，就找不到元素。 ----
document.addEventListener('DOMContentLoaded', async () => {
  await detectApiBase();
  //先執行前面寫的 detectApiBase()，決定 API_BASE。
  // await:等偵測完成後，才繼續往下跑，確保後面需要 API 的程式有正確的網址。

  const right = document.getElementById('right');
  //抓到要做替換的區塊 ↓
  //去 HTML 裡找 id="right" 的元素，存到定數 right。
  //這個 right 容器就是主內容區塊（右側顯示的地方），之後會用來載入不同的 panel。

  const initial = getPanelFromURL() || 'quiz';
  load(initial, false).then(() => setActive(initial));
  //設定預設頁面 ↓
  //呼叫 getPanelFromURL()，查看網址有沒有 hash (#xxx)。
  //如果網址是 http://example.com/#travel → 會回 "travel"。
  //如果網址沒有 hash → 會回 null。
  // || 'quiz'：如果是 null，就用 'quiz' 當預設值 → 所以 initial 代表「第一次載入要顯示哪個 panel」，預設是 'quiz'。

  //load(initial, false)：載入一開始要顯示的 panel（例如 quiz）
  //false：代表這次不需要改變瀏覽器的歷史紀錄（因為是初始畫面）。
  //.then(() => setActive(initial))：等 load() 完成後，呼叫 setActive(initial)，把對應的導覽選單（nb-link）加上 active 樣式，顯示「這個項目目前被選中」。
  //範例：<a class="nb1 nb-link active" href="#quiz" data-panel="quiz">色々診断</a>

  // ---- 註冊：監聽在導覽列，點擊了哪個項目 ----
  document.addEventListener('click', async (e) => {
    //e 是事件物件，包含了點擊發生的細節（點到誰、滑鼠座標、按下什麼鍵…）。

    const link = e.target.closest('[data-panel]');
    //e.target：使用者實際點到的元素。
    //.closest：使用者不一定是直接點在 <a> 上，可能點到裡面的 <span> 或 <img>。用 closest 可以保證抓到對應的導航連結。
    // ('[data-panel]')：往上找到最近一個 有 data-panel 屬性的元素。

    if (!link) return;
    //如果點擊的東西不是導覽選單（沒有 data-panel 屬性），就直接結束，不做任何事。

    e.preventDefault();
    //阻止瀏覽器的預設行為。預設情況下，點 <a href="#quiz"> 會讓瀏覽器直接跳轉 hash，但這裡不希望瀏覽器自己處理，要用 JS 控制載入內容，所以先擋住。

    const panel = link.dataset.panel;
    //dataset：瀏覽器提供在元素上讀寫 data-* 自訂屬性的介面
    //例：<a data-panel="travel"> → 在 JS 裡用 link.dataset.panel 讀到 "travel"。

    await load(panel, true);
    //去載入對應的 HTML partial（partials/food.html）
    //與此句對應 const res = await fetch(`partials/${panel}.html`, { cache: 'no-cache' });
    //true：要更新瀏覽器歷史紀錄（讓使用者可以用返回鍵回到上一個 panel）。

    setActive(panel);
    //把剛剛點擊的項目加上 .active 樣式，讓選單顯示「目前在哪個頁面」。
  });

  // ---- 註冊：監聽返回鍵 ----
  window.addEventListener('popstate', () => {
    //popstate：當使用者點「返回鍵」或「前進鍵」時觸發。
    //在前面用過 load(panel, true) 所以有了 history.pushState() → 記錄頁面狀態。
    //因此瀏覽器能記住每次切換 panel 的狀態，就能在使用者「返回」時，正確顯示對應的內容，而不是整個頁面重整。

    const panel = getPanelFromURL() || 'quiz';
    //getPanelFromURL() → 檢查網址的 hash，看看是哪個 panel。
    // 如果沒有 hash → 回傳 null → 預設成 'quiz'。

    load(panel, false).then(() => setActive(panel));
    //重新載入對應的部分 HTML。
    //false → 這次不要再 pushState，因為當用戶已經在用「返回」功能了，就不需要再把它又塞進歷史紀錄，否則會形成無限循環。
  });

  // ---- 定義 getPanelFromURL ----
  function getPanelFromURL() {
    return location.hash ? location.hash.slice(1) : null;
    //location.hash：網址的 hash 部分，例如：http://example.com/#travel → "#travel"，http://example.com/ → ""（空字串）
    // .slice(1)：去掉 #，只留下文字。"#travel".slice(1) → "travel"
    // 這樣就能用 "travel" 來載入 partials/travel.html。
  }

  // ---- 不同步處理:載入某個頁面片段 → 顯示在主容器 → 選擇性地更新瀏覽器歷史紀錄與標題 → 啟動該頁功能 ----
  async function load(panel, push) {
    //push → 布林值（true / false）的代名詞，決定這次載入要不要「推進」瀏覽器的歷史紀錄。
    //push === true：例如，點了一個「Quiz」按鈕 → load("quiz", true) → 呼叫 history.pushState(...)，把新的狀態加進瀏覽器歷史。同時網址會變成 ...#quiz 或 ...#about。
    //push = false：通常是 使用者點瀏覽器返回 / 前進按鈕 的時候。

    try {
      const res = await fetch(`partials/${panel}.html`, { cache: 'no-cache' });
      //去抓 partials/ 資料夾下的 HTML 檔（例如 quiz.html 或 about.html）。
      // cache：'no-cache' 是避免瀏覽器讀舊版本，每次都強制重新抓。

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      //res.ok 是 Response 物件內建的 布林屬性。當狀態碼在 200–299 之間時，它會回傳 true，否則就是 false。
      // !res.ok 意思是「如果不成功」 → throw new Error(...)：把錯誤丟出去，讓 catch 處理。

      const html = await res.text();
      //為了把抓到的 HTML 塞進畫面，先將讀取回來的內容轉成文字：HTML 原始碼字串。
      //例如：<section class="quiz"> <h2>診斷測驗</h2> <button id="start">開始</button> </section>

      right.innerHTML = html;
      //innerHTML 是 JavaScript 操作 DOM (Document Object Model) 的功能之一。
      //功能：讀取 → 取得這個元素裡的 HTML 內容（字串）。設定 → 更新元素裡的 HTML（會整個替換掉）。
      //例如：在JS檔 → document.getElementById("box").innerHTML = "<p>Hello!</p>";
      //在 HTML 檔中 <div id="box"> </div> 被修改為 → <div id="box"> <p>Hello!</p> </div>;

      if (push) history.pushState({ panel }, '', `#${panel}`);
      //push：布林值（true / false）的代名詞
      //pushState：紀錄瀏覽歷史
      //1. { panel }：這是一個 狀態物件 (state object)。可以放任何資料（通常是一個 JS 物件），瀏覽器會把它存進「歷史紀錄」裡。
      //使用者點「返回 / 前進」，這個物件會隨著 popstate 事件被帶回來。相當於 { panel: "quiz" } 或 { panel: "about" }，代表目前的頁面狀態。
      //2. ''：標題 (title)。大部分的瀏覽器 忽略這個參數，所以通常寫成 '' 或 null。也就是說，它幾乎不會影響顯示效果。
      //3. `#${panel}`：這是 URL，用來更新網址列。在這裡用 模板字串，例如：panel = "quiz" → URL 變成 ...#quiz。 這樣可以讓使用者看到網址隨頁面切換更新，但不會重新載入整個頁面（這就是 SPA 的關鍵）。

      document.title = titleFor(panel);
      //更新標題
      //呼叫一個 titleFor(panel) 函式，把瀏覽器頁籤的標題換掉，例如「旅行」、「日本生活」等等。

      right.scrollTop = 0;
      //捲動回頂部

      // ---- 創造 DOM 節點 ----
      initPanelScripts(panel, right);
      //right 是 html 是用 fetch(partials/${panel}.html) 載進來的「外部 HTML 檔內容」。
      //把新的html換進來之後，right就裝進了這個新的html檔，然後把整個right交給 initPanelScripts。
      //在這裡創造了DOM 節點，以便在後面自訂函式 function initPanelScripts(panel, root) 可以用root代表新html檔。
    } catch (err) {
      //錯誤處理

      console.error('load failed:', panel, err);
      //如果 fetch 或中途發生錯誤，就在 console 顯示錯誤訊息。

      right.innerHTML = `<p>読み込みに失敗しました。（${panel}）</p>`;
      //同時在畫面上顯示「読み込みに失敗しました。（quiz）」這類提示。
    }
  }

  // ---- 「切換選單上高亮狀態」的函式 ----
  function setActive(panel) {
    document
      .querySelectorAll('.nb-link.active')
      //找出所有同時擁有 .nb-link 和 .active 類別的元素。例如<a class="nb-link active" data-panel="quiz">診斷</a>

      .forEach((a) => a.classList.remove('active'));
    //把剛剛找到的每個元素 a，移除它的 active class。確保畫面上「之前的高亮狀態」先清掉。

    const target = document.querySelector(`.nb-link[data-panel="${panel}"]`);
    //找出 .nb-link 且 data-panel="某值" 的元素。如果 panel = "food" → 找 .nb-link[data-panel="food"]

    if (target) target.classList.add('active');
    //如果找到對應的元素，就加上 active class。這樣就能在 CSS 裡做高亮效果(我沒做)。
  }

  // ---- 自訂函式：titleFor(panel) 根據不同頁面代號，回傳對應的標題文字 ----
  function titleFor(panel) {
    //定義一個叫 titleFor 的自訂函式，參數是 panel（頁面代號，例如 "quiz"、"food"）。

    const map = {
      //物件 (object)，裡面存放「對應表」。左邊是 鍵 (key)，右邊是 值 (value)。

      quiz: '色々診断 | お部屋にぴったりの観葉植物診断',
      food: '美味しい食べ物',
      travel: '旅行',
      life: '日本生活',
      contact: 'ご連絡',
    };
    return map[panel] || 'Home';
    //map[panel]：取出對應的標題字串。
    // 如果 panel = "quiz" → 回傳 '色々診断 | お部屋にぴったりの観葉植物診断'，如果 panel = "travel" → 回傳 '旅行'。
    //'Home'：這是「預設值」(fallback)。
    // 如果 panel 在 map 裡沒有找到 → map[panel] 會是 undefined，這時候就回傳 'Home'。例如 titleFor("xxx") → 回傳 'Home'。
  }

  // ---- 根據不同的 panel，初始化 ----
  function initPanelScripts(panel, root) {
    //root：是函式的參數名稱，剛剛用 innerHTML 載進來的那塊容器(right)

    if (panel === 'quiz') {
      root.querySelector('.btn')?.addEventListener('click', () => {
        //找 .btn 按鈕，若存在，就綁定點擊事件。

        alert('ただいま診断ページを制作中〜');
      });
    }

    // ---- Contact 頁面(panel) ----
    if (panel === 'contact') {
      const form =
        root.querySelector('#contact-form') ||
        root.querySelector('.contact-form');
      //#contact-form → 找 id="contact-form" 的元素。
      // .contact-form → 找 class="contact-form" 的元素。
      // .form-status → 找 class="form-status" 的元素。

      if (!form) return;
      //如果都找不到，就會得到 null。

      const statusEl =
        root.querySelector('.form-status') ||
        //如果沒有class="form-status" 的 DOM 元素 → 就 動態建立一個 DOM 元素，再插入到 form 裡。

        (() => {
          const p = document.createElement('p');
          p.className = 'form-status';
          form.appendChild(p);
          //parent：父元素（DOM 節點）。 child：子元素（DOM 節點）。 作用：把 child 插入到 parent 的最後一個位置。

          return p;
        })();

      // ---- HTML5 表單驗證 API 自訂驗證訊息 (不懂就參考 contact.html，我有筆記規則。) ----
      const nameI = form.querySelector('[name="name"]');
      const mailI = form.querySelector('[name="email"]');
      const msgT = form.querySelector('[name="message"]');

      // ---- 每次都先清除掉先前設定的錯誤訊息 ----
      [nameI, mailI, msgT].forEach(
        (el) =>
          //forEach 會迭代陣列裡的每個元素，並把它傳給呼叫函式的參數。
          //el ：「目前正在處理的那個表單元素」。第一次 el = nameI，第二次 el = mailI，第三次 el = msgT。

          el.addEventListener('input', () => el.setCustomValidity(''))
        //setCustomValidity() 是 HTML5 表單驗證 API 的一個方法。不懂就參考 contact.html，我有筆記規則。
        // 作用：設定一個「自訂錯誤提醒訊息」。
        // ('')（空字串），代表「清除錯誤」，讓欄位恢復正常。
        // 在這段程式裡：當使用者開始輸入內容（input 事件）時 → 清除掉先前設定的錯誤訊息。這樣就不會卡在舊的錯誤狀態裡。
      );

      // ---- 自訂錯誤提醒訊息----
      nameI.addEventListener('invalid', () => {
        //invalid：一個事件的觸發 → 當這個欄位「不合規定」時。

        if (nameI.validity.valueMissing)
          //是不是因為缺少必填值? 如果是...

          nameI.setCustomValidity('お名前を入力してください。');
      });

      mailI.addEventListener('invalid', () => {
        if (mailI.validity.valueMissing)
          mailI.setCustomValidity('メールアドレスを入力してください。');
        else if (mailI.validity.typeMismatch)
          //是不是因為格式不符? 如果是...
          mailI.setCustomValidity('有効なメールアドレスを入力してください。');
      });

      msgT.addEventListener('invalid', () => {
        if (msgT.validity.valueMissing)
          msgT.setCustomValidity('お問い合わせ内容を入力してください。');
      });

      // ---- 送出到 API ----
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        //阻止預設送出（避免整頁 reload）

        if (!form.checkValidity()) {
          //如果整個表單沒有通過...

          form.reportValidity();
          //顯示錯誤訊息在畫面上。

          return;
          //此函式到此結束。
        }

        const data = {
          name: nameI.value.trim(),
          email: mailI.value.trim(),
          message: msgT.value.trim(),
          //trim() 是 JavaScript 的字串方法，用來刪除字串前後的空白字元。

          _gotcha: form.querySelector('[name="_gotcha"]')?.value || '',
          //_gotcha 是「隱藏欄位」，用來防 spam bot(自動填入機器人)。
          //後端會做無視處理。
        };

        // ---- 送出狀態顯示 文字 ----
        statusEl.textContent = '送信中…';
        try {
          const res = await fetch(apiUrl('/api/contact'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            //告訴伺服器「我送的資料是 JSON 格式」。

            body: JSON.stringify(data),
            //把 JavaScript 物件 data 轉成 JSON 字串(改變語法，讓伺服器用JSON 格式讀取)。
          });
          const body = await res.json().catch(() => ({}));
          //res.json() 是 Response 物件的方法，用來把伺服器回傳的資料（通常是 JSON 格式字串）解析成 JavaScript 物件。

          if (res.ok && body.ok) {
            form.reset();
            //表單欄位清空
            statusEl.textContent = '送信しました。ありがとうございました。';
          } else {
            statusEl.textContent =
              body.error || `送信に失敗しました。（${res.status}）`;
            //body.error 是伺服器回傳的 JSON資料。例如 { "ok": false, "error": "メールアドレスが無効です" }
            // → 顯示在頁面上：メールアドレスが無効です。
          }
        } catch (err) {
          console.error(err);
          statusEl.textContent = '通信エラーが発生しました。';
        }
      });
    }
  }
});
