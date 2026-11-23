// する (suru) — tiny syntax highlighter and table-of-contents tracker. No dependencies.
(function () {
  "use strict";

  var VERB_END = "(?:すること|しましてから|しまして|してから|して|します|する|した|であること|である|でない)";
  var KEYWORDS = "とは|そうでなければ|ならば|もし|ただし|手順|受け取って|返すこと|それから|かつ|または|それぞれ|読み込んで|読み込む|読み込みます|使う|結果|真|偽|空|性質|という|です|外部の";
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
