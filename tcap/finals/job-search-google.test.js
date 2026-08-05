/**
 * Standalone Node test for rankAndCapResults' per-provider fallback.
 *
 * job-search-google.js is a Google Apps Script file (no module.exports,
 * relies on Apps Script globals like Logger). There's no test runner or
 * package.json in this repo, so this loads the script into a vm sandbox
 * with a stubbed Logger and calls the plain-JS ranking functions directly.
 *
 * Run: node tcap/finals/job-search-google.test.js
 */
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var source = fs.readFileSync(path.join(__dirname, "job-search-google.js"), "utf8");

var sandbox = {
  Logger: { log: function () {} },
  console: console
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "job-search-google.js" });

function makeRow(provider, matchScore, baselineScore) {
  var row = { provider: provider, title: "t", match_score: matchScore };
  if (baselineScore != null) {
    row._baseline_match_score = baselineScore;
  }
  return row;
}

// Provider "a": every row scores below the 30% floor after a degree-profile
// rescore, but had healthy baseline scores beforehand. Previously this
// provider was dropped entirely; now it should fall back to baseline order.
var rowsA = [
  makeRow("a", 24, 90),
  makeRow("a", 17, 60),
  makeRow("a", 10, 75)
];

// Provider "b": normal case, some rows pass the floor, some don't. Should
// behave exactly as before (no fallback triggered).
var rowsB = [
  makeRow("b", 80),
  makeRow("b", 10),
  makeRow("b", 45)
];

var ranked = sandbox.rankAndCapResults(rowsA.concat(rowsB), 20);

var fromA = ranked.filter(function (r) {
  return r.provider === "a";
});
var fromB = ranked.filter(function (r) {
  return r.provider === "b";
});

// Fallback: provider "a" keeps all 3 rows (none pass the floor, so it falls
// back to baseline ranking) instead of being wiped out.
assert.strictEqual(fromA.length, 3, "provider a should fall back instead of being dropped to 0");
assert.strictEqual(fromA[0].match_score, 24, "baseline-highest row (90) should rank first within provider a");
assert.strictEqual(fromA[1].match_score, 17, "baseline second (75) should rank second within provider a");
assert.strictEqual(fromA[2].match_score, 10, "baseline lowest (60) should rank third within provider a");

// Normal case: provider "b" only keeps rows >= 30%, unaffected by fallback.
assert.strictEqual(fromB.length, 2, "provider b should only keep rows above the floor");
// fromB is an Array from the vm sandbox's separate realm; concat onto a
// plain outer-realm array before comparing so deepStrictEqual doesn't trip
// on cross-realm Array prototypes.
var fromBScores = [].concat(
  fromB.map(function (r) {
    return r.match_score;
  })
);
assert.deepStrictEqual(fromBScores, [80, 45], "provider b should be ranked by match_score as before");

console.log("OK: rankAndCapResults per-provider fallback");

// v2PercentOfCourseMatchScore_ used to score hits/courseTerms.length (a
// literal percentage of the whole alias list), so a real match against a
// couple of terms in a long synonym list landed under the 30% floor even
// though it's a genuine match (this reproduces the exact case from the
// bug report: "AI Trainer - Advanced SQL Developers" scoring 24%).
var bscsAliases = sandbox.getDegreeSearchProfiles_().bscs.aliases;
var relevantBlob = "ai trainer - advanced sql developers";
var scoreForRelevantJob = sandbox.v2PercentOfCourseMatchScore_(bscsAliases, relevantBlob);

assert.ok(
  scoreForRelevantJob >= sandbox.MIN_MATCH_SCORE_PERCENT,
  "a job matching 'sql' + 'developer' should score above the 30% floor, got " + scoreForRelevantJob
);

var scoreForIrrelevantJob = sandbox.v2PercentOfCourseMatchScore_(bscsAliases, "bartender at a restaurant");

assert.ok(
  scoreForIrrelevantJob < sandbox.MIN_MATCH_SCORE_PERCENT,
  "a job matching none of the aliases should stay below the 30% floor, got " + scoreForIrrelevantJob
);

console.log("OK: v2PercentOfCourseMatchScore_ no longer penalizes real matches against long alias lists");

// Regression guard: every non-interdisciplinary degree profile (the 5
// interdisciplinary double-majors use v2TermMatchStrength_ directly via
// specialty_aliases, never affected by this bug) must score a genuine
// single-alias-term hit above the 30% floor, regardless of that profile's
// alias list length (7-13 terms across the 13 remaining profiles).
var allProfiles = sandbox.getDegreeSearchProfiles_();

