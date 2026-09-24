#!/usr/bin/env python3
"""
bake_ai_x_widgets.py
Bake the ai-x/*.csv contents directly into the three AI+X event widget HTML
files, so they render with zero runtime fetch(). This makes them work
identically wherever they're placed (GitHub Pages iframe, OmniCMS paste,
local file://) with no CORS/path/caching failure modes.

Each target file has one or more marker blocks:

    /* BAKE:<NAME>:START ... */
    var <NAME> = "...";
    /* BAKE:<NAME>:END */

This script replaces the `var <NAME> = "...";` line between the markers
with the current CSV content, JS-string-escaped as a single line (\n for
newlines). It does not touch anything else in the file.

Run this after every ai-x/*.csv refresh (i.e. right after sync-box-csv.py):

    python3 scripts/bake_ai_x_widgets.py

Wired into the Automations HUD as part of the ai_x_csv_sync job — see
automations_hud_core.py: sync_ai_x_csv() calls this script immediately
after sync-box-csv.py.
"""

import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).parent.parent
AI_X_DIR = REPO_ROOT / "ai-x"

# (html file, JS var name, source CSV) triples.
TARGETS = [
    (AI_X_DIR / "ai-x-past-events.html", "EVENTS_CSV", AI_X_DIR / "ai-x-events.csv"),
    (AI_X_DIR / "all-events.html", "EVENTS_CSV", AI_X_DIR / "ai-x-events.csv"),
    (AI_X_DIR / "community-events.html", "COMMUNITY_EVENTS_CSV", AI_X_DIR / "community-events.csv"),
]


def js_string_literal(text: str) -> str:
    """Encode arbitrary CSV text as a single-line double-quoted JS string."""
    # json.dumps produces a valid double-quoted JS string literal for any
    # string content (it escapes \, ", control chars, and non-ASCII stays
    # as literal UTF-8 which is fine inside a UTF-8-declared HTML file).
    return json.dumps(text)


def bake_one(html_path: pathlib.Path, var_name: str, csv_path: pathlib.Path) -> bool:
    if not csv_path.exists():
        print(f"Error: source CSV missing: {csv_path}", file=sys.stderr)
        return False

    csv_text = csv_path.read_text(encoding="utf-8")
    literal = js_string_literal(csv_text)

    html_text = html_path.read_text(encoding="utf-8")

    start_marker = f"/* BAKE:{var_name}:START"
    end_marker = f"/* BAKE:{var_name}:END */"

    start_idx = html_text.find(start_marker)
    end_idx = html_text.find(end_marker)
    if start_idx == -1 or end_idx == -1 or end_idx < start_idx:
        print(f"Error: bake markers for {var_name} not found in {html_path}", file=sys.stderr)
        return False

    # The var declaration line sits somewhere between the two markers.
    block = html_text[start_idx:end_idx]
    pattern = re.compile(
        r"var\s+" + re.escape(var_name) + r"\s*=\s*\"(?:[^\"\\]|\\.)*\"\s*;"
    )
    replacement = f"var {var_name} = {literal};"
    new_block, count = pattern.subn(lambda _m: replacement, block, count=1)
    if count != 1:
        print(f"Error: could not find `var {var_name} = \"...\";` inside markers in {html_path}", file=sys.stderr)
        return False

    html_text = html_text[:start_idx] + new_block + html_text[end_idx:]
    html_path.write_text(html_text, encoding="utf-8")
    print(f"Baked {csv_path.name} ({len(csv_text)} bytes) -> {html_path.relative_to(REPO_ROOT)}::{var_name}")
    return True


def main() -> int:
    ok = True
    for html_path, var_name, csv_path in TARGETS:
        if not bake_one(html_path, var_name, csv_path):
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
