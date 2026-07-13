#!/usr/bin/env python3
"""Extract copy-ready component markup from example-elements.html."""

from __future__ import annotations

import argparse
import html
import json
import re
import shlex
from collections import defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable


VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}

SECTION_ALIASES = {
    "hero-section": ["hero", "banner", "video hero"],
    "sections": ["section", "color system", "dark section", "media text"],
    "gateway": ["audience gateway", "chooser", "select cta"],
    "buttons": ["button", "primary button", "secondary button", "apply"],
    "links": ["arrow link", "link list", "chevron list"],
    "cards": ["cards", "trending", "trending at usf"],
    "stats": ["stats", "stat group", "rankings"],
    "events": ["events", "calendar feed"],
    "media-grid": ["image grid", "campus grid"],
    "video": ["video", "dialog", "youtube"],
    "snip-shell": ["shell", "stack", "wrapper"],
    "snip-heading": ["heading", "section intro"],
    "snip-cta": ["cta", "call to action", "snippet button"],
    "snip-nav": ["nav", "bottom nav", "pill nav"],
    "snip-cards": ["snip cards", "callout", "step card", "icon card"],
    "snip-stat-bar": ["stat bar", "callout text"],
    "snip-table": ["table", "comparison"],
    "snip-faq": ["faq", "details", "accordion"],
    "snip-panel": ["panel", "form", "request info"],
    "snip-flip": ["flip", "event badge", "flip button"],
    "snip-external": ["third-party", "generated", "documented"],
}


@dataclass
class Node:
    tag: str
    attrs: list[tuple[str, str | None]] = field(default_factory=list)
    children: list["Node | str"] = field(default_factory=list)
    parent: "Node | None" = None

    def attr(self, name: str) -> str | None:
        for key, value in self.attrs:
            if key == name:
                return value
        return None

    def classes(self) -> set[str]:
        value = self.attr("class") or ""
        return {part for part in value.split() if part}

    def has_class(self, name: str) -> bool:
        return name in self.classes()


class TreeBuilder(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.root = Node("document")
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Node(tag, preserve_attrs(self.get_starttag_text(), attrs), parent=self.stack[-1])
        self.stack[-1].children.append(node)
        if tag.lower() not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Node(tag, preserve_attrs(self.get_starttag_text(), attrs), parent=self.stack[-1])
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag.lower() == tag.lower():
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        self.stack[-1].children.append(data)

    def handle_entityref(self, name: str) -> None:
        self.stack[-1].children.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.stack[-1].children.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self.stack[-1].children.append(f"<!--{data}-->")


def walk(node: Node) -> Iterable[Node]:
    yield node
    for child in node.children:
        if isinstance(child, Node):
            yield from walk(child)


def direct_child(node: Node, tag: str) -> Node | None:
    for child in node.children:
        if isinstance(child, Node) and child.tag.lower() == tag:
            return child
    return None


def first_descendant(node: Node, predicate) -> Node | None:
    for candidate in walk(node):
        if candidate is not node and predicate(candidate):
            return candidate
    return None


def descendants(node: Node, predicate) -> list[Node]:
    return [candidate for candidate in walk(node) if candidate is not node and predicate(candidate)]


def preserve_attrs(raw_start_tag: str | None, fallback: list[tuple[str, str | None]]) -> list[tuple[str, str | None]]:
    if not raw_start_tag:
        return fallback

    raw = raw_start_tag.strip()
    raw = re.sub(r"^<\s*[^\s>/]+", "", raw)
    raw = re.sub(r"/?\s*>$", "", raw).strip()
    if not raw:
        return []

    lexer = shlex.shlex(raw, posix=True)
    lexer.whitespace_split = True
    lexer.commenters = ""
    lexer.quotes = "\"'"

    attrs: list[tuple[str, str | None]] = []
    try:
        for token in lexer:
            if "=" not in token:
                attrs.append((token, None))
                continue
            key, value = token.split("=", 1)
            attrs.append((key, value))
    except ValueError:
        return fallback

    return attrs


def text_content(node: Node | str) -> str:
    if isinstance(node, str):
        return html.unescape(node)
    return "".join(text_content(child) for child in node.children)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def attr_string(attrs: list[tuple[str, str | None]]) -> str:
    rendered = []
    for key, value in attrs:
        if key == "class" and value:
            classes = [item for item in value.split() if item != "demo-example"]
            if not classes:
                continue
            value = " ".join(classes)
        if value is None:
            rendered.append(key)
        else:
            rendered.append(f'{key}="{html.escape(value, quote=True)}"')
    return (" " + " ".join(rendered)) if rendered else ""


def render(node: Node | str, depth: int = 0) -> str:
    if isinstance(node, str):
        return node

    tag = node.tag
    attrs = attr_string(node.attrs)
    if tag.lower() in VOID_TAGS:
        return f"<{tag}{attrs}>"

    children = "".join(render(child, depth + 1) for child in node.children)
    return f"<{tag}{attrs}>{children}</{tag}>"


def format_markup(markup: str) -> str:
    lines = re.sub(r">\s*<", ">\n<", markup).splitlines()
    return "\n".join(line.strip() for line in lines if line.strip())


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:70].strip("-") or "component"


