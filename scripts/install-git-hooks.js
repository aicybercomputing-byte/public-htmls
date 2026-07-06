#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const HOOKS = ["post-merge", "post-checkout", "post-commit"];

const HOOK_BODY = `#!/bin/sh
# public-htmls: regenerate root index.html
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT" || exit 1
node scripts/generate-index.js || exit 0
`;

function getGitDir() {
  try {
    return execSync("git rev-parse --git-dir", {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function installHooks(gitDir) {
  const hooksDir = path.resolve(ROOT, gitDir, "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });

  for (const hookName of HOOKS) {
    const hookPath = path.join(hooksDir, hookName);
    fs.writeFileSync(hookPath, HOOK_BODY, { mode: 0o755 });
    console.log(`Installed ${hookName}`);
  }
}

function main() {
  const gitDir = getGitDir();
  if (!gitDir) {
    console.error("Not a git repository; skipping hook install.");
    process.exit(1);
  }

  installHooks(gitDir);
  execSync("node scripts/generate-index.js", { cwd: ROOT, stdio: "inherit" });
  console.log("Hooks installed and index generated.");
}

if (require.main === module) {
  main();
}

module.exports = { installHooks, HOOKS };
