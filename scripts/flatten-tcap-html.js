#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NAV = [
  ["Overview.dc.html", "overview.html"],
  ["Stages.dc.html", "stages.html"],
  ["Experiential%20Learning.dc.html", "experiential-learning.html"],
  ["FAQ.dc.html", "faq.html"],
];

function flattenTcapHtml(html) {
  const helmet = html.match(/<helmet>([\s\S]*?)<\/helmet>/);
  const helmetInner = helmet ? helmet[1].trim() : "";

  let out = html.replace(/<script src="\.\/support\.js"><\/script>\s*/g, "");
  out = out.replace(/<body>\s*<x-dc>\s*<helmet>[\s\S]*?<\/helmet>\s*/, "<body>\n");
  out = out.replace(/\s*<\/x-dc>\s*(<\/body>)/, "\n$1");
  out = out.replace("</head>", `${helmetInner}\n</head>`);

  for (const [from, to] of NAV) {
    out = out.split(from).join(to);
  }

  return out;
}

for (const name of ["overview", "stages", "faq", "experiential-learning"]) {
  const file = path.join(ROOT, "tcap", `${name}.html`);
  const html = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, flattenTcapHtml(html), "utf8");
  console.log(`flattened ${file}`);
}
