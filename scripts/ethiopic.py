"""Subsets Noto Sans Ethiopic to the handful of Ge'ez characters the site uses.

The page's Content-Security-Policy is 'self'-only, so Amharic text can't lean on a web font
from a CDN, and not every OS ships an Ethiopic face. A subset of only the syllables below is
a few kilobytes.

Usage (run on demand after adding Amharic text anywhere in src/):
    pip install fonttools brotli
    python scripts/ethiopic.py path/to/NotoSansEthiopic-SemiBold.ttf

Get the source TTF from https://github.com/notofonts/ethiopic (SIL OFL 1.1).
"""

import pathlib
import re
import sys

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "fonts" / "noto-sans-ethiopic-subset.woff2"
ETHIOPIC = re.compile(r"[\u1200-\u139F\u2D80-\u2DDF\uAB00-\uAB2F]")


def used_characters() -> str:
    chars = set()
    for path in (ROOT / "src").rglob("*.ts*"):
        chars.update(ETHIOPIC.findall(path.read_text(encoding="utf-8")))
    return "".join(sorted(chars))


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    text = used_characters() + "\u1361\u1362 "  # word space and full stop, for good measure
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    font = subset.load_font(sys.argv[1], options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    subset.save_font(font, str(OUT), options)
    print(f"{len(text)} characters -> {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
