#!/usr/bin/env python3
"""Package the OmniCMS element library skill for Claude upload."""

from __future__ import annotations

import argparse
import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_GENERATED = ROOT / "docs" / "omnicms-element-library"
SCRIPT_FILES = [
    ROOT / "scripts" / "extract-element-library.py",
    ROOT / "scripts" / "package-omnicms-skill.py",
]
SKIP_PARTS = {".git", "__pycache__", ".pytest_cache"}
SKIP_SUFFIXES = {".pyc", ".tmp", ".log"}


def should_skip(path: Path) -> bool:
    return any(part in SKIP_PARTS for part in path.parts) or path.suffix in SKIP_SUFFIXES


def add_file(zf: zipfile.ZipFile, source: Path, arcname: Path) -> None:
    if source.is_file() and not should_skip(source):
        zf.write(source, arcname.as_posix())


def package(skill_dir: Path, dist_dir: Path, generated_dir: Path) -> Path:
    if not (skill_dir / "SKILL.md").is_file():
        raise FileNotFoundError(f"missing SKILL.md in {skill_dir}")
    if not (generated_dir / "components.generated.md").is_file():
        raise FileNotFoundError(f"missing generated docs in {generated_dir}")

    dist_dir.mkdir(parents=True, exist_ok=True)
    zip_path = dist_dir / f"{skill_dir.name}.zip"
    tmp_path = zip_path.with_suffix(".zip.tmp")
    if tmp_path.exists():
        tmp_path.unlink()

    with zipfile.ZipFile(tmp_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in skill_dir.rglob("*"):
            if path.is_file() and not should_skip(path):
                add_file(zf, path, Path(skill_dir.name) / path.relative_to(skill_dir))

        for generated in ["components.generated.md", "components.generated.json"]:
            add_file(
                zf,
                generated_dir / generated,
                Path(skill_dir.name) / "references" / generated,
            )

        for script in SCRIPT_FILES:
            add_file(zf, script, Path(skill_dir.name) / "scripts" / script.name)

    shutil.move(str(tmp_path), str(zip_path))
    return zip_path


def main() -> int:
    argp = argparse.ArgumentParser()
    argp.add_argument("--skill", default="skills/omnicms-element-library")
    argp.add_argument("--dist", default="dist")
    argp.add_argument("--generated", default=str(DEFAULT_GENERATED))
    args = argp.parse_args()

    zip_path = package(Path(args.skill), Path(args.dist), Path(args.generated))
    print(f"packaged {zip_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