Object.keys(allProfiles).forEach(function (key) {
  var profile = allProfiles[key];

  if (profile.specialty_aliases) {
    return;
  }

  var oneHitBlob = String(profile.aliases[0]).toLowerCase();
  var score = sandbox.v2PercentOfCourseMatchScore_(profile.aliases, oneHitBlob);

  assert.ok(
    score >= sandbox.MIN_MATCH_SCORE_PERCENT,
    "degree profile '" + key + "' (" + profile.aliases.length + " aliases) scored " +
      score + " on a genuine 1-term hit, below the " + sandbox.MIN_MATCH_SCORE_PERCENT + "% floor"
  );
});

console.log("OK: every degree profile scores real matches above the floor");

// cs_economics/cs_anthropology are interdisciplinary CS+specialty double
// majors, same as cs_business/cs_criminology/cs_social_sciences, but were
// missing the CS-half USAJOBS OR-query and the interdisciplinary domain-map
// entry those 3 get — meaning a genuine CS-side USAJOBS role never
// searched, and Handshake/github_markdown's economics/anthropology-flavored
// postings got filtered out by the tech-only domain allowlist.
["cs_economics", "cs_anthropology"].forEach(function (profileKey) {
  var profile = allProfiles[profileKey];

  assert.ok(
    profile.usajobs_query_or,
    profileKey + " should have a usajobs_query_or (specialty-half USAJOBS query)"
  );

  assert.strictEqual(
    profile.usajobs_query,
    "software engineer",
    profileKey + "'s usajobs_query should be the CS-half query"
  );

  assert.strictEqual(
    sandbox.INTERDISCIPLINARY_PROFILE_TO_DOMAIN[profileKey] != null,
    true,
    profileKey + " should be wired into INTERDISCIPLINARY_PROFILE_TO_DOMAIN"
  );

  var domain = sandbox.INTERDISCIPLINARY_PROFILE_TO_DOMAIN[profileKey];

  assert.ok(
    Array.isArray(sandbox.INTERDISCIPLINARY_DOMAIN_PHRASES[domain]) &&
      sandbox.INTERDISCIPLINARY_DOMAIN_PHRASES[domain].length > 0,
    "INTERDISCIPLINARY_DOMAIN_PHRASES." + domain + " should be a non-empty phrase list"
  );

  var variants = sandbox.liveAdapterGetUsaJobsQueryVariants_(profileKey.replace("cs_", "cs "));

  assert.strictEqual(variants.length, 2, profileKey + " should issue 2 USAJOBS query variants");
  assert.strictEqual(variants[0], "software engineer", profileKey + "'s first USAJOBS variant should be the CS half");
});

console.log("OK: cs_economics/cs_anthropology have interdisciplinary parity with cs_business/cs_criminology/cs_social_sciences");

// Dual-half 50/50 match_score split for cs_economics/cs_anthropology, same
// math as cs_business/cs_criminology/cs_social_sciences: CS-half-only or
// specialty-half-only should land ~40-50%, both halves ~80-99%.
[
  { profileKey: "cs_economics", csBlob: "software engineer", specialtyBlob: "economist", bothBlob: "software engineer and economist" },
  { profileKey: "cs_anthropology", csBlob: "software engineer", specialtyBlob: "anthropologist", bothBlob: "software engineer and anthropologist" }
].forEach(function (c) {
  function scoreFor(blob) {
    var job = { title: blob, company: "", location: "", source: "", description: "" };
    sandbox.v2RescoreForDegreeProfile_([job], c.profileKey);
    return job.match_score;
  }

  var csOnly = scoreFor(c.csBlob);
  var specialtyOnly = scoreFor(c.specialtyBlob);
  var both = scoreFor(c.bothBlob);

  assert.ok(csOnly >= 40 && csOnly <= 50, c.profileKey + " CS-half-only should land ~40-50%, got " + csOnly);
  assert.ok(specialtyOnly >= 40 && specialtyOnly <= 50, c.profileKey + " specialty-half-only should land ~40-50%, got " + specialtyOnly);
  assert.ok(both >= 80, c.profileKey + " both halves should land ~80-99%, got " + both);
});

console.log("OK: cs_economics/cs_anthropology have the two-half 50/50 match_score split");
