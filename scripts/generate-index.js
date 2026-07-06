#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "index.html");
const PAGE_EXTENSIONS = new Set([".html", ".htm", ".pcf"]);
const EXCLUDE_DIRS = new Set([
  ".git",
  ".cursor",
  ".claude",
  "node_modules",
  "__pycache__",
  "scripts",
  "venv",
  "csv",
  "data",
]);
const EXCLUDE_FILE_PREFIXES = ["tmp-"];
const EXCLUDE_RELATIVE_FILES = new Set(["index.html"]);

const SECTION_LABELS = {
  "ai-x": "AI+X Events",
  carosels: "Carousels",
  jobs_page: "Jobs Page",
  "main-page": "Main Page",
  "more-info": "More Info",
  "now-serving": "Now Serving",
  tcap: "tCAP",
  root: "Root",
};

function shouldSkipDir(name) {
  return EXCLUDE_DIRS.has(name) || name.startsWith(".");
}

function shouldIncludeFile(relativePosix) {
  const base = path.posix.basename(relativePosix);
  if (EXCLUDE_RELATIVE_FILES.has(relativePosix)) return false;
  if (EXCLUDE_FILE_PREFIXES.some((prefix) => base.startsWith(prefix))) return false;
  return PAGE_EXTENSIONS.has(path.posix.extname(base).toLowerCase());
}

function affectsIndex(relativePath) {
  const relativePosix = relativePath.split(path.sep).join("/");
  if (relativePosix === "scripts/generate-index.js") return true;
  return shouldIncludeFile(relativePosix);
}

function normalizeIndexHtml(html) {
  return html.replace(/Auto-generated index · [^<]+/, "Auto-generated index · STABLE");
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function collectPages(dir = ROOT, relativeDir = "") {
  const pages = [];
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return pages;
  }

  for (const entry of entries) {
    const relative = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      pages.push(...collectPages(absolute, relative));
      continue;
    }

    if (!entry.isFile()) continue;
    const relativePosix = toPosix(relative);
    if (!shouldIncludeFile(relativePosix)) continue;

    pages.push({
      relative: relativePosix,
      section: relativePosix.includes("/") ? relativePosix.split("/")[0] : "root",
      label: path.posix.basename(relativePosix),
    });
  }

  return pages;
}

function groupPages(pages) {
  const groups = new Map();

  for (const page of pages) {
    if (!groups.has(page.section)) groups.set(page.section, []);
    groups.get(page.section).push(page);
  }

  for (const items of groups.values()) {
    items.sort((a, b) => a.relative.localeCompare(b.relative));
  }

  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "root") return 1;
    if (b === "root") return -1;
    return a.localeCompare(b);
  });
}

function sectionTitle(sectionKey, count) {
  const label = SECTION_LABELS[sectionKey] || sectionKey;
  return `${label} (${count})`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPageItem(page) {
  const href = escapeHtml(page.relative);
  const label = escapeHtml(page.label);
  return `
      <li class="page-item">
        <details>
          <summary>
            <a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>
            <span class="path">${href}</span>
          </summary>
          <div class="preview-wrap">
            <iframe src="${href}" title="Preview of ${label}" loading="lazy"></iframe>
          </div>
        </details>
      </li>`;
}

function renderIndex(groups) {
  const total = groups.reduce((sum, [, items]) => sum + items.length, 0);
  const generatedAt = new Date().toISOString();

  const sections = groups
    .map(([sectionKey, items]) => {
      const open = sectionKey === "tcap" ? " open" : "";
      return `
    <details class="section"${open}>
      <summary>${escapeHtml(sectionTitle(sectionKey, items.length))}</summary>
      <ul class="page-list">
        ${items.map(renderPageItem).join("\n")}
      </ul>
    </details>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bellini College — Site Asset Index</title>
  <style>
    :root {
      --green: #006747;
      --green-soft: #eef4f1;
      --ink: #2b2b2b;
      --muted: #666;
      --line: #d8d6cd;
      --bg: #f0eee9;
      --card: #fff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 15px/1.45 system-ui, -apple-system, Segoe UI, sans-serif;
    }
    .wrap { max-width: 960px; margin: 0 auto; padding: 24px 20px 40px; }
    header { margin-bottom: 20px; }
    h1 { margin: 0 0 6px; font-size: 1.6rem; color: var(--green); }
    .meta { margin: 0; color: var(--muted); font-size: 0.9rem; }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 16px 0 20px;
    }
    .stat {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px 14px;
      min-width: 120px;
    }
    .stat strong { display: block; font-size: 1.25rem; color: var(--green); }
    .section {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .section > summary {
      cursor: pointer;
      padding: 14px 16px;
      font-weight: 600;
      color: var(--green);
      list-style-position: outside;
    }
    .page-list {
      list-style: none;
      margin: 0;
      padding: 0 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .page-item details {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--green-soft);
    }
    .page-item summary {
      cursor: pointer;
      padding: 10px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: baseline;
    }
    .page-item summary a {
      color: var(--green);
      font-weight: 600;
      text-decoration: none;
    }
    .page-item summary a:hover { text-decoration: underline; }
    .path {
      font-size: 0.82rem;
      color: var(--muted);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    .preview-wrap {
      border-top: 1px solid var(--line);
      background: #fff;
      padding: 8px;
    }
    iframe {
      width: 100%;
      min-height: 420px;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: #fff;
    }
    footer {
      margin-top: 24px;
      font-size: 0.85rem;
      color: var(--muted);
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Bellini College External Website Assets</h1>
      <p class="meta">Auto-generated index · ${escapeHtml(generatedAt)}</p>
    </header>
    <div class="stats">
      <div class="stat"><strong>${total}</strong> pages</div>
      <div class="stat"><strong>${groups.length}</strong> sections</div>
    </div>
    ${sections}
    <footer>
      Regenerated by <code>scripts/generate-index.js</code> when indexed pages change on pull, checkout, or commit.
      Run <code>node scripts/generate-index.js</code> manually after <code>git fetch</code>.
    </footer>
  </div>
</body>
</html>
`;
}

function generateIndex({
  root = ROOT,
  output = OUTPUT,
  write = true,
  onlyIfChanged = false,
} = {}) {
  const pages = collectPages(root);
  const groups = groupPages(pages);
  const html = renderIndex(groups);
  let changed = false;

  if (write) {
    let existing = "";
    try {
      existing = fs.readFileSync(output, "utf8");
    } catch {
      existing = "";
    }

    const contentChanged =
      !existing || normalizeIndexHtml(existing) !== normalizeIndexHtml(html);

    if (!onlyIfChanged || contentChanged) {
      fs.writeFileSync(output, html, "utf8");
      changed = true;
    }
  }

  return { pages, groups, html, output, changed };
}

if (require.main === module) {
  const onlyIfChanged = process.argv.includes("--if-changed");
  const { pages, output, changed } = generateIndex({ onlyIfChanged });
  if (changed) {
    console.log(`Wrote ${pages.length} pages to ${output}`);
  } else {
    console.log(`No index changes (${pages.length} pages)`);
  }
}

module.exports = {
  affectsIndex,
  collectPages,
  groupPages,
  generateIndex,
  normalizeIndexHtml,
  shouldIncludeFile,
  shouldSkipDir,
};
