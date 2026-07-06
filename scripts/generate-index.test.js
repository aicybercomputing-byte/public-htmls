#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const {
  collectPages,
  groupPages,
  generateIndex,
  shouldIncludeFile,
  shouldSkipDir,
} = require("./generate-index.js");
const {
  getChangedFiles,
  hasIndexRelevantChanges,
  isRelevantChange,
} = require("./run-index-hook.js");

const ROOT = path.join(__dirname, "..");

assert.strictEqual(shouldSkipDir(".git"), true);
assert.strictEqual(shouldSkipDir("tcap"), false);
assert.strictEqual(shouldIncludeFile("tcap/faq.html"), true);
assert.strictEqual(shouldIncludeFile("tcap/faq.pcf"), false);
assert.strictEqual(shouldIncludeFile("tmp-usf-jobs-live.html"), false);
assert.strictEqual(shouldIncludeFile("index.html"), false);
assert.strictEqual(shouldIncludeFile("jobs_page/index.html"), true);
assert.strictEqual(isRelevantChange("index.html"), false);
assert.strictEqual(isRelevantChange("README.md"), true);
assert.strictEqual(isRelevantChange("tcap/faq.html"), true);
assert.strictEqual(hasIndexRelevantChanges(["index.html"]), false);
assert.strictEqual(hasIndexRelevantChanges(["README.md"]), true);
assert.strictEqual(hasIndexRelevantChanges(["tcap/faq.html"]), true);
assert.deepStrictEqual(getChangedFiles("post-checkout", ["a", "a"]), []);

const pages = collectPages(ROOT);
assert.ok(pages.some((page) => page.relative === "tcap/faq.html"));
assert.ok(!pages.some((page) => page.relative === "tcap/faq.pcf"));
assert.ok(!pages.some((page) => page.relative === "tmp-usf-jobs-live.html"));

const groups = groupPages(pages);
const tcap = groups.find(([key]) => key === "tcap");
assert.ok(tcap, "expected tcap section");
assert.ok(tcap[1].length >= 4, "expected at least four tcap pages");

const { html } = generateIndex({
  root: ROOT,
  output: path.join(__dirname, ".index-test-output.html"),
  write: false,
});
assert.match(html, /tcap\/faq\.html/);
assert.match(html, /href="tcap\/faq\.html"/);
assert.doesNotMatch(html, /preview\.html\?f=/);
assert.match(html, /Auto-generated index/);

const testOutput = path.join(__dirname, ".index-test-output.html");
fs.writeFileSync(testOutput, html, "utf8");
const unchanged = generateIndex({
  root: ROOT,
  output: testOutput,
  write: true,
  onlyIfChanged: true,
});
assert.strictEqual(unchanged.changed, false);
fs.unlinkSync(testOutput);

console.log("generate-index.test.js: ok");
