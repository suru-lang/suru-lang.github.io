[English](README.md) | 日本語

# suru-lang.github.io

プログラミング言語 する(suru)のサイトです: https://suru-lang.github.io/

素の HTML と CSS で、ビルドはありません。GitHub Pages が `main` の枝をそのまま配ります。

| 道 | ページ |
|---|---|
| `index.html` | トップ(英語。これが正) |
| `tutorial.html` | 入門(英語) |
| `cheatsheet.html` | 早見表: 言語の全体を1ページに(英語) |
| `testing.html` | 試験: 例・試験のまとまり・試験/ のフォルダ・`kumu 試験`・CI(英語) |
| `examples.html` | 例のプログラム(英語) |
| `ohanashi.html` | する で書いたチャットの Web アプリ「おはなし」(ohanashi-ollama)の使い方(英語) |
| `playground.html` | プレイグラウンド: ブラウザで する を書いて動かす(英語) |
| `ja/index.html`・`ja/tutorial.html`・`ja/cheatsheet.html`・`ja/testing.html`・`ja/examples.html`・`ja/ohanashi.html`・`ja/playground.html` | 日本語の訳 |
| `assets/style.css` | 全部のページの見た目 |
| `assets/icon.svg`・`assets/apple-touch-icon.png` | ファビコンとホーム画面のアイコン: マスコットのするぞう |
| `assets/suruzou.svg` | 見出しのマスコット |
| `assets/suruzou-body.svg` | トップの最後のマスコットの全身 |
| `assets/site.js` | `<pre class="suru">` の色分け、プレイグラウンドへの「Try it」のリンク、入門の目次 |
| `assets/playground.js`・`assets/playground-worker.js` | プレイグラウンド: ページと、する を動かすワーカー |

英語のページが正です。英語のページを変えたら、`ja/` の日本語のページも同じように変えます。右上の言語の切り替えは、それぞれのページを相手のページにつなぎます。

## 手元で見る

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

## プレイグラウンド

`playground.html` は、する の Python のインタプリタを [Pyodide](https://pyodide.org/) でブラウザの中の Web Worker で動かすので、止めるボタンでどのプログラムも終えられます。ワーカーは Pyodide を jsDelivr から読み、PyPI の一番新しい `suru-lang` を micropip で入れるので、する の新しい版はこのサイトを変えなくてもプレイグラウンドに届きます。サーバーでは何も動きません。

C の標準ライブラリは Pyodide に入っているので、外部の「c」と「m」(算術・乱数・時間、ページの中の一時的なファイルシステムのファイル)は動きます。プロセス・スレッド・シグナル・ソケットとほかの C のライブラリは動きません。メニューの見本は `assets/playground.js` にあります。ほかのページのコードの窓には、そのプログラムをプレイグラウンドで開く「Try it」のリンクが付きます(`#code=` とプログラムの UTF-8 の base64url)。`data-check="no"` の付いたものは除きます。

## コードの例

`<pre class="out">` が後に続く `<pre class="suru">` は、どれもプログラムの本当の出力でなければなりません。言語のリポジトリと照らして、次で確かめます。

```sh
python3 tools/check_examples.py --suru ../suru/suru.py
```

`<pre class="suru" data-check="no">` と書いたものは飛ばします。確かめるときに用意できないライブラリやサーバーが要るプログラムのためです(チャットの例は suru-lang/http と Ollama が要ります)。これらは手で確かめます。
