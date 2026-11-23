"""Run the code examples on the site and check that the shown output is what する prints.

Every <pre class="suru"> block that is followed by <pre class="out"> is run with the interpreter and
its output is compared. Examples that start a server are only type-checked (--検査). Examples that
read input get "太郎" on stdin; the page shows the typed answer, so it is added back before comparing.

    python3 tools/check_examples.py --suru ../suru/suru.py [pages...]
"""
import argparse, glob, html, os, re, subprocess, sys, tempfile

BLOCK = re.compile(r'<pre class="suru">(.*?)</pre>\s*(?:<pre class="(out[^"]*)">(.*?)</pre>)?', re.S)


def text(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--suru", required=True, help="path to suru.py")
    ap.add_argument("pages", nargs="*")
    args = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pages = args.pages or sorted(glob.glob(os.path.join(root, "*.html")) + glob.glob(os.path.join(root, "ja", "*.html")))
    failed = 0
    for page in pages:
        for m in BLOCK.finditer(open(page, encoding="utf-8").read()):
            code, want = text(m.group(1)), text(m.group(3) or "").strip()
            with tempfile.TemporaryDirectory() as d:
                path = os.path.join(d, "例.suru")
                with open(path, "w", encoding="utf-8") as f:
                    f.write(code + "\n")
                if "待受する" in code:
                    r = subprocess.run([sys.executable, args.suru, "--検査", path], capture_output=True, text=True)
                    got, ok = (r.stdout + r.stderr).strip(), r.returncode == 0
                else:
                    r = subprocess.run([sys.executable, args.suru, path], input="太郎\n",
                                       capture_output=True, text=True, timeout=60)
                    got = (r.stdout + r.stderr).strip()
                    if "入力" in code:
                        got = re.sub(r"(\? )", r"\1太郎\n", got, count=1)
                    ok = got == want if m.group(2) else r.returncode == 0
            print("ok  " if ok else "FAIL", os.path.relpath(page, root), "|", code.splitlines()[0][:40])
            if not ok:
                failed += 1
                print("   want:", repr(want))
                print("   got: ", repr(got))
    print(f"{failed} failed" if failed else "all examples match")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
