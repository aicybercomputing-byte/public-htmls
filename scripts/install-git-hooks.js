#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

const HOOKS = {
  "post-commit": `#!/bin/sh
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT" || exit 1
node scripts/run-index-hook.js post-commit
`,
  "post-merge": `#!/bin/sh
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT" || exit 1
node scripts/run-index-hook.js post-merge
`,
  "post-checkout": `#!/bin/sh
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT" || exit 1
node scripts/run-index-hook.js post-checkout "$1" "$2" "$3"
`,
};

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

  for (const [hookName, body] of Object.entries(HOOKS)) {
    const hookPath = path.join(hooksDir, hookName);
    fs.writeFileSync(hookPath, body, { mode: 0o755 });
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
  execSync("node scripts/generate-index.js --if-changed", {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("Hooks installed.");
}

if (require.main === module) {
  main();
}

module.exports = { installHooks, HOOKS };