def classes_in_markup(markup: str) -> list[str]:
    found: set[str] = set()
    for match in re.finditer(r'class="([^"]+)"', markup):
        found.update(part for part in match.group(1).split() if part)
    return sorted(found)


def source_family(class_names: list[str]) -> str:
    if any(name.startswith("snip-") for name in class_names):
        return "snip"
    return "usf-v4"


def dependencies(family: str, markup: str) -> list[str]:
    deps = []
    if family == "snip":
        deps.append("tcap/omnicms-snippets/snippet-template.css")
        if "data-snip-" in markup:
            deps.append("tcap/omnicms-snippets/snippet-template.js")
    else:
        deps.extend(
            [
                "reference/usf-cms/css/v4/tokens.css",
                "reference/usf-cms/css/v4/base-utilities.css",
                "reference/usf-cms/css/v4/ui-components.css",
                "reference/usf-cms/css/v4/styles.css",
            ]
        )
        if "data-a11y-dialog" in markup:
            deps.append("a11y-dialog runtime on real usf.edu pages")
    return deps


def aliases(section_id: str, label: str, class_names: list[str]) -> list[str]:
    values = set(SECTION_ALIASES.get(section_id, []))
    values.update(name for name in class_names if name.startswith("snip-"))
    for token in re.findall(r"(?<![A-Za-z0-9])\.([A-Za-z_][A-Za-z0-9_-]*)", label):
        values.add(token)
    return sorted(values)


def parse_components(source: Path) -> list[dict]:
    parser = TreeBuilder()
    parser.feed(source.read_text(encoding="utf-8"))
    components: list[dict] = []

    sections = [
        node
        for node in walk(parser.root)
        if node.tag.lower() == "section" and "guide-section" in node.classes()
    ]

    for section in sections:
        section_id = section.attr("id") or "section"
        section_title_node = direct_child(section, "h2")
        section_title = clean_text(text_content(section_title_node)) if section_title_node else section_id
        lede = first_descendant(section, lambda node: node.has_class("lede"))
        section_note = clean_text(text_content(lede)) if lede else ""
        blocks = descendants(section, lambda node: node.has_class("demo-block"))

        for block_index, block in enumerate(blocks, start=1):
            label_node = first_descendant(block, lambda node: node.has_class("demo-block__label"))
            label = clean_text(text_content(label_node)) if label_node else section_title
            examples = descendants(block, lambda node: node.has_class("demo-example"))
            for example_index, example in enumerate(examples, start=1):
                markup = format_markup(render(example))
                class_names = classes_in_markup(markup)
                family = source_family(class_names)
                suffix_source = label if len(blocks) > 1 or len(examples) > 1 else section_title
                component_id = slugify(f"{section_id}-{suffix_source}")
                if len(blocks) > 1 or len(examples) > 1:
                    component_id = f"{component_id}-{example_index}" if len(examples) > 1 else component_id

                components.append(
                    {
                        "id": component_id,
                        "section_id": section_id,
                        "title": label,
                        "type": section_title,
                        "aliases": aliases(section_id, label, class_names),
                        "source_family": family,
                        "dependencies": dependencies(family, markup),
                        "notes": section_note,
                        "markup": markup,
                    }
                )

    return components


def render_markdown(components: list[dict], source: Path) -> str:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for component in components:
        grouped[component["type"]].append(component)

    lines = [
        "# OmniCMS Element Library Components",
        "",
        f"Generated from `{source.as_posix()}`.",
        "",
        "Use exact markup unless content changes require text/link/image substitutions. Preserve all non-demo classes.",
        "",
    ]

    for group, items in grouped.items():
        lines.extend([f"## {group}", ""])
        for component in items:
            lines.extend(
                [
                    f"### {component['title']}",
                    "",
                    f"- id: `{component['id']}`",
                    f"- source_family: `{component['source_family']}`",
                    f"- aliases: {', '.join('`' + a + '`' for a in component['aliases']) or 'none'}",
                    f"- dependencies: {', '.join('`' + d + '`' for d in component['dependencies'])}",
                ]
            )
            if component["notes"]:
                lines.append(f"- notes: {component['notes']}")
            lines.extend(["", "```html", component["markup"], "```", ""])
    return "\n".join(lines).rstrip() + "\n"


def write_outputs(components: list[dict], source: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = {"source": source.as_posix(), "count": len(components), "components": components}
    (out_dir / "components.generated.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (out_dir / "components.generated.md").write_text(
        render_markdown(components, source),
        encoding="utf-8",
    )


def main() -> int:
    argp = argparse.ArgumentParser()
    argp.add_argument("--source", default="example-elements.html")
    argp.add_argument("--out", default="docs/omnicms-element-library")
    args = argp.parse_args()

    source = Path(args.source)
    out_dir = Path(args.out)
    components = parse_components(source)
    write_outputs(components, source, out_dir)
    print(f"extracted {len(components)} components to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
