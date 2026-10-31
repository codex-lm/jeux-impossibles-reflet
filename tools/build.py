# Construit index.html (autonome, format LOB7) depuis index.src.html + assets/.
# LOB7 refuse tout href/src externe dans index.html : styles et scripts inline.
# Règle atelier : le bundle est reconstruit depuis les sources, jamais édité à la main.
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / "index.src.html").read_text(encoding="utf-8")

def inline_css(m):
    css = (root / "assets" / m.group(1)).read_text(encoding="utf-8")
    return "<style>\n" + css + "\n</style>"

def inline_js(m):
    js = (root / "assets" / m.group(1)).read_text(encoding="utf-8")
    for forbidden in ("</script", "<!--"):
        if forbidden in js:
            raise SystemExit(f"contenu incompatible inline dans {m.group(1)}: {forbidden}")
    return "<script>\n" + js + "\n</script>"

out = re.sub(r'<link rel="stylesheet" href="assets/([^"]+)">', inline_css, src)
out = re.sub(r'<script src="assets/([^"]+)"></script>', inline_js, out)

leftover = re.findall(r'(?:href|src)="(?!data:|#)[^"]*"', out)
if leftover:
    raise SystemExit("références non inline restantes : " + ", ".join(leftover))

(root / "index.html").write_text(out, encoding="utf-8", newline="\n")
print(f"index.html généré : {len(out)} octets, autonome (0 référence externe)")
