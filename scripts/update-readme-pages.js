#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const README = path.join(ROOT, "README.md");
const START = "<!-- pages-deploy-start -->";
const END = "<!-- pages-deploy-end -->";

function defaultPageUrl() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return "https://aicybercomputing-byte.github.io/public-htmls/";
  const [owner, name] = repo.split("/");
  return `https://${owner}.github.io/${name}/`;
}

function normalizeUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return defaultPageUrl();
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function buildBlock(pageUrl, deployedAt, commit) {
  const indexUrl = `${pageUrl}index.html`;
  const shortSha = commit ? commit.slice(0, 7) : "local";
  return `${START}
**Live site:** [${indexUrl}](${indexUrl})

**GitHub Pages base:** [${pageUrl}](${pageUrl})

**Last deployed:** ${deployedAt} · commit \`${shortSha}\`
${END}`;
}

function updateReadme({
  readmePath = README,
  pageUrl = process.env.PAGE_URL,
  deployedAt = process.env.DEPLOYED_AT || new Date().toISOString(),
  commit = process.env.GITHUB_SHA || "local",
  write = true,
} = {}) {
  const url = normalizeUrl(pageUrl || defaultPageUrl());
  const block = buildBlock(url, deployedAt, commit);

  let readme = fs.readFileSync(readmePath, "utf8");
  if (!readme.includes(START) || !readme.includes(END)) {
    throw new Error(`README missing ${START} / ${END} markers`);
  }

  const pattern = new RegExp(
    `${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
  );
  const updated = readme.replace(pattern, block);
  const changed = updated !== readme;

  if (write && changed) {
    fs.writeFileSync(readmePath, updated, "utf8");
  }

  return { changed, pageUrl: url, readme: updated };
}

if (require.main === module) {
  const { changed, pageUrl } = updateReadme();
  if (changed) {
    console.log(`Updated README with ${pageUrl}`);
  } else {
    console.log(`README deploy block unchanged (${pageUrl})`);
  }
}

module.exports = { updateReadme, defaultPageUrl, buildBlock };
