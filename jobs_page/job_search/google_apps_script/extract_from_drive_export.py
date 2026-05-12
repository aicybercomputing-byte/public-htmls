#!/usr/bin/env python3
"""Extract Google Apps Script files from Drive JSON export.

Usage:
  python extract_from_drive_export.py --input "C:/path/Jobs Search.json" --output "C:/path/job_search"
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


TYPE_TO_EXT = {
    "server_js": ".gs",
    "html": ".html",
    "json": ".json",
}


def safe_name(name: str) -> str:
    cleaned = "".join(ch for ch in name if ch.isalnum() or ch in ("_", "-", ".")).strip(".")
    return cleaned or "unnamed"


def extract(input_path: Path, output_dir: Path) -> list[Path]:
    data = json.loads(input_path.read_text(encoding="utf-8"))
    files = data.get("files", [])
    if not isinstance(files, list):
        raise ValueError("Input JSON missing 'files' array")

    output_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    for entry in files:
        if not isinstance(entry, dict):
            continue
        name = safe_name(str(entry.get("name", "unnamed")))
        file_type = str(entry.get("type", "")).strip()
        source = str(entry.get("source", ""))
        ext = TYPE_TO_EXT.get(file_type, ".txt")
        out_path = output_dir / f"{name}{ext}"
        out_path.write_text(source, encoding="utf-8")
        written.append(out_path)

    return written


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to Google Drive JSON export")
    parser.add_argument("--output", required=True, help="Output directory")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    written = extract(input_path, output_dir)
    print(f"Wrote {len(written)} files to {output_dir}")
    for p in written:
        print(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
