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
import datetime
import html
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


def read_events(csv_paths: list[pathlib.Path], source_types: list[str]) -> list[dict[str, str]]:
    """Read confirmed local CSV rows for the literal all-events page."""
    events = []
    for csv_path, source_type in zip(csv_paths, source_types):
        with csv_path.open(encoding="utf-8", newline="") as stream:
            for row in csv.DictReader(stream):
                if row.get("confirm_deny", "").strip().casefold() != "confirmed":
                    continue
                start = row.get("start_date", "").strip()[:10]
                try:
                    date = datetime.date.fromisoformat(start)
                except ValueError:
                    continue
                if not (row.get("title", "").strip() or row.get("speaker", "").strip()):
                    continue
                events.append({k: (v or "").strip() for k, v in row.items()} | {
                    "source_type": source_type,
                    "date": start,
                    "date_label": date.strftime("%B %-d, %Y"),
                    "year": str(date.year),
                    "month": date.strftime("%B"),
                })
    return sorted(events, key=lambda event: (event["date"], event["title"].casefold()))


def render_all_events_html(html_path: pathlib.Path) -> bool:
    """Generate the archive as literal HTML; no CSV or runtime parser remains."""
    csv_paths = [AI_X_DIR / "ai-x-events.csv", AI_X_DIR / "community-events.csv"]
    if not all(path.exists() for path in csv_paths):
        print("Error: all-events source CSV missing", file=sys.stderr)
        return False
    events = read_events(csv_paths, ["ai-x", "community"])
    today = datetime.date.today().isoformat()

    def esc(value: str) -> str:
        return html.escape(value, quote=True)

    def card(event: dict[str, str]) -> str:
        title = event.get("title") or event.get("speaker") or "Event"
        speaker = event.get("speaker", "")
        detail = event.get("detail", "")
        location = event.get("location", "")
        source = "AI+X Featured" if event["source_type"] == "ai-x" else "Community"
        meta = " · ".join(value for value in (event["date_label"], event.get("start_time", ""), location) if value)
        body = "".join([
            f'<p>{esc(detail)}</p>' if detail else "",
            f'<p><strong>Speaker:</strong> {esc(speaker)}</p>' if speaker else "",
            f'<p><strong>Location:</strong> {esc(location)}</p>' if location else "",
            f'<p><a href="{esc(event.get("url", ""))}" target="_blank" rel="noopener">Event link</a></p>' if event.get("url") else "",
        ])
        return (f'<details class="event-card" data-source="{event["source_type"]}" data-date="{event["date"]}">'
                f'<summary><span class="date">{esc(meta)}</span><span class="source">{esc(source)}</span>'
                f'<strong>{esc(title)}</strong></summary><div class="detail">{body}</div></details>')

    groups = {"upcoming": [], "past": []}
    for event in events:
        groups["upcoming" if event["date"] >= today else "past"].append(event)

    def section(name: str, items: list[dict[str, str]]) -> str:
        cards = "\n".join(card(event) for event in items) or '<p class="empty">No events currently listed.</p>'
        return f'<section data-period="{name}"><h2>{name.title()} <span>({len(items)})</span></h2>{cards}</section>'

    html_text = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI+X Institute — Events Archive</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
body {{ margin:0; color:#1c1c1c; font-family:'Open Sans',Arial,sans-serif; }}
.archive {{ border:1px solid #e3e3e0; background:#fff; }}
header {{ padding:16px; border-bottom:1px solid #e3e3e0; }}
h1,h2 {{ margin:0; font-family:'Barlow Condensed','Arial Narrow',Arial,sans-serif; text-transform:uppercase; letter-spacing:.08em; color:#006747; }}
h1 {{ font-size:20px; }} h2 {{ padding:12px 16px; background:#f7f7f4; font-size:15px; color:#466069; }}
.filters {{ display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }}
.filters button {{ border:1px solid #006747; background:#fff; color:#006747; padding:8px 12px; cursor:pointer; font-weight:700; }}
.filters button.active {{ background:#006747; color:#fff; }}
section {{ border-bottom:1px solid #e3e3e0; }} .event-card {{ margin:0 16px; padding:12px 0; border-bottom:1px solid #ebebe7; }}
.event-card summary {{ cursor:pointer; list-style:none; }} .event-card summary::-webkit-details-marker {{ display:none; }}
.date,.source {{ display:block; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#7e96a0; }}
.source {{ color:#009374; margin-top:3px; }} .event-card strong {{ display:block; margin-top:3px; font-family:'Barlow Condensed','Arial Narrow',Arial,sans-serif; font-size:20px; }}
.detail {{ padding:10px 0 3px; font-size:14px; line-height:1.55; }} .detail p {{ margin:0 0 10px; }} .empty {{ padding:16px; color:#7e96a0; }}
</style></head><body><div class="archive"><header><h1>Events Archive</h1>
<div class="filters"><button class="active" data-filter="all">All Events</button><button data-filter="community">Community Events</button><button data-filter="ai-x">AI+X Featured Events</button></div>
</header>{section("upcoming", groups["upcoming"])}{section("past", groups["past"])}</div>
<script>document.querySelectorAll('[data-filter]').forEach(function(button){{button.addEventListener('click',function(){{document.querySelectorAll('[data-filter]').forEach(function(b){{b.classList.remove('active')}});button.classList.add('active');var filter=button.dataset.filter;document.querySelectorAll('.event-card').forEach(function(card){{card.hidden=filter!=='all'&&card.dataset.source!==filter}});}});}});</script>
</body></html>\n'''
    html_path.write_text(html_text, encoding="utf-8")
    print(f"Generated literal all-events archive ({len(events)} events) -> {html_path.relative_to(REPO_ROOT)}")
    return True


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
    ok = render_all_events_html(AI_X_DIR / "all-events.html") and ok
    for html_path, var_name, csv_paths, source_types in TARGETS:
        if not bake_one(html_path, var_name, csv_paths, source_types):
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
