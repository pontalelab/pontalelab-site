/* ============================================================
   Pontalelab — why.js
   TOPページの「今日のなんで」ウィジェット。

   質問データはSupabaseに手動で登録する（投稿フォーム・管理画面は
   今回のスコープ外）。is_public=trueの行だけをSupabaseの
   Data API（PostgREST）から匿名クライアントとして読み取り、
   日付（JST）から決定的に1件選んで表示する。サーバー側のcron等は
   使わない＝「日替わり」は表示のたびにブラウザ側で計算するだけ。

   データが1件も無い場合・取得に失敗した場合は、セクションごと
   非表示のままにする（壊れた見た目を出さない）。
   ============================================================ */
(function () {
  // TODO: 実際のSupabaseプロジェクトの値に差し替えてください。
  // どちらも「公開されて問題ない」鍵です（Supabaseのanon keyは
  // RLSと組み合わせて使う前提の公開鍵で、service role keyとは別物です）。
  const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
  const SUPABASE_ANON_KEY = "YOUR-SUPABASE-ANON-KEY";

  /**
   * 日本時間の「今日の日付文字列（YYYY-MM-DD）」から、決定的に
   * 0〜count-1のインデックスを1つ算出する。
   * サーバー側の状態を一切持たず、同じ日なら誰がいつアクセスしても
   * 同じ結果になる（＝「今日の一問」が固定される）。
   */
  function pickTodayIndex(count) {
    const jstDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    let hash = 0;
    for (let i = 0; i < jstDateStr.length; i++) {
      hash = (hash * 31 + jstDateStr.charCodeAt(i)) >>> 0;
    }
    return hash % count;
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function showAnswer(item, optionsWrap, reveal, clickedBtn) {
    optionsWrap.querySelectorAll("button").forEach((b) => {
      b.disabled = true;
      b.classList.toggle("is-selected", b === clickedBtn);
    });

    reveal.appendChild(createEl("h3", "nande-reveal-heading", "🔬 ポンターレラボの答え"));
    reveal.appendChild(createEl("p", "nande-answer", item.answer_short));

    if (item.lab_comment) {
      reveal.appendChild(createEl("h3", "nande-reveal-heading", "🧪 ポンターレラボからのひとこと"));
      reveal.appendChild(createEl("p", "nande-comment", item.lab_comment));
    }

    reveal.hidden = false;
  }

  function renderNandeCard(item) {
    const card = document.getElementById("nande-card");
    if (!card) return;
    card.innerHTML = "";

    card.appendChild(createEl("div", "nande-emoji", item.emoji || "❓"));
    card.appendChild(createEl("p", "nande-question", item.question));
    card.appendChild(createEl("p", "nande-prompt", "🤔 どうしてだと思う？"));

    const optionsWrap = createEl("div", "nande-options");
    card.appendChild(optionsWrap);

    const reveal = createEl("div", "nande-reveal");
    reveal.hidden = true;
    card.appendChild(reveal);

    const options = Array.isArray(item.options) ? item.options.filter(Boolean) : [];

    if (options.length > 0) {
      options.forEach((optionText, idx) => {
        const btn = createEl("button", "nande-option-btn", optionText);
        btn.type = "button";
        btn.setAttribute("data-ga-event", "nande_reveal");
        btn.setAttribute("data-ga-cta", "option_" + (idx + 1));
        btn.addEventListener("click", () => showAnswer(item, optionsWrap, reveal, btn));
        optionsWrap.appendChild(btn);
      });
    } else {
      // 選択肢が無い質問でも、答えを見るための入り口は用意しておく
      const btn = createEl("button", "nande-option-btn nande-see-answer-btn", "答えを見る");
      btn.type = "button";
      btn.setAttribute("data-ga-event", "nande_reveal");
      btn.setAttribute("data-ga-cta", "see_answer");
      btn.addEventListener("click", () => showAnswer(item, optionsWrap, reveal, btn));
      optionsWrap.appendChild(btn);
    }
  }

  async function initNandeOfTheDay() {
    const section = document.getElementById("nande-section");
    if (!section) return;

    if (!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR-PROJECT-REF") !== -1) {
      console.info(
        "[Pontalelab] 今日のなんで: Supabaseの接続先が未設定のため非表示です。js/why.js を参照してください。"
      );
      return;
    }

    try {
      const endpoint =
        SUPABASE_URL +
        "/rest/v1/nande_questions" +
        "?select=id,emoji,question,options,answer_short,lab_comment" +
        "&is_public=eq.true" +
        "&order=display_order.asc.nullslast,created_at.asc";

      const res = await fetch(endpoint, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
        },
      });

      if (!res.ok) {
        throw new Error("nande_questions fetch failed: " + res.status);
      }

      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return; // 公開データが無い場合はセクションごと非表示のまま
      }

      const todayItem = rows[pickTodayIndex(rows.length)];
      renderNandeCard(todayItem);
      section.hidden = false;
    } catch (err) {
      // 取得に失敗しても他のページ機能に影響を与えないよう、
      // ここで握りつぶしてセクションは非表示のままにする
      console.info("[Pontalelab] 今日のなんでの取得に失敗しました（表示を省略します）", err);
    }
  }

  document.addEventListener("DOMContentLoaded", initNandeOfTheDay);
})();
