#!/usr/bin/env python3
"""Baut aus src/ eine einzige, eigenständige index.html.

  python3 build.py            -> index.html (vollständiges HTML-Dokument)
  python3 build.py --fragment -> dist/artifact.html (ohne <html>/<head>/<body>-Gerüst)
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
DATA = ["data/ablauf.js", "data/themen.js", "data/regeln-1.js", "data/regeln-2.js"]


def fragment() -> str:
    tpl = (SRC / "index.template.html").read_text(encoding="utf-8")
    data = "\n".join((SRC / p).read_text(encoding="utf-8") for p in DATA)
    return (tpl.replace("/*STYLE*/", (SRC / "style.css").read_text(encoding="utf-8"))
               .replace("/*DATA*/", data)
               .replace("/*APP*/", (SRC / "app.js").read_text(encoding="utf-8")))


def document(body: str) -> str:
    head, sep, rest = body.partition("<div class=\"app\"")
    return ("<!doctype html>\n<html lang=\"de\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
            "<meta name=\"theme-color\" content=\"#172033\">\n"
            "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n"
            "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n"
            + head + "</head>\n<body>\n" + sep + rest + "</body>\n</html>\n")


if __name__ == "__main__":
    frag = fragment()
    if "--fragment" in sys.argv:
        out = ROOT / "dist" / "artifact.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(frag, encoding="utf-8")
    else:
        out = ROOT / "index.html"
        out.write_text(document(frag), encoding="utf-8")
    print(f"geschrieben: {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
