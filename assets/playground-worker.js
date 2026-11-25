// する (suru) playground — runs the Python interpreter of する inside the browser with Pyodide.
// The page talks to this worker with messages, so a long or endless program can be stopped by
// terminating the worker. Nothing is sent to a server: the program runs on the visitor's machine.
"use strict";

var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
importScripts(PYODIDE + "pyodide.js");

var py = null;
var ready = init();

async function init() {
  py = await loadPyodide({ indexURL: PYODIDE });
  await py.loadPackage("micropip");
  // The latest release of する from PyPI. It is a pure Python wheel, so micropip can install it.
  await py.pyimport("micropip").install("suru-lang");
  // fcntl does not exist in the browser. する only uses it for file locks, which the playground cannot offer anyway.
  py.runPython(
    "import sys, types\n" +
    "if 'fcntl' not in sys.modules:\n" +
    "    try:\n" +
    "        import fcntl\n" +
    "    except ImportError:\n" +
    "        sys.modules['fcntl'] = types.ModuleType('fcntl')\n" +
    "import suru\n" +
    // The C library is linked into Pyodide itself, so 外部の「c」 and 「m」 (libc and libm) are the program itself.
    // On wasm32 a C long and size_t are 32 bits, so する's 64-bit 数 is passed as a C long.
    "import ctypes\n" +
    "_self = ctypes.CDLL(None, use_errno=True)\n" +
    "suru._FFI_LIBS.setdefault('c', _self)\n" +
    "suru._FFI_LIBS.setdefault('m', _self)\n" +
    "_ctype = suru._ffi_ctype\n" +
    "suru._ffi_ctype = lambda t: ctypes.c_long if t == 'i64' else _ctype(t)\n"
  );
  return py.runPython("suru.__version__");
}

// Output is sent in pieces, at most every 40 ms or 8 KB, so a program that prints a lot does not
// flood the page with messages. Standard output and errors share one queue, so they stay in order.
var queue = { kind: null, text: "", last: 0 };
function flush() {
  if (queue.text) postMessage({ type: "out", kind: queue.kind, text: queue.text });
  queue.text = "";
  queue.last = Date.now();
}
function emit(kind, text) {
  if (queue.kind !== kind) {
    flush();
    queue.kind = kind;
  }
  queue.text += text;
  if (queue.text.length > 8192 || Date.now() - queue.last > 40) flush();
}
function makeStream(kind) {
  var decoder = new TextDecoder();
  return function (buf) {
    emit(kind, decoder.decode(buf, { stream: true }));
    return buf.length;
  };
}

onmessage = async function (e) {
  var msg = e.data;
  if (msg.type !== "run") return;
  var version;
  try {
    version = await ready;
  } catch (err) {
    postMessage({ type: "failed", text: String(err) });
    return;
  }
  if (msg.code === undefined) {
    postMessage({ type: "ready", version: version });
    return;
  }

  py.setStdout({ write: makeStream("out"), isatty: false });
  py.setStderr({ write: makeStream("err"), isatty: false });
  queue.last = Date.now();
  var lines = (msg.input || "").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  var i = 0;
  // 入力する reads from the input box, one line at a time. When it runs out, the program sees the end of input.
  py.setStdin({
    stdin: function () {
      if (i >= lines.length) return null;
      // Show the line as if it had been typed, after what the program printed before asking.
      emit("in", lines[i] + "\n");
      return lines[i++] + "\n";
    },
  });

  py.FS.writeFile("/home/pyodide/playground.suru", msg.code + "\n");
  var start = performance.now();
  var status = 1;
  try {
    status = py.runPython(
      "import sys\n" +
      "try:\n" +
      "    _status = suru.main(['suru', '/home/pyodide/playground.suru'])\n" +
      "except SystemExit as _e:\n" +
      "    _status = _e.code if isinstance(_e.code, int) else 1\n" +
      "except RecursionError:\n" +
      "    sys.stdout.flush()\n" +
      "    print('エラー: 再帰が深すぎます', file=sys.stderr)\n" +
      "    _status = 1\n" +
      "sys.stdout.flush(); sys.stderr.flush()\n" +
      "_status\n"
    );
  } catch (error) {
    var text = String(error && error.message || error);
    // Show the last line of a Python traceback; the rest is about the interpreter, not the program.
    var tail = text.trim().split("\n").pop();
    emit("err", "\n" + tail + "\n");
    if (error && error.pyodide_fatal_error) {
      flush();
      postMessage({ type: "fatal" });
      return;
    }
  }
  flush();
  postMessage({ type: "done", status: status, ms: Math.round(performance.now() - start) });
};
