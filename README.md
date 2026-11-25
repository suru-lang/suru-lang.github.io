English | [日本語](README_jp.md)

# suru-lang.github.io

The website of the する (suru) programming language: https://suru-lang.github.io/

Plain HTML and CSS, no build step. GitHub Pages serves the `main` branch as it is.

| Path | Page |
|---|---|
| `index.html` | Landing page (English, the source of truth) |
| `tutorial.html` | Tutorial (English) |
| `examples.html` | Example programs (English) |
| `ohanashi.html` | How to use Ohanashi (ohanashi-ollama), the chat web app written in する (English) |
| `playground.html` | Playground: write and run する in the browser (English) |
| `ja/index.html`, `ja/tutorial.html`, `ja/examples.html`, `ja/ohanashi.html`, `ja/playground.html` | Japanese translations |
| `assets/style.css` | Styles for every page |
| `assets/icon.svg`, `assets/apple-touch-icon.png` | Favicon and home-screen icon: the mascot するぞう (Suruzou) |
| `assets/suruzou.svg` | The mascot in the header |
| `assets/suruzou-body.svg` | The mascot's whole body, at the end of the landing page |
| `assets/site.js` | Syntax highlighting for `<pre class="suru">`, the “Try it” links to the playground, and the tutorial’s table of contents |
| `assets/playground.js`, `assets/playground-worker.js` | The playground: the page, and the worker that runs する |

English pages are the source of truth. When you change one, change its Japanese page in `ja/` the same way. The language switch in the top right links each page to its counterpart.

## Preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Playground

`playground.html` runs the Python interpreter of する in the browser with [Pyodide](https://pyodide.org/), in a Web Worker, so the Stop button can end any program. The worker loads Pyodide from jsDelivr and installs the latest `suru-lang` from PyPI with micropip, so a new release of する reaches the playground without changing this site. Nothing runs on a server.

The C standard library is part of Pyodide, so 外部の「c」 and 「m」 (算術, 乱数, 時間, files in a temporary in-page file system) work. Processes, threads, signals, sockets and other C libraries do not. The samples in the menu are in `assets/playground.js`; a code window on the other pages gets a “Try it” link that opens its program in the playground (`#code=` and the program as UTF-8 in base64url), except blocks marked `data-check="no"`.

## Code examples

Every `<pre class="suru">` block followed by `<pre class="out">` should be the real output of the program. Check them against the language repository with:

```sh
python3 tools/check_examples.py --suru ../suru/suru.py
```

A block written as `<pre class="suru" data-check="no">` is skipped, for programs that need a library or a server that the check cannot provide (the chat example needs suru-lang/http and Ollama). Check those by hand.
