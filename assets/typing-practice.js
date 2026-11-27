// Typing practice: type the word with a Japanese input method, press Submit (回答), and move on when it matches.
(function () {
  "use strict";

  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var KATA_KEY = MAC ? "Ctrl + K" : "F7";

  // Each item: answer (what must be typed), keys (what to press), meaning (English).
  var LESSONS = [
    {
      id: "hiragana", name: "Hiragana",
      intro: "Switch to Japanese mode (あ). Type the romaji and the letters turn into hiragana as you type. Press Enter to confirm without converting, then Enter again (or the button) to submit.",
      items: [
        { answer: "あいうえお", keys: "a i u e o", meaning: "the five vowels" },
        { answer: "ねこ", keys: "n e k o", meaning: "cat" },
        { answer: "さくら", keys: "s a k u r a", meaning: "cherry blossom" },
        { answer: "すし", keys: "s u s h i", meaning: "sushi" },
        { answer: "です", keys: "d e s u", meaning: "is (ends a sentence in する)" }
      ]
    },
    {
      id: "tricky", name: "Tricky kana",
      intro: "A few kana are not typed the way they sound. を is “wo”, ん before a vowel or at the end is “nn”, small っ doubles the next consonant, and the particle は is “ha”.",
      items: [
        { answer: "を", keys: "w o", meaning: "the object particle (sounds like “o”)" },
        { answer: "とは", keys: "t o h a", meaning: "is defined as (sounds like “to-wa”)" },
        { answer: "こんにちは", keys: "k o n n n i c h i h a", meaning: "hello (ん before に needs nn)" },
        { answer: "きって", keys: "k i t t e", meaning: "stamp (small っ: double the t)" },
        { answer: "でんしゃ", keys: "d e n s h a", meaning: "train (small ゃ: sh + a, or s y a)" },
        { answer: "ほん", keys: "h o n n", meaning: "book (ん at the end needs nn)" }
      ]
    },
    {
      id: "katakana", name: "Katakana",
      intro: "Katakana is used for words from other languages. Type the reading, then press " + KATA_KEY + " (or Space and pick the katakana candidate) before Enter. The long-vowel mark ー is the - key.",
      items: [
        { answer: "テスト", keys: "t e s u t o, then " + KATA_KEY, meaning: "test" },
        { answer: "リスト", keys: "r i s u t o, then " + KATA_KEY, meaning: "list (a type in する)" },
        { answer: "ケーキ", keys: "k e - k i, then " + KATA_KEY, meaning: "cake (- types ー)" },
        { answer: "コンピューター", keys: "k o n p y u - t a -, then " + KATA_KEY, meaning: "computer" }
      ]
    },
    {
      id: "kanji", name: "Kanji",
      intro: "For kanji, type the reading in hiragana and press Space to convert. If the first candidate is wrong, press Space again (or use the arrow keys) to pick the right one, then Enter. You only need to know the reading.",
      items: [
        { answer: "日本", keys: "n i h o n, Space", meaning: "Japan (reading: にほん)" },
        { answer: "数", keys: "k a z u, Space", meaning: "number (reading: かず)" },
        { answer: "表示", keys: "h y o u j i, Space", meaning: "display (reading: ひょうじ)" },
        { answer: "文字列", keys: "m o j i r e t s u, Space", meaning: "string (reading: もじれつ)" },
        { answer: "表示する", keys: "h y o u j i s u r u, Space", meaning: "to display (kanji + する)" },
        { answer: "以上です", keys: "i j o u d e s u, Space", meaning: "that’s all (closes a block)" }
      ]
    },
    {
      id: "symbols", name: "Brackets and punctuation",
      intro: "In Japanese mode, [ and ] type 「 and 」, comma and period type 、 and 。. For 『』, type [ and press Space to pick 『 from the candidates.",
      items: [
        { answer: "「する」", keys: "[ s u r u ]", meaning: "a string in する" },
        { answer: "「こんにちは」", keys: "[ k o n n n i c h i h a ]", meaning: "the string “hello”" },
        { answer: "はい、そうです。", keys: "h a i , s o u d e s u .", meaning: "yes, that’s right." },
        { answer: "『おやつ』", keys: "[ Space (pick 『), o y a t s u, ] Space (pick 』)", meaning: "a name with hiragana goes in 『』" }
      ]
    },
    {
      id: "suru", name: "A line of する",
      intro: "Now a whole line. Words are separated by spaces. A full-width space (what Space gives in Japanese mode when nothing is being typed) and an ASCII space both count, and so do full-width digits.",
      items: [
        { answer: "「こんにちは」 を 表示する", keys: "[konnnichiha] Space wo Space hyoujisuru Space", meaning: "display “hello”" },
        { answer: "5 を 二乗する", keys: "5 Space wo Space nijousuru Space", meaning: "square 5 (二乗: にじょう)" },
        { answer: "数列 を 加算する", keys: "suuretsu Space wo Space kasansuru Space", meaning: "add up the list (数列: すうれつ, 加算: かさん)" }
      ]
    }
  ];

  var KEY = "suru-typing-practice";
  var state = load();

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && typeof s.lesson === "number" && typeof s.item === "number" && s.done) return s;
    } catch (e) { /* storage may be unavailable */ }
    return { lesson: 0, item: 0, done: {} };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // Compare ignoring width (全角/半角) and the kind and number of spaces.
  function norm(s) {
    return (s.normalize ? s.normalize("NFKC") : s).replace(/\s+/g, " ").trim();
  }
  function toKatakana(s) {
    return s.replace(/[ぁ-ゖ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); });
  }
  var HIRA = /^[ぁ-ゟー\s「」『』、。]+$/;
  var KANJI = /[一-鿿]/;

  function hintFor(got, want) {
    if (!got) return "Type the word in the box first.";
    if (/^[\x20-\x7e]+$/.test(got)) return "These are Latin letters, so the input method is off. Switch to Japanese mode (あ) and type it again.";
    if (/[a-zA-Z]/.test(got)) {
      if (/n/i.test(got)) return "A letter was left over. A lone n stays as a letter: type nn for ん.";
      return "Some letters were not turned into kana. Check the romaji under “Show the keys”.";
    }
    if (/[ァ-ヺ]/.test(want) && HIRA.test(got) && toKatakana(norm(got)) === norm(want)) return "Right reading! Now turn it into katakana: press " + KATA_KEY + " before Enter, or press Space and pick the katakana.";
    if (KANJI.test(want) && HIRA.test(got) && !KANJI.test(got)) return "That looks like the reading. Press Space to convert it to kanji, pick the right candidate, then Enter.";
    if (want.indexOf("を") >= 0 && got.indexOf("お") >= 0 && norm(got.replace(/お/g, "を")) === norm(want)) return "Almost: を is typed “wo”, not “o”.";
    if (want.indexOf("は") >= 0 && got.indexOf("わ") >= 0 && norm(got.replace(/わ/g, "は")) === norm(want)) return "Almost: the particle は is typed “ha”, even though it sounds like “wa”.";
    if (KANJI.test(want) && KANJI.test(got)) return "Close, but a different kanji came out. Delete it, type the reading again, and press Space a few times to find the right one.";
    return "Not quite. Compare it with the word above, or press “Show the keys”.";
  }

  var $ = function (id) { return document.getElementById(id); };
  var input = $("tp-input"), result = $("tp-result"), next = $("tp-next"), keys = $("tp-keys");
  var solved = false;

  function total() { var n = 0; LESSONS.forEach(function (l) { n += l.items.length; }); return n; }
  function doneCount() { return Object.keys(state.done).length; }

  function renderToc() {
    var ol = $("tp-lessons");
    ol.innerHTML = "";
    LESSONS.forEach(function (l, i) {
      var li = document.createElement("li"), a = document.createElement("a");
      var finished = l.items.every(function (_, j) { return state.done[l.id + "/" + j]; });
      a.href = "#" + l.id;
      a.textContent = l.name + (finished ? " ✓" : "");
      if (i === state.lesson && !state.finished) a.className = "active";
      a.addEventListener("click", function (e) { e.preventDefault(); go(i, 0); });
      li.appendChild(a);
      ol.appendChild(li);
    });
  }

  function render() {
    renderToc();
    if (state.finished) { $("tp").hidden = true; $("tp-done").hidden = false; return; }
    $("tp").hidden = false; $("tp-done").hidden = true;
    var l = LESSONS[state.lesson], it = l.items[state.item];
    $("tp-num").textContent = ("0" + (state.lesson + 1)).slice(-2);
    $("tp-name").textContent = l.name;
    $("tp-intro").textContent = l.intro;
    $("tp-count").textContent = (state.item + 1) + " / " + l.items.length;
    $("tp-fill").style.width = (100 * doneCount() / total()) + "%";
    $("tp-target").textContent = it.answer;
    $("tp-meaning").textContent = it.meaning;
    keys.textContent = "Keys: " + it.keys;
    keys.hidden = true;
    result.textContent = ""; result.className = "tp-result";
    input.value = ""; input.className = "tp-input"; input.readOnly = false;
    next.hidden = true; $("tp-submit").disabled = false; $("tp-skip").hidden = false;
    solved = false;
    input.focus({ preventScroll: true });
  }

  function go(lesson, item) {
    state.lesson = lesson; state.item = item; state.finished = false;
    save(); render();
  }

  function advance() {
    var l = LESSONS[state.lesson];
    if (state.item + 1 < l.items.length) go(state.lesson, state.item + 1);
    else if (state.lesson + 1 < LESSONS.length) go(state.lesson + 1, 0);
    else { state.finished = true; save(); render(); }
  }

  function check() {
    if (solved) { advance(); return; }
    var l = LESSONS[state.lesson], it = l.items[state.item], got = input.value;
    if (norm(got) === norm(it.answer)) {
      solved = true;
      state.done[l.id + "/" + state.item] = true; save();
      var last = state.item + 1 === l.items.length;
      result.textContent = last ? "Success! Lesson complete." : "Success!";
      result.className = "tp-result ok"; input.className = "tp-input ok"; input.readOnly = true;
      $("tp-submit").disabled = true; $("tp-skip").hidden = true;
      next.textContent = last ? (state.lesson + 1 < LESSONS.length ? "Next lesson →" : "Finish →") : "Next →";
      next.hidden = false; next.focus();
      $("tp-fill").style.width = (100 * doneCount() / total()) + "%";
      renderToc();
    } else {
      result.textContent = hintFor(got, it.answer);
      result.className = "tp-result bad"; input.className = "tp-input bad";
    }
  }

  $("tp-form").addEventListener("submit", function (e) { e.preventDefault(); check(); });
  // Enter that confirms the input method's conversion must not submit the answer.
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.isComposing || e.keyCode === 229)) e.preventDefault();
  });
  input.addEventListener("compositionend", function () { input.dataset.composedAt = Date.now(); });
  $("tp-form").addEventListener("submit", function (e) {
    // Safari fires compositionend before the Enter keydown: ignore a submit right after it.
    if (Date.now() - (+input.dataset.composedAt || 0) < 50) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  input.addEventListener("input", function () {
    if (!solved && input.className !== "tp-input") { input.className = "tp-input"; }
  });
  next.addEventListener("click", advance);
  $("tp-skip").addEventListener("click", advance);
  $("tp-hint").addEventListener("click", function () { keys.hidden = !keys.hidden; });
  $("tp-reset").addEventListener("click", function () {
    state = { lesson: 0, item: 0, done: {} }; save(); render();
  });

  var start = LESSONS.findIndex(function (l) { return "#" + l.id === location.hash; });
  if (start >= 0) { state.lesson = start; state.item = 0; state.finished = false; }
  render();
})();
