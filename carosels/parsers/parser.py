import os
import re
from pathlib import Path
from typing import Union
import unittest
import tempfile


# ----------------------------
# Filename normalization
# ----------------------------

def sanitize_filename(name: str) -> str:
    """
    Lowercase, spaces->_, and keep only [a-z0-9_.-] in the final filename.
    Preserves extension, and ensures a non-empty stem.
    """
    p = Path(name)

    stem = p.stem.lower().replace(" ", "_")
    stem = re.sub(r"[^a-z0-9_-]", "", stem)
    stem = re.sub(r"_+", "_", stem).strip("_")
    if not stem:
        stem = "file"

    suffix = p.suffix.lower()
    suffix = re.sub(r"[^a-z0-9.]", "", suffix)

    return f"{stem}{suffix}"


def unique_path(path: Path) -> Path:
    """
    If path exists, add _1, _2, ... until it doesn't.
    """
    if not path.exists():
        return path

    parent = path.parent
    stem = path.stem
    suffix = path.suffix

    i = 1
    while True:
        candidate = parent / f"{stem}_{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1


def rename_files(folder: Union[str, Path]) -> None:
    """
    Renames files in folder (non-recursive) using sanitize_filename, collision-safe.
    """
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


# ----------------------------
# HTML generation
# ----------------------------

