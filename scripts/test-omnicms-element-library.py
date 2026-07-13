#!/usr/bin/env python3
"""Smoke tests for OmniCMS element library extraction/package artifacts."""

from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PY = ROOT / "scripts" / "extract-element-library.py"
PACKAGER = ROOT / "scripts" / "package-omnicms-skill.py"


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    extractor = load_module(PY, "extract_element_library")
    packager = load_module(PACKAGER, "package_omnicms_skill")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        generated = tmp_path / "generated"
        components = extractor.parse_components(ROOT / "example-elements.html")
        extractor.write_outputs(components, ROOT / "example-elements.html", generated)

        data = json.loads((generated / "components.generated.json").read_text(encoding="utf-8"))
        items = data["components"]
        titles = " ".join(item["title"] + " " + item["type"] for item in items).lower()
        ids = " ".join(item["id"] for item in items).lower()

        for expected in ["hero", "section color system", "cards", "faq", "panel", "flip"]:
            assert_true(expected in titles or expected in ids, f"missing {expected}")

        cards = [item for item in items if item["section_id"] == "cards"]
        assert_true(len(cards) == 1, "expected one cards component")
        assert_true(cards[0]["markup"].count('class="card card--usfgreen') == 3, "cards must have three cards")
        assert_true("card-group animate-group" in cards[0]["markup"], "cards missing animate group")

        forbidden = " ".join(item["section_id"] + " " + item["title"] for item in items).lower()
        for removed in ["header", "footer", "note / aside", "snip-note"]:
            assert_true(removed not in forbidden, f"removed element returned: {removed}")

        zip_path = packager.package(
            ROOT / "skills" / "omnicms-element-library",
            tmp_path / "dist",
            generated,
        )
        with zipfile.ZipFile(zip_path) as zf:
            names = set(zf.namelist())
        required = {
            "omnicms-element-library/SKILL.md",
            "omnicms-element-library/references/omnicms-rules.md",
            "omnicms-element-library/references/components.generated.md",
            "omnicms-element-library/references/components.generated.json",
            "omnicms-element-library/scripts/extract-element-library.py",
            "omnicms-element-library/scripts/package-omnicms-skill.py",
        }
        assert_true(required.issubset(names), "zip missing required files")
        assert_true(not any(name.startswith("omnicms-element-library/.claude/") for name in names), "zip includes .claude")

        cursor_rule = ROOT / ".cursor" / "rules" / "omnicms-element-library.mdc"
        codex_adapter = ROOT / ".codex" / "skills" / "omnicms-element-library" / "SKILL.md"
        agents_md = ROOT / "AGENTS.md"
        for path in [cursor_rule, codex_adapter, agents_md]:
            assert_true(path.is_file(), f"missing adapter {path}")
            content = path.read_text(encoding="utf-8")
            assert_true("components.generated.md" in content, f"adapter missing catalog pointer: {path}")

    print("test-omnicms-element-library.py: ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
