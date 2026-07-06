#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const path = require("path");
const { generateIndex } = require("./generate-index.js");

const ROOT = path.join(__dirname, "..");

function gitLines(command) {
  try {
    return execSync(command, { cwd: ROOT, encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getChangedFiles(hook, args) {
  switch (hook) {
    case "post-commit":
      return gitLines("git diff-tree --no-commit-id --name-only -r HEAD");
    case "post-merge":
      return gitLines("git diff --name-only ORIG_HEAD HEAD");
    case "post-checkout": {
      const [previous, next] = args;
      if (!previous || !next || previous === next) return [];
      return gitLines(`git diff --name-only "${previous}" "${next}"`);
    }
    default:
      return [];
  }
}

const HOOK_IGNORED_FILES = new Set(["index.html"]);

function isRelevantChange(relativePath) {
  const relativePosix = relativePath.split(path.sep).join("/");
  return !HOOK_IGNORED_FILES.has(relativePosix);
}

function hasIndexRelevantChanges(files) {
  return files.some(isRelevantChange);
}

function main() {
  const hook = process.argv[2];
  const args = process.argv.slice(3);
  const changed = getChangedFiles(hook, args);

  if (!hasIndexRelevantChanges(changed)) {
    return;
  }

  const { changed: wrote, pages } = generateIndex({ onlyIfChanged: true });
  if (wrote) {
    console.log(`Updated index.html (${pages.length} pages)`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getChangedFiles,
  hasIndexRelevantChanges,
  isRelevantChange,
  HOOK_IGNORED_FILES,
};
