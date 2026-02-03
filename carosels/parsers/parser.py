import os
import re
from pathlib import Path

def sanitize_filename(name: str) -> str:
    name = name.lower().replace(" ", "_")
    name = re.sub(r"[^a-z0-9_.-]", "", name)
    name = re.sub(r"_+", "_", name)
    return name

def unique_path(path: Path) -> Path:
    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    parent = path.parent

    i = 1
    while True:
        candidate = parent / f"{stem}_{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1

def rename_files(folder: str | Path):
    folder_path = Path(folder)

    if not folder_path.is_dir():
        raise ValueError(f"Not a directory: {folder_path}")

    for path in folder_path.iterdir():
        if not path.is_file():
            continue

        sanitized = sanitize_filename(path.name)
        target = path.with_name(sanitized)
        target = unique_path(target)

        if path == target:
            continue

        path.rename(target)
        print(f"{path.name} -> {target.name}")




def parse_photos(folder_path):
    rename_files(folder_path)
    file_contents = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            file_path = os.path.join(folder_path, filename).replace("\\", "/")
            file_contents.append(file_path)
            
    file_txt = ""
    for link in file_contents:
        html_stub = f'<div class="item"><img src="https://aicybercomputing-byte.github.io/public-htmls/{link}" alt="{os.path.basename(link)}" style="width:100%;"></div>'
        file_txt += html_stub + "\n"

    output_path = os.path.join(folder_path, "photos.txt").replace("\\", "/")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(file_txt)

    file_txt = "<li data-target=\"#myCarousel\" data-slide-to=\"0\" class=\"active\"></li>" + "\n"
    for i, link in enumerate(file_contents):
        if i == 0:
            continue
        file_txt += f"<li data-target=\"#myCarousel\" data-slide-to=\"{i}\"></li>\n"
    output_path = os.path.join(folder_path, "indicators.txt").replace("\\", "/")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(file_txt)