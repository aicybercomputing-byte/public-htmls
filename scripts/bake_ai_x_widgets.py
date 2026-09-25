#!/usr/bin/env python3
"""
bake_ai_x_widgets.py
Bake the local ai-x/*.csv contents directly into the three AI+X event widget
HTML files, so they render with zero runtime fetch(). The all-events archive
combines the local AI+X and community CSVs. This makes them work
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

import csv
import io
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).parent.parent
AI_X_DIR = REPO_ROOT / "ai-x"

# (html file, JS var name, source CSVs, source types) tuples.
TARGETS = [
    (AI_X_DIR / "ai-x-past-events.html", "EVENTS_CSV", [AI_X_DIR / "ai-x-events.csv"], ["ai-x"]),
    # The archive is the combined confirmed history: AI+X Featured + community.
    (AI_X_DIR / "all-events.html", "EVENTS_CSV",
     [AI_X_DIR / "ai-x-events.csv", AI_X_DIR / "community-events.csv"],
     ["ai-x", "community"]),
    (AI_X_DIR / "community-events.html", "COMMUNITY_EVENTS_CSV", [AI_X_DIR / "community-events.csv"], ["community"]),
]


def js_string_literal(text: str) -> str:
    """Encode arbitrary CSV text as a single-line double-quoted JS string."""
    # json.dumps produces a valid double-quoted JS string literal for any
    # string content (it escapes \, ", control chars, and non-ASCII stays
    # as literal UTF-8 which is fine inside a UTF-8-declared HTML file).
    return json.dumps(text)


def combined_csv_text(csv_paths: list[pathlib.Path], source_types: list[str]) -> str:
    """Combine CSVs into one baked CSV and label each row by source."""
    if len(csv_paths) != len(source_types):
        raise ValueError("csv_paths and source_types must have the same length")

    combined_rows: list[list[str]] = []
    header: list[str] | None = None
    source_index = -1

    for csv_path, source_type in zip(csv_paths, source_types):
        if not csv_path.exists():
            raise FileNotFoundError(csv_path)
        rows = list(csv.reader(io.StringIO(csv_path.read_text(encoding="utf-8"))))
        if not rows:
            continue
        current_header = [cell.strip() for cell in rows[0]]
        if header is None:
            header = current_header
            if "source_type" not in header:
                header.append("source_type")
            source_index = header.index("source_type")
        elif current_header != header[:len(current_header)]:
            raise ValueError(f"CSV headers do not match: {csv_path}")

        for row in rows[1:]:
            if not any(cell.strip() for cell in row):
                continue
            row = row + [""] * (len(header) - len(row))
            row[source_index] = source_type
            combined_rows.append(row[:len(header)])

    if header is None:
        return ""
    output = io.StringIO()
    csv.writer(output).writerows([header, *combined_rows])
    return output.getvalue()


def bake_one(html_path: pathlib.Path, var_name: str, csv_paths: list[pathlib.Path], source_types: list[str]) -> bool:
    try:
        modified_csv_text = combined_csv_text(csv_paths, source_types)
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return False
    literal = js_string_literal(modified_csv_text)

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
    print(f"Baked {len(modified_csv_text)} bytes from {len(csv_paths)} CSV(s) -> {html_path.relative_to(REPO_ROOT)}::{var_name}")
    return True


def main() -> int:
    ok = True
    for html_path, var_name, csv_paths, source_types in TARGETS:
        if not bake_one(html_path, var_name, csv_paths, source_types):
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
