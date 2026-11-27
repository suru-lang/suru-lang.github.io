// する (suru) — tiny syntax highlighter and table-of-contents tracker. No dependencies.
(function () {
  "use strict";

  var VERB_END = "(?:すること|しましてから|しまして|してから|して|します|する|した|であること|である|でない)";
  var KEYWORDS = "以下の手順です|以下は外部の入出力動作です|以下は外部の関数です|以上です|以上|入出力動作|とは|そうでなければ|ならば|もし|ただし|手順|受け取って|返すこと|返します|返す|それから|かつ|または|それぞれ|読み込んで|読み込む|読み込みます|使う|結果|真|偽|空|性質|という|です|外部の";
  var PARTICLES = "から|より|を|に|で|へ|と|が|の|は|か";

  // Spaced style: a token is a run without spaces. Punctuation style: words are cut where the script changes.
  var spaced = new RegExp(
    "([#＃※].*$)" +                                   // 1 comment
    "|(「[^」]*」)" +                                  // 2 string
    "|(『[^』]*』)" +                                  // 3 quoted name
    "|(?<=^|[\\s（(])(" + KEYWORDS + ")(?=$|[\\s）)])" + // 4 keyword
    "|([^\\s「」（）()]*?" + VERB_END + ")(?=$|[\\s）)])" + // 5 verb
    "|(?<=^|[\\s（(])(" + PARTICLES + ")(?=$|[\\s）)])" + // 6 particle
    "|(\\d+(?:\\.\\d+)?)",                              // 7 number
    "gm");
  var punct = new RegExp(
    "([#＃※].*$)" +
    "|(「[^」]*」)" +
    "|(『[^』]*』)" +
    "|(" + KEYWORDS + ")" +
    "|((?:[\\u4E00-\\u9FFF\\u30A0-\\u30FF々ーA-Za-z]+|』)(?:に)?" + VERB_END + ")" +
    "|(" + PARTICLES + ")" +
    "|(\\d+(?:\\.\\d+)?)",
    "gm");
  var CLASSES = [null, "t-c", "t-s", "t-q", "t-k", "t-v", "t-p", "t-n"];

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlightLine(line) {
    var re = /[。、]/.test(line.replace(/「[^」]*」|[#＃※].*$/g, "")) ? punct : spaced;
    re.lastIndex = 0;
    var out = "", last = 0, m;
    while ((m = re.exec(line)) !== null) {
      if (m[0] === "") { re.lastIndex++; continue; }
      var cls = null;
      for (var i = 1; i < CLASSES.length; i++) { if (m[i] !== undefined) { cls = CLASSES[i]; break; } }
      out += esc(line.slice(last, m.index)) + '<span class="' + cls + '">' + esc(m[0]) + "</span>";
      last = m.index + m[0].length;
    }
    return out + esc(line.slice(last));
  }

  function highlight(el) {
    var text = el.textContent;
    el.innerHTML = text.split("\n").map(highlightLine).join("\n");
  }

  // Programs travel to the playground in the URL: #code= and the UTF-8 text in base64url.
  function encodeCode(text) {
    var bytes = new TextEncoder().encode(text), bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decodeCode(s) {
    var bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  window.suru = { highlightLine: highlightLine, encodeCode: encodeCode, decodeCode: decodeCode };

  // A “Try it” link on every code window, except programs that need a library or a server.
  var ja = document.documentElement.lang === "ja";
  document.querySelectorAll(".window pre.suru").forEach(function (pre) {
    var bar = pre.parentNode.querySelector(".window-bar");
    if (!bar || pre.getAttribute("data-check") === "no" || pre.closest(".playground")) return;
    var a = document.createElement("a");
    a.className = "try";
    a.href = "playground.html#code=" + encodeCode(pre.textContent.replace(/\s+$/, ""));
    a.textContent = ja ? "試す ▶" : "Try it ▶";
    bar.appendChild(a);
  });

  try {
    document.querySelectorAll("pre.suru").forEach(highlight);
  } catch (e) {
    // Older browsers without lookbehind: leave the code plain.
  }

  // Highlight the current section in the tutorial's table of contents.
  var links = document.querySelectorAll(".toc a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && byId[en.target.id]) {
          links.forEach(function (a) { a.classList.remove("active"); });
          byId[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) {
      var h = document.getElementById(id);
      if (h) obs.observe(h);
    });
  }
})();