def sanitize_slug(s: str) -> str:
    """
    For output HTML filename (based on folder name).
    Keeps it simple: lowercase, spaces->_, only [a-z0-9_-].
    """
    s = s.lower().replace(" ", "_")
    s = re.sub(r"[^a-z0-9_-]", "", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "carousel"


def build_carousel_html(
    image_urls: list[str],
    title: str,
    interval_ms: int = 4000
) -> str:
    """
    Returns a complete Bootstrap 3 HTML document embedding indicators+slides.
    """
    # Indicators
    indicators_lines = []
    for i in range(len(image_urls)):
        cls = ' class="active"' if i == 0 else ""
        indicators_lines.append(f'                <li data-target="#myCarousel" data-slide-to="{i}"{cls}></li>')

    indicators = "\n".join(indicators_lines)

    # Slides
    slide_lines = []
    for i, url in enumerate(image_urls):
        active = " active" if i == 0 else ""
        alt = os.path.basename(url)
        slide_lines.append(
            f'                <div class="item{active}"><img src="{url}" alt="{alt}" style="width:100%;"></div>'
        )

    slides = "\n".join(slide_lines)

    # Full HTML (Bootstrap 3)
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <title>{title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
</head>
<body>
    <div class="container">
        <div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="{interval_ms}">
            <ol class="carousel-indicators">
{indicators}
            </ol>

            <div class="carousel-inner" role="listbox">
{slides}
            </div>

            <a class="left carousel-control" href="#myCarousel" data-slide="prev">
                <span class="glyphicon glyphicon-chevron-left"></span>
                <span class="sr-only">Previous</span>
            </a>
            <a class="right carousel-control" href="#myCarousel" data-slide="next">
                <span class="glyphicon glyphicon-chevron-right"></span>
                <span class="sr-only">Next</span>
            </a>
        </div>
    </div>

    <script>
    // JS fallback to ensure interval applies even if data-interval is ignored.
    $(function() {{
        $('#myCarousel').carousel({{ interval: {interval_ms} }});
    }});
    </script>
</body>
</html>
"""
    return html


def parse_photos_to_carousel_html(
    photos_folder: Union[str, Path],
    repo_public_base_url: str = "https://aicybercomputing-byte.github.io/public-htmls/",
    output_carosels_dir: Union[str, Path] = Path("carosels") / "news" / "2026",
    interval_ms: int = 4000
) -> Path:
    """
    - Renames photo files in `photos_folder`
    - Collects .png files
    - Builds a complete Bootstrap 3 carousel HTML
    - Overwrites `output_carosels_dir/<last_folder_name>.html`
    - Returns the output HTML Path
    """
    photos_folder = Path(photos_folder)
    if not photos_folder.is_dir():
        raise ValueError(f"Not a directory: {photos_folder}")

    rename_files(photos_folder)

    pngs = sorted(
        [p for p in photos_folder.iterdir() if p.is_file() and p.suffix.lower() == ".png"],
        key=lambda p: p.name
    )

    # Convert to URL paths.
    # We want: repo_public_base_url + "photos/news/2026/website_story/file.png"
    # So we need the path relative to the repo root that contains "public-htmls".
    # In your usage, `photos_folder` is likely already like "photos/news/2026/website_story".
    # We'll use as_posix from that folder down.
    rel_paths = [p.as_posix() for p in pngs]
    image_urls = [repo_public_base_url.rstrip("/") + "/" + rel for rel in rel_paths]

    # Output filename based on last folder name
    slug = sanitize_slug(photos_folder.name)
    out_dir = Path(output_carosels_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    out_path = out_dir / f"{slug}.html"

    # Security: ensure we only write inside out_dir
    out_dir_resolved = out_dir.resolve()
    out_path_resolved = out_path.resolve()
    if out_dir_resolved not in out_path_resolved.parents and out_path_resolved != out_dir_resolved:
        raise RuntimeError("Refusing to write outside output directory.")

    title = slug.replace("_", " ").title()
    html = build_carousel_html(image_urls=image_urls, title=title, interval_ms=interval_ms)

    out_path.write_text(html, encoding="utf-8")
    return out_path


# ----------------------------
# Tests (functional + security)
# ----------------------------

class TestCarouselHtml(unittest.TestCase):
    def test_generates_valid_bootstrap3_structure(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            photos = root / "photos" / "news" / "2026" / "website_story"
            photos.mkdir(parents=True, exist_ok=True)

            # minimal fake png headers
            (photos / "A.png").write_bytes(b"\x89PNG\r\n\x1a\n")
            (photos / "B.png").write_bytes(b"\x89PNG\r\n\x1a\n")

            out_dir = root / "carosels" / "news" / "2026"
            out_path = parse_photos_to_carousel_html(
                photos_folder=photos,
                repo_public_base_url="https://example.test/public-htmls/",
                output_carosels_dir=out_dir,
                interval_ms=1234
            )

            html = out_path.read_text(encoding="utf-8")

            # Required Bootstrap 3 pieces
            self.assertIn('class="carousel-inner"', html)
            self.assertIn('class="item active"', html)     # exactly one active slide
            self.assertEqual(html.count('class="item active"'), 1)
            self.assertEqual(html.count('class="item'), 2)  # total slides

            # Indicators count matches slides
            self.assertEqual(html.count('data-slide-to="'), 2)
            self.assertIn('data-slide-to="0" class="active"', html)

            # Auto-rotate included
            self.assertIn('data-interval="1234"', html)
            self.assertIn("interval: 1234", html)

    def test_security_output_stays_inside_output_dir(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            photos = root / "photos" / "news" / "2026" / "weird..name///"
            # Pathlib will normalize; create folder with a safe name anyway
            photos = root / "photos" / "news" / "2026" / "weird__name"
            photos.mkdir(parents=True, exist_ok=True)
            (photos / "x.png").write_bytes(b"\x89PNG\r\n\x1a\n")

            out_dir = root / "carosels" / "news" / "2026"
            out_path = parse_photos_to_carousel_html(
                photos_folder=photos,
                repo_public_base_url="https://example.test/public-htmls/",
                output_carosels_dir=out_dir
            )

            # Ensure file is inside out_dir
            self.assertTrue(out_path.resolve().is_relative_to(out_dir.resolve()))


if __name__ == "__main__":
    # Example usage (no argparse; adjust as needed):
    # parse_photos_to_carousel_html(r"photos\news\2026\website_story")
    unittest.main()
