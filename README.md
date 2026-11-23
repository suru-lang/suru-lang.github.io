# suru-lang.github.io

The website of the する (suru) programming language: https://suru-lang.github.io/

Plain HTML and CSS, no build step. GitHub Pages serves the `main` branch as it is.

| Path | Page |
|---|---|
| `index.html` | Landing page (English, the source of truth) |
| `tutorial.html` | Tutorial (English) |
| `ja/index.html`, `ja/tutorial.html` | Japanese translations |
| `assets/style.css` | Styles for every page |
| `assets/site.js` | Syntax highlighting for `<pre class="suru">` and the tutorial’s table of contents |

English pages are the source of truth. When you change one, change its Japanese page in `ja/` the same way. The language switch in the top right links each page to its counterpart.

## Preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Code examples

Every `<pre class="suru">` block followed by `<pre class="out">` should be the real output of the program. Check them against the language repository with:

```sh
python3 tools/check_examples.py --suru ../suru/suru.py
```

## 日本語

する の公式サイトです。英語のページが正で、`ja/` に日本語のページがあります。英語のページを変えたら、日本語のページも同じように変えてください。コード例の出力は `tools/check_examples.py` で、実際に動かした結果と同じかを確かめられます。
