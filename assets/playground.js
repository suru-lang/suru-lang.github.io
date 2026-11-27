// する (suru) playground — the page side. The program runs in assets/playground-worker.js.
(function () {
  "use strict";

  var ja = document.documentElement.lang === "ja";
  var T = ja ? {
    loading: "する を読み込んでいます…(初回は数秒かかります)",
    ready: "準備ができました",
    running: "実行中…",
    done: function (ms) { return "終わりました(" + ms + " ミリ秒)"; },
    failedRun: function (ms) { return "エラーで止まりました(" + ms + " ミリ秒)"; },
    stopped: "止めました",
    loadFailed: "する を読み込めませんでした。ネットワークを確かめて、ページを読み込み直してください。",
    crashed: "ブラウザの中の Python が止まりました。もう一度読み込みます。",
    copied: "リンクをコピーしました",
    copyFailed: "アドレス欄のリンクをコピーしてください",
    truncated: "\n…(出力が長いので、ここから先は省きました)\n",
    noOutput: "(出力はありません)",
    replace: "編集したプログラムを、選んだ例に入れ替えますか? 編集した内容は消えます。",
    cHint: "プロセス・スレッド・シグナル・通信や、C の標準ライブラリ以外の C のライブラリは、ブラウザでは動きません。コンピューターに入れた する で試してください。",
  } : {
    loading: "Loading する… (the first time takes a few seconds)",
    ready: "Ready",
    running: "Running…",
    done: function (ms) { return "Finished in " + ms + " ms"; },
    failedRun: function (ms) { return "Stopped with an error after " + ms + " ms"; },
    stopped: "Stopped",
    loadFailed: "Could not load する. Check your network and reload the page.",
    crashed: "Python in the browser crashed. Loading it again.",
    copied: "Link copied",
    copyFailed: "Copy the link from the address bar",
    truncated: "\n… (output too long, the rest is not shown)\n",
    noOutput: "(no output)",
    replace: "Replace your edited program with the example you chose? Your changes will be lost.",
    cHint: "Processes, threads, signals, sockets and C libraries other than the C standard library do not work in the browser. Try them with する installed on your computer.",
  };

  // Sample programs. Each one is a program from the tutorial.
  var SAMPLES = [
    { en: "Hello, world", ja: "こんにちは、世界", code:
      "「こんにちは、世界」 を 表示する" },
    { en: "Particles mark the arguments", ja: "助詞で引数を区別する", code:
      "# “a を b で 割る” — divide a by b\n" +
      "a を b で 割った数にする とは a / b です\n\n" +
      "10 を 2 で 割った数にする\n" +
      "2 で 10 を 割った数にする    # same: particles decide" },
    { en: "Recursion: factorial", ja: "再帰: 階乗", code:
      "n を 階乗する とは\n" +
      "  もし n が 0 ならば 1\n" +
      "  そうでなければ n * （n - 1 を 階乗する） です\n\n" +
      "10 を 階乗する\n" +
      "20 を 階乗する" },
    { en: "Lists and functions as values", ja: "リストと関数の値", code:
      "x を 三倍する とは x * 3 です\n" +
      "数列 とは 1 と 2 と 3 と 4 です\n\n" +
      "数列 の それぞれ を 三倍する\n" +
      "数列 を 加算して 三倍する\n" +
      "数列 から （x を 受け取って x > 2 を 返すこと） で 選別する\n" +
      "数列 を 0 から 加算すること で 畳み込みする\n" +
      "数列 を （10 を 加算すること） で 写像する" },
    { en: "Predicates", ja: "述語", code:
      "n が 偶数である とは n % 2 が 0 です\n" +
      "n を 判定する とは もし n が 偶数である ならば 「偶数」 そうでなければ 「奇数」 です\n\n" +
      "7 を 判定する\n" +
      "4 が 偶数である\n" +
      "（1 と 2 と 3 と 4） から 偶数であること で 選別する" },
    { en: "Data types and cases", ja: "データ型と場合分け", code:
      "図形 とは 半径 の 円 か 幅 と 高 の 長方形 です\n\n" +
      "形 を 面積にする とは\n" +
      "  もし 形 が\n" +
      "    半径 の 円 ならば 3 * 半径 ^ 2 です\n" +
      "    幅 と 高 の 長方形 ならば 幅 * 高 です\n\n" +
      "5 の 円 を 面積にする\n" +
      "幅 は 2 で 高 は 3 の 長方形 を 面積にする" },
    { en: "Punctuation style", ja: "句読点の書き方", code:
      "aとbを平均するとは、合計/2です。ただし、合計とは、a+bです。\n" +
      "3と5を平均します。\n" +
      "「できました」を表示します。" },
    { en: "Reading input", ja: "入力を読む", input: "太郎", code:
      "挨拶する は 無 を 返す 入出力動作\n" +
      "挨拶する とは 以下の手順です\n" +
      "  名前 とは 「お名前は? 」 を 入力した 結果\n" +
      "  「こんにちは、」 + 名前 + 「さん」 を 表示する\n" +
      "  以上です\n\n" +
      "挨拶する" },
    { en: "The standard library", ja: "標準ライブラリ", code:
      "「標準」 を 読み込んで 使う\n\n" +
      "3 と 1 と 2 を 整列する\n" +
      "「a,b,c」 を 「,」 で 分割する\n" +
      "1 から 5 を 範囲にする" },
    { en: "Math and random numbers", ja: "算術と乱数", code:
      "「算術」 を 読み込んで 使う\n" +
      "「乱数」 を 読み込んで 使う\n\n" +
      "1 を 正弦にする\n" +
      "2 を 10 で 累乗する\n" +
      "（1 と 2 と 3 と 4 と 5） を 42 で 混合する      # shuffle with the seed 42" },
    { en: "A type error", ja: "型のエラー", code:
      "x を 二乗する とは x * x です\n" +
      "「三」 を 二乗する" },
  ];

  var $ = function (id) { return document.getElementById(id); };
  var editor = $("pg-code"), hl = $("pg-hl"), input = $("pg-input"), output = $("pg-output");
  var runBtn = $("pg-run"), stopBtn = $("pg-stop"), shareBtn = $("pg-share"), status = $("pg-status");
  var select = $("pg-samples"), version = $("pg-version");

  // ---------- editor: a textarea over a highlighted copy of its text ----------
  function paint() {
    var lines = editor.value.split("\n");
    var html = window.suru ? lines.map(function (l) {
      try { return window.suru.highlightLine(l); } catch (e) { return esc(l); }
    }).join("\n") : esc(editor.value);
    hl.innerHTML = html + "\n";  // the extra line keeps the last empty line the same height as in the textarea
    syncScroll();
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function syncScroll() { hl.scrollTop = editor.scrollTop; hl.scrollLeft = editor.scrollLeft; }
  editor.addEventListener("input", paint);
  editor.addEventListener("scroll", syncScroll);
  editor.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    } else if (e.key === "Tab" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  });

  // ---------- samples and the URL ----------
  SAMPLES.forEach(function (s, i) {
    var o = document.createElement("option");
    o.value = String(i);
    o.textContent = ja ? s.ja : s.en;
    select.appendChild(o);
  });
  // What was loaded last (a sample or a shared link). If the editor still holds it, a new sample
  // replaces it at once; if the visitor has changed it, ask first so their program is not lost.
  var loaded = "", current = "";
  select.addEventListener("change", function () {
    var s = SAMPLES[+select.value];
    if (!s) { select.value = current; return; }
    if (editor.value !== loaded && editor.value.trim() !== "" && !window.confirm(T.replace)) {
      select.value = current;
      return;
    }
    current = select.value;
    load(s.code, s.input || "");
    history.replaceState(null, "", location.pathname);
    editor.focus();
  });
  function load(code, inp) {
    editor.value = code;
    input.value = inp;
    loaded = code;
    output.textContent = "";
    paint();
  }
  function fromHash() {
    var m = /^#code=([A-Za-z0-9_-]*)(?:&input=([A-Za-z0-9_-]*))?/.exec(location.hash);
    if (!m) return false;
    try {
      load(window.suru.decodeCode(m[1]), m[2] ? window.suru.decodeCode(m[2]) : "");
      select.value = current = "";
      return true;
    } catch (e) {
      return false;
    }
  }
  if (!fromHash()) {
    select.value = current = "1";
    load(SAMPLES[1].code, "");
  }
  window.addEventListener("hashchange", fromHash);

  shareBtn.addEventListener("click", function () {
    var hash = "#code=" + window.suru.encodeCode(editor.value);
    if (input.value) hash += "&input=" + window.suru.encodeCode(input.value);
    history.replaceState(null, "", location.pathname + hash);
    var url = location.href;
    var say = function (t) { setStatus(t); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { say(T.copied); }, function () { say(T.copyFailed); });
    } else {
      say(T.copyFailed);
    }
  });

  // ---------- running ----------
  var worker = null, isReady = false, running = false, shown = 0, wantRun = false, hadError = false;
  var LIMIT = 200000;

  function setStatus(text, cls) {
    status.textContent = text;
    status.className = "pg-status" + (cls ? " " + cls : "");
  }
  function setRunning(on) {
    running = on;
    runBtn.disabled = on || !isReady;
    stopBtn.disabled = !on;
  }
  function append(text, kind) {
    if (shown >= LIMIT) return;
    if (shown + text.length > LIMIT) {
      text = text.slice(0, LIMIT - shown) + T.truncated;
    }
    shown += text.length;
    var last = output.lastChild;
    if (last && last.nodeType === 1 && last.getAttribute("data-kind") === kind) {
      last.textContent += text;
    } else {
      var span = document.createElement("span");
      span.setAttribute("data-kind", kind);
      if (kind === "err") span.className = "pg-err";
      if (kind === "note") span.className = "pg-note";
      if (kind === "in") span.className = "pg-in";
      span.textContent = text;
      output.appendChild(span);
    }
    output.scrollTop = output.scrollHeight;
  }

  function start() {
    isReady = false;
    setRunning(false);
    setStatus(T.loading, "busy");
    worker = new Worker(base() + "assets/playground-worker.js");
    worker.onmessage = function (e) {
      var m = e.data;
      if (m.type === "ready") {
        isReady = true;
        version.textContent = "する " + m.version;
        setStatus(T.ready);
        setRunning(false);
        if (wantRun) { wantRun = false; run(); }
      } else if (m.type === "out") {
        if (m.kind === "err") hadError = true;
        append(m.text, m.kind);
      } else if (m.type === "done") {
        setRunning(false);
        if (!output.firstChild) append(T.noOutput, "note");
        if (hadError && /外部の|Function not implemented|No error information|スレッド|thread|socket/i.test(output.textContent)) append("\n" + T.cHint + "\n", "note");
        setStatus(m.status === 0 ? T.done(m.ms) : T.failedRun(m.ms), m.status === 0 ? "" : "bad");
      } else if (m.type === "failed") {
        setStatus(T.loadFailed, "bad");
      } else if (m.type === "fatal") {
        append("\n" + T.crashed + "\n", "note");
        restart();
      }
    };
    worker.onerror = function () {
      if (!isReady) setStatus(T.loadFailed, "bad");
      else { append("\n" + T.crashed + "\n", "note"); restart(); }
    };
    worker.postMessage({ type: "run" });  // no code: only says when it is ready
  }
  function base() {
    // ja/playground.html loads the same worker as playground.html
    return location.pathname.indexOf("/ja/") >= 0 ? "../" : "";
  }
  function restart() {
    if (worker) worker.terminate();
    start();
  }
  function run() {
    if (!isReady) { wantRun = true; return; }
    if (running) return;
    output.textContent = "";
    shown = 0;
    hadError = false;
    setRunning(true);
    setStatus(T.running, "busy");
    worker.postMessage({ type: "run", code: editor.value, input: input.value });
  }

  runBtn.addEventListener("click", run);
  stopBtn.addEventListener("click", function () {
    if (!running) return;
    append("\n" + T.stopped + "\n", "note");
    restart();
    setStatus(T.stopped);
  });

  start();
})();
