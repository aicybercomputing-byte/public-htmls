"""Optional: merge jobs_page/data/*.csv into jobs_page/data/jobs_page_content.xlsx.

Use when you have CSV snapshots (e.g. after exporting sheets from Excel).
Sheet names come from each file stem and must match generator section keys
(stat_items, event_items, ...). Primary source of truth is the .xlsx file.
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

try:
    from openpyxl import Workbook
except ImportError as exc:
    raise SystemExit("Install openpyxl: pip install -r jobs_page/requirements.txt") from exc


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]
    data_dir = repo_root / "jobs_page" / "data"
    out_path = data_dir / "jobs_page_content.xlsx"
    csv_files = sorted(data_dir.glob("*.csv"))
    if not csv_files:
        print("No CSV files found in jobs_page/data.", file=sys.stderr)
        return 1

    wb = Workbook()
    first = True
    for csv_path in csv_files:
        sheet_title = csv_path.stem.strip()[:31]
        if first:
            ws = wb.active
            ws.title = sheet_title
            first = False
        else:
            ws = wb.create_sheet(title=sheet_title)
        with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
            for row in csv.reader(handle):
                ws.append(row)
    wb.save(out_path)
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
