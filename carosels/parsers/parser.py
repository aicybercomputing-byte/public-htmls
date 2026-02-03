import os
import re
from pathlib import Path
from typing import Union

def sanitize_filename(name: str) -> str:
    p = Path(name)
    stem = p.stem.lower().replace(" ", "_")
    stem = re.sub(r"[^a-z0-9_-]", "", stem)
    stem = re.sub(r"_+", "_", stem).strip("_")

    suffix = p.suffix.lower()
    suffix = re.sub(r"[^a-z0-9.]", "", suffix)

    if not stem:
        stem = "file"

    return f"{stem}{suffix}"

def unique_path(path: Path) -> Path:
    if not path.exists():
        return path
    stem, suffix, parent = path.stem, path.suffix, path.parent
    i = 1
    while True:
        candidate = parent / f"{stem}_{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1

def rename_files(folder: Union[str, Path]) -> None:
    folder_path = Path(folder)
    if not folder_path.is_dir():
        raise ValueError(f"Not a directory: {folder_path}")

    for path in folder_path.iterdir():
        if not path.is_file():
            continue
        sanitized = sanitize_filename(path.name)
        target = unique_path(path.with_name(sanitized))
        if path == target:
            continue
        path.rename(target)
        print(f"{path.name} -> {target.name}")

def parse_photos(folder_path: Union[str, Path]) -> None:
    folder_path = Path(folder_path)

    rename_files(folder_path)

    pngs = sorted(
        [p for p in folder_path.iterdir() if p.is_file() and p.suffix.lower() == ".png"],
        key=lambda p: p.name
    )

    # IMPORTANT: make paths relative to repo root for your GitHub Pages base
    # If folder_path is already like photos/news/..., then as_posix is fine.
    file_contents = [p.as_posix() for p in pngs]

    # Slides: Bootstrap 3 requires .carousel-inner and one .item.active
    slide_lines = ['<div class="carousel-inner" role="listbox">']
    for i, link in enumerate(file_contents):
        active = " active" if i == 0 else ""
        alt = os.path.basename(link)
        slide_lines.append(
            f'  <div class="item{active}"><img src="https://aicybercomputing-byte.github.io/public-htmls/{link}" '
            f'alt="{alt}" style="width:100%;"></div>'
        )
    slide_lines.append("</div>")
    slides_txt = "\n".join(slide_lines) + "\n"

    (folder_path / "photos.txt").write_text(slides_txt, encoding="utf-8")

    # Indicators
    indicators_lines = []
    for i in range(len(file_contents)):
        cls = ' class="active"' if i == 0 else ""
        indicators_lines.append(f'<li data-target="#myCarousel" data-slide-to="{i}"{cls}></li>')
    indicators_txt = "\n".join(indicators_lines) + ("\n" if indicators_lines else "")

    (folder_path / "indicators.txt").write_text(indicators_txt, encoding="utf-8")
