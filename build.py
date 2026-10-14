#!/usr/bin/env python3
"""Baut den TI4 Host-Leitfaden aus src/.

  python3 build.py              -> site/   installierbare Web-App (für GitHub Pages, Docker, jeden Webserver)
  python3 build.py --artifact   -> dist/artifact.html   einzelne Datei ohne HTML-Gerüst, Schriften über Google Fonts

Nur Python-Standardbibliothek, keine Abhängigkeiten.
"""
import hashlib
import base64
import json
import os
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
DATA = ["data/ablauf.js", "data/themen.js", "data/darfich.js", "data/regeln-1.js", "data/regeln-2.js",
        "data/tiles.js", "data/layouts.js", "data/fraktionen.js", "data/karten-1.js", "data/karten-2.js",
        "data/de-namen.js", "data/reference-assets.js", "data/original-assets.js", "data/english-sheets.js", "assets.js",
        "map.js", "aufbau.js", "kompendium.js", "hub.js"]

# Adresse der Hub-API (Rust, Ordner server/). Standard: gleiche Adresse wie die Seite, nginx leitet /api/ weiter.
# Für GitHub Pages mit eigenem Server z. B. HUB_API_URL=https://ti4.example.de/api/ setzen; leer = nur lokal speichern.
HUB_API_URL = os.environ.get("HUB_API_URL", "api/")

GOOGLE_FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700'
    '&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@500&display=swap">'
)

# (Familie, Stil, Gewicht, Datei)
LOCAL_FONTS = [
    ("Saira Condensed", "normal", 600, "saira-condensed-latin-600-normal.woff2"),
    ("Saira Condensed", "normal", 700, "saira-condensed-latin-700-normal.woff2"),
    ("Source Sans 3", "normal", 400, "source-sans-3-latin-400-normal.woff2"),
    ("Source Sans 3", "italic", 400, "source-sans-3-latin-400-italic.woff2"),
    ("Source Sans 3", "normal", 600, "source-sans-3-latin-600-normal.woff2"),
    ("Source Sans 3", "normal", 700, "source-sans-3-latin-700-normal.woff2"),
    ("IBM Plex Mono", "normal", 500, "ibm-plex-mono-latin-500-normal.woff2"),
]

ICONS = ["icon.svg", "icon-maskable.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon-32.png"]

PWA_HEAD = """<meta name="theme-color" content="#172033">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="TI4 Host">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
"""

PWA_SCRIPT = """<script>
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
</script>"""


def read(rel: str) -> str:
    return (SRC / rel).read_text(encoding="utf-8")


def body(fonts_html: str, pwa_html: str, hub_api: str = HUB_API_URL) -> str:
    data = "window.TI4 = window.TI4 || {};\nTI4.hubApi = " + json.dumps(hub_api) + ";\n" + "\n".join(read(p) for p in DATA)
    return (read("index.template.html")
            .replace("<!--FONTS-->", fonts_html)
            .replace("/*STYLE*/", read("style.css"))
            .replace("/*DATA*/", data)
            .replace("/*APP*/", read("app.js"))
            .replace("<!--PWA-->", pwa_html))


def font_faces() -> str:
    rules = [
        '@font-face{font-family:"%s";font-style:%s;font-weight:%d;font-display:swap;src:url("fonts/%s") format("woff2")}'
        % (fam, style, weight, f) for fam, style, weight, f in LOCAL_FONTS
    ]
    return "<style>\n" + "\n".join(rules) + "\n</style>"


def document(fragment: str) -> str:
    head, sep, rest = fragment.partition('<div class="app"')
    return ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + PWA_HEAD + head + "</head>\n<body>\n" + sep + rest + "</body>\n</html>\n")


def build_site() -> pathlib.Path:
    out = ROOT / "site"
    if out.exists():
        shutil.rmtree(out)
    (out / "fonts").mkdir(parents=True)
    (out / "icons").mkdir()

    html = document(body(font_faces(), PWA_SCRIPT))
    (out / "index.html").write_text(html, encoding="utf-8")
    for _, _, _, f in LOCAL_FONTS:
        shutil.copy2(SRC / "fonts" / f, out / "fonts" / f)
    shutil.copy2(SRC / "fonts" / "LICENSE-FONTS.txt", out / "fonts" / "LICENSE-FONTS.txt")
    for f in ICONS:
        shutil.copy2(SRC / "icons" / f, out / "icons" / f)
    shutil.copytree(SRC / "assets", out / "assets")
    shutil.copy2(SRC / "pwa" / "manifest.webmanifest", out / "manifest.webmanifest")

    assets = ["./", "index.html", "manifest.webmanifest"] + \
             ["fonts/" + f for _, _, _, f in LOCAL_FONTS] + ["icons/" + f for f in ICONS] + \
             [p.relative_to(out).as_posix() for p in sorted((out / "assets").rglob("*")) if p.is_file()]
    digest = hashlib.sha256()
    for a in assets[1:]:
        digest.update((out / a).read_bytes())
    version = digest.hexdigest()[:12]
    sw = read("pwa/sw.js").replace("__VERSION__", version).replace("__ASSETS__", json.dumps(assets))
    (out / "sw.js").write_text(sw, encoding="utf-8")
    (out / ".nojekyll").write_text("", encoding="utf-8")
    print(f"site/ gebaut, Version {version}, index.html {len(html) // 1024} KB")
    return out


def build_artifact() -> pathlib.Path:
    out = ROOT / "dist" / "artifact.html"
    out.parent.mkdir(exist_ok=True)
    html = body(GOOGLE_FONTS, "", "")
    # Preserve the single-file export: image paths inside JS and generated markup
    # are replaced by data URLs. Source PDFs remain linked to the publisher.
    for p in sorted((SRC / "assets").rglob("*")):
        if p.suffix not in (".svg", ".webp"):
            continue
        mime = "image/svg+xml" if p.suffix == ".svg" else "image/webp"
        uri = "data:" + mime + ";base64," + base64.b64encode(p.read_bytes()).decode("ascii")
        html = html.replace(p.relative_to(SRC).as_posix(), uri)
    # Portrait paths are normally assembled at runtime; the artifact needs a map.
    portraits = {p.stem.removesuffix("-portrait"): "data:image/webp;base64," + base64.b64encode(p.read_bytes()).decode("ascii")
                 for p in (SRC / "assets/original").glob("*-portrait.webp")}
    html = html.replace("/*ARTIFACT_PORTRAITS*/", "D.artifactPortraits = " + json.dumps(portraits) + ";")
    out.write_text(html, encoding="utf-8")
    print(f"dist/artifact.html gebaut ({out.stat().st_size // 1024} KB)")
    return out


if __name__ == "__main__":
    if "--artifact" in sys.argv:
        build_artifact()
    else:
        build_site()
