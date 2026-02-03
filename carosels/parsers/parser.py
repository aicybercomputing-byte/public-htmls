import os
import re
from pathlib import Path
from typing import Union
import unittest
import tempfile


def sanitize_filename(name: str) -> str:
    """
    Lowercase, spaces->_, and keep only [a-z0-9_.-].
    Ensures the filename is not empty and preserves extension.
    """
    p = Path(name)
    stem = p.stem.lower().replace(" ", "_")
    stem = re.sub(r"[^a-z0-9_-]", "", stem)  # stem: no dots
    stem = re.sub(r"_+", "_", stem).strip("_")

    suffix = p.suffix.lower()
    suffix = re.sub(r"[^a-z0-9.]", "", suffix)  # defensive

    if not stem:
        stem = "file"

    return f"{stem}{suffix}"


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


def rename_files(folder: Union[str, Path]) -> None:
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


def parse_photos(folder_path: Union[str, Path]) -> None:
    folder_path = Path(folder_path)

    rename_files(folder_path)

    # Collect .png files in stable, predictable order
    pngs = sorted([p for p in folder_path.iterdir() if p.is_file() and p.suffix.lower() == ".png"],
                  key=lambda p: p.name)

    file_contents = []
    for p in pngs:
        # Build a forward-slash relative path, like "photos/news/2026/website_story/x.png"
        rel = str(p.as_posix())
        file_contents.append(rel)

    # Slides (Bootstrap 3 style: class="item" and first item "active")
    slides_txt_lines = []
    for i, link in enumerate(file_contents):
        active = " active" if i == 0 else ""
        alt = os.path.basename(link)
        slides_txt_lines.append(
            f'<div class="item{active}"><img src="https://aicybercomputing-byte.github.io/public-htmls/{link}" '
            f'alt="{alt}" style="width:100%;"></div>'
        )
    slides_txt = "\n".join(slides_txt_lines) + ("\n" if slides_txt_lines else "")

    slides_out = folder_path / "photos.txt"
    slides_out.write_text(slides_txt, encoding="utf-8")

    # Indicators (one active, rest not)
    indicators_lines = []
    if file_contents:
        indicators_lines.append('<li data-target="#myCarousel" data-slide-to="0" class="active"></li>')
        for i in range(1, len(file_contents)):
            indicators_lines.append(f'<li data-target="#myCarousel" data-slide-to="{i}"></li>')

    indicators_txt = "\n".join(indicators_lines) + ("\n" if indicators_lines else "")
    indicators_out = folder_path / "indicators.txt"
    indicators_out.write_text(indicators_txt, encoding="utf-8")


# -----------------------
# Tests (functional + security)
# -----------------------

class TestCarouselParsing(unittest.TestCase):
    def test_active_slide_and_indicator_counts(self):
        with tempfile.TemporaryDirectory() as td:
            d = Path(td)
            # Create dummy pngs
            (d / "A.png").write_bytes(b"\x89PNG\r\n\x1a\n")
            (d / "B.png").write_bytes(b"\x89PNG\r\n\x1a\n")

            parse_photos(d)

            photos = (d / "photos.txt").read_text(encoding="utf-8")
            indicators = (d / "indicators.txt").read_text(encoding="utf-8")

            # Exactly one active slide
            self.assertIn('class="item active"', photos)
            self.assertEqual(photos.count('class="item active"'), 1)

            # Total slides equals number of pngs
            self.assertEqual(photos.count('class="item'), 2)

            # Indicators equals number of pngs, first active
            self.assertEqual(indicators.count('data-slide-to="'), 2)
            self.assertIn('data-slide-to="0" class="active"', indicators)

    def test_collision_dedup_on_rename(self):
        with tempfile.TemporaryDirectory() as td:
            d = Path(td)
            # These sanitize to same name: "indicators.txt"
            (d / "Indicators.txt").write_text("x", encoding="utf-8")
            (d / "INDICATORS!.txt").write_text("y", encoding="utf-8")

            rename_files(d)

            names = sorted([p.name for p in d.iterdir() if p.is_file()])
            self.assertIn("indicators.txt", names)
            self.assertTrue(any(n.startswith("indicators_") and n.endswith(".txt") for n in names))

    def test_security_no_path_traversal_outputs(self):
        # Security-focused: ensure we only ever write outputs inside the folder
        with tempfile.TemporaryDirectory() as td:
            d = Path(td)
            (d / "x.png").write_bytes(b"\x89PNG\r\n\x1a\n")

            parse_photos(d)

            self.assertTrue((d / "photos.txt").exists())
            self.assertTrue((d / "indicators.txt").exists())
            # Ensure we didn't accidentally create files outside d
            self.assertFalse((d.parent / "photos.txt").exists())
            self.assertFalse((d.parent / "indicators.txt").exists())


if __name__ == "__main__":
    # Basic manual run example:
    # parse_photos(r"photos\news\2026\website_story")
    unittest.main()
