/**
 * Simplify `listings.json` feeds (same URLs for sheet dump + live search JobRow mapping).
 * Use `var` (not const): Apps Script merges all .gs; duplicate const across tabs errors.
 */
var SIMPLIFY_JSON_SOURCES = [
  {
    name: "Simplify New Grad Positions",
    url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json"
  },
  {
    name: "Simplify Summer 2026 Internships",
    url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json"
  }
];

var US_STATE_NAME_TO_USPS = {
  alabama: "al",
  alaska: "ak",
  arizona: "az",
  arkansas: "ar",
  california: "ca",
  colorado: "co",
  connecticut: "ct",
  delaware: "de",
  "district of columbia": "dc",
  florida: "fl",
  georgia: "ga",
  hawaii: "hi",
  idaho: "id",
  illinois: "il",
  indiana: "in",
  iowa: "ia",
  kansas: "ks",
  kentucky: "ky",
  louisiana: "la",
  maine: "me",
  maryland: "md",
  massachusetts: "ma",
  michigan: "mi",
  minnesota: "mn",
  mississippi: "ms",
  missouri: "mo",
  montana: "mt",
  nebraska: "ne",
  nevada: "nv",
  "new hampshire": "nh",
  "new jersey": "nj",
  "new mexico": "nm",
  "new york": "ny",
  "north carolina": "nc",
  "north dakota": "nd",
  ohio: "oh",
  oklahoma: "ok",
  oregon: "or",
  pennsylvania: "pa",
  "rhode island": "ri",
  "south carolina": "sc",
  "south dakota": "sd",
  tennessee: "tn",
  texas: "tx",
  utah: "ut",
  vermont: "vt",
  virginia: "va",
  washington: "wa",
  "west virginia": "wv",
  wisconsin: "wi",
  wyoming: "wy"
};

/**
 * Simplify often uses "IT Security" / "Info Sec" not one word "cybersecurity";
 * "Tampa, FL" not the word "florida".
 */
var SIMPLIFY_QUERY_ALIASES = {
  cybersecurity: [
    "cyber",
    "info sec",
    "infosec",
    "appsec",
    "it security",
    "information security",
    "application security",
    "security eng"
  ],
  infosec: ["cyber", "infosec", "it security", "appsec", "app security"]
};

/**
 * GET `listings.json` every time (no ETag, Script properties, or CacheService for Simplify).
 * @returns {{items:Array|null, error?:string}}
 */
function getSimplifyListingsArrayForUrl_(url) {
  var response = UrlFetchApp.fetch(String(url), {
    method: "get",
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { Accept: "application/json" }
  });
  if (response.getResponseCode() !== 200) {
    return { items: null, error: "HTTP " + response.getResponseCode() };
  }
  var data;
  try {
    data = JSON.parse(response.getContentText());
  } catch (e) {
    return { items: null, error: "Invalid JSON" };
  }
  if (!Array.isArray(data)) {
    return { items: null, error: "Not an array" };
  }
  return { items: data };
}

function fetchJsonJobSources() {
  const results = [];

  for (const source of SIMPLIFY_JSON_SOURCES) {
    const got = getSimplifyListingsArrayForUrl_(source.url);
    if (got && got.items) {
      results.push({
        source: source.name,
        data: got.items
      });
    } else {
      Logger.log("Failed: " + source.name + " (" + ((got && got.error) || "no data") + ")");
    }
  }

  return results;
}

/**
 * Live search: map Simplify JSON → same JobRow shape as USAJOBS in ProvidersLive (result_id, title, location, pay, apply_url, provider, match_score, expiry_at, source).
 * Called from ProvidersLive.gs. Uses simpleMatchScore_ / normalizeHttpsUrl_ (global).
 */
function fetchSimplifyJsonForLiveSearch_(req, limit, expiry) {
  var perFeedCap = Math.min(Math.max((limit || 8) * 25, 50), 400);
  var rows = [];
  var anyOk = false;
  var errMsg = "";

  for (var s = 0; s < SIMPLIFY_JSON_SOURCES.length; s++) {
    var feed = SIMPLIFY_JSON_SOURCES[s];
    try {
      var got = getSimplifyListingsArrayForUrl_(feed.url);
      if (!got || !got.items) {
        if (got && got.error) {
          errMsg = got.error;
        } else {
          errMsg = "no data";
        }
        continue;
      }
      anyOk = true;
      var data = got.items;
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (!item || item.active === false) {
          continue;
        }
        if (!simplifyListingMatchesRequest_(req, item)) {
          continue;
        }
        var row = simplifyListingToJobRow_(item, feed.name, req, expiry);
        if (row) {
          var posted =
            typeof item.date_posted === "number"
              ? item.date_posted
              : typeof item.date_updated === "number"
                ? item.date_updated
                : 0;
          rows.push({ row: row, posted: posted });
        }
      }
    } catch (e) {
      errMsg = e && e.message ? String(e.message) : "fetch failed";
    }
  }

  rows.sort(function (a, b) {
    var d = (b.row.match_score || 0) - (a.row.match_score || 0);
    if (d !== 0) {
      return d;
    }
    return (b.posted || 0) - (a.posted || 0);
  });
  for (var r = 0; r < rows.length; r++) {
    rows[r] = rows[r].row;
  }
  if (rows.length > perFeedCap) {
    rows = rows.slice(0, perFeedCap);
  }

  if (anyOk) {
    return {
      results: rows,
      status: { provider: "github_simplify", mode: "live", success: true }
    };
  }
  return {
    results: [],
    status: {
      provider: "github_simplify",
      mode: "live",
      success: false,
      error: errMsg || "No listings"
    }
  };
}

function simplifyQueryTokensMatchBlob_(qwords, blob) {
  if (!qwords || !qwords.length) {
    return true;
  }
  for (var i = 0; i < qwords.length; i++) {
    var w = qwords[i];
    if (blob.indexOf(w) !== -1) {
      return true;
    }
    if (SIMPLIFY_QUERY_ALIASES && SIMPLIFY_QUERY_ALIASES[w]) {
      var al = SIMPLIFY_QUERY_ALIASES[w];
      for (var j = 0; j < al.length; j++) {
        if (blob.indexOf(String(al[j]).toLowerCase()) !== -1) {
          return true;
        }
      }
    }
  }
  return false;
}

function simplifyLocationMatchesRequest_(locQ, locStr) {
  if (!String(locQ || "").trim()) {
    return true;
  }
  var s = (locStr || "").toLowerCase();
  var l = String(locQ)
    .toLowerCase()
    .trim();
  if (s.indexOf(l) !== -1) {
    return true;
  }
  if (l.indexOf("remote") !== -1) {
    if (s.indexOf("remote") !== -1) {
      return true;
    }
  }
  var abbr = US_STATE_NAME_TO_USPS[l];
  if (abbr) {
    if (s.indexOf(", " + abbr) !== -1) {
      return true;
    }
    if (new RegExp(",\\s*" + abbr + "($|[^a-z0-9])", "i").test(s)) {
      return true;
    }
  }
  if (/^[a-z]{2}$/.test(l)) {
    if (s.indexOf(", " + l) !== -1) {
      return true;
    }
    if (new RegExp(",\\s*" + l + "($|[^a-z0-9])", "i").test(s)) {
      return true;
    }
  }
  return false;
}

function simplifyListingMatchesRequest_(req, item) {
  var q = String((req && req.query_text) || "").trim();
  var locQ = String((req && req.location_text) || "").trim();
  var title = String(item.title || "");
  var company = String(item.company_name || "");
  var locs = item.locations;
  var locStr = Array.isArray(locs) ? locs.join(" ") : String(locs || "");
  var cat = String(item.category || "");
  var blob = (title + " " + company + " " + locStr + " " + cat).toLowerCase();

  var qwords = q
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return w.length > 1;
    });
  if (qwords.length) {
    if (!simplifyQueryTokensMatchBlob_(qwords, blob)) {
      return false;
    }
  }
  if (!simplifyLocationMatchesRequest_(locQ, locStr)) {
    return false;
  }
  return true;
}

function simplifyListingToJobRow_(item, feedName, req, expiry) {
  var title = String(item.title || "").trim();
  var apply = normalizeHttpsUrl_(String(item.url || ""));
  if (!title || !apply) {
    return null;
  }
  var locs = item.locations;
  var location = Array.isArray(locs) ? locs.join("; ") : String(locs || "");
  var company = String(item.company_name || "").trim();
  var sponsor = String(item.sponsorship || "").trim();
  var pay = "";
  if (sponsor && sponsor.toLowerCase().indexOf("sponsorship") !== -1) {
    pay = sponsor;
  }
  var idPart = item.id != null ? String(item.id) : apply + title;
  var resultId = "simplify-" + sha256Hex(idPart).slice(0, 24);
  var sourceLabel = (company ? company + " · " : "") + feedName;
  return {
    result_id: resultId,
    title: title,
    location: location,
    pay: pay,
    apply_url: apply,
    provider: "github_simplify",
    match_score: simpleMatchScore_(req.query_text, title),
    expiry_at: expiry,
    source: sourceLabel
  };
}

var JOB_MARKDOWN_SOURCES = [
  // Jobright
  {
    source: "Jobright H1B Tech Jobs",
    repoType: "jobright",
    category: "h1b",
    url: "https://raw.githubusercontent.com/jobright-ai/Daily-H1B-Jobs-In-Tech/master/README.md"
  },
  {
    source: "Jobright Data Analysis New Grad",
    repoType: "jobright",
    category: "data_analysis_new_grad",
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Data-Analysis-New-Grad/master/README.md"
  },
  {
    source: "Jobright Product Management New Grad",
    repoType: "jobright",
    category: "pm_new_grad",
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Product-Management-New-Grad/master/README.md"
  },
  {
    source: "Jobright Product Management Internship",
    repoType: "jobright",
    category: "pm_internship",
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Product-Management-Internship/master/README.md"
  },
  {
    source: "Jobright Data Analysis Internship",
    repoType: "jobright",
    category: "data_analysis_internship",
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Data-Analysis-Internship/master/README.md"
  },

  // SpeedyApply SWE
  {
    source: "SpeedyApply SWE Internships USA",
    repoType: "speedyapply",
    category: "swe_internship_usa",
    url: "https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/README.md"
  },
  {
    source: "SpeedyApply SWE New Grad USA",
    repoType: "speedyapply",
    category: "swe_new_grad_usa",
    url: "https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/NEW_GRAD_USA.md"
  },
  {
    source: "SpeedyApply SWE Internships International",
    repoType: "speedyapply",
    category: "swe_internship_international",
    url: "https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/INTERN_INTL.md"
  },
  {
    source: "SpeedyApply SWE New Grad International",
    repoType: "speedyapply",
    category: "swe_new_grad_international",
    url: "https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/NEW_GRAD_INTL.md"
  },

  // SpeedyApply AI
  {
    source: "SpeedyApply AI Internships USA",
    repoType: "speedyapply",
    category: "ai_internship_usa",
    url: "https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/README.md"
  },
  {
    source: "SpeedyApply AI New Grad USA",
    repoType: "speedyapply",
    category: "ai_new_grad_usa",
    url: "https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_USA.md"
  },
  {
    source: "SpeedyApply AI Internships International",
    repoType: "speedyapply",
    category: "ai_internship_international",
    url: "https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/INTERN_INTL.md"
  },
  {
    source: "SpeedyApply AI New Grad International",
    repoType: "speedyapply",
    category: "ai_new_grad_international",
    url: "https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_INTL.md"
  }
];

function fetchAndParseAllJobRepos() {
  const allJobs = [];

  for (const source of JOB_MARKDOWN_SOURCES) {
    try {
      const markdown = fetchText(source.url);
      const jobs = parseMarkdownJobTables(markdown, source);

      for (const job of jobs) {
        allJobs.push(job);
      }
    } catch (err) {
      Logger.log("Failed source: " + source.source + " - " + err.message);
    }
  }

  Logger.log("Parsed jobs: " + allJobs.length);
  return allJobs;
}

function fetchText(url) {
  const response = UrlFetchApp.fetch(url, {
    method: "get",
    muteHttpExceptions: true,
    headers: {
      "Accept": "text/plain"
    }
  });

  const status = response.getResponseCode();

  if (status !== 200) {
    throw new Error("HTTP " + status + " for " + url);
  }

  return response.getContentText();
}

function parseMarkdownJobTables(markdown, source) {
  const jobs = [];
  const lines = markdown.split(/\r?\n/);

  let currentSection = "";
  let headers = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("### ")) {
      currentSection = cleanMarkdown(line.replace(/^###\s+/, ""));
      continue;
    }

    if (!line.startsWith("|")) {
      continue;
    }

    const cells = splitMarkdownTableRow(line);

    if (cells.length < 4) {
      continue;
    }

    if (isSeparatorRow(cells)) {
      continue;
    }

    if (looksLikeHeaderRow(cells)) {
      headers = cells.map(function (cell) {
        return normalizeHeader(cell);
      });
      continue;
    }

    if (!headers) {
      continue;
    }

    const rawJob = rowToObject(headers, cells);
    const normalized = normalizeJobRow(rawJob, source, currentSection);

    if (normalized.company || normalized.title || normalized.applyUrl) {
      jobs.push(normalized);
    }
  }

  return jobs;
}

function splitMarkdownTableRow(line) {
  let cleaned = line.trim();

  if (cleaned.startsWith("|")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.endsWith("|")) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned.split("|").map(function (cell) {
    return cell.trim();
  });
}

function isSeparatorRow(cells) {
  return cells.every(function (cell) {
    return /^:?-{3,}:?$/.test(cell.trim());
  });
}

function looksLikeHeaderRow(cells) {
  const joined = cells.join(" ").toLowerCase();

  return (
    joined.indexOf("company") !== -1 &&
    (
      joined.indexOf("position") !== -1 ||
      joined.indexOf("job title") !== -1 ||
      joined.indexOf("title") !== -1
    )
  );
}

function normalizeHeader(header) {
  const h = cleanMarkdown(header).toLowerCase();

  if (h === "company") return "company";
  if (h === "position") return "title";
  if (h === "job title") return "title";
  if (h === "location") return "location";
  if (h === "work model") return "workModel";
  if (h === "date posted") return "datePosted";
  if (h === "posting") return "apply";
  if (h === "link") return "apply";
  if (h === "age") return "age";
  if (h === "salary") return "salary";
  if (h === "level") return "level";
  if (h === "h1b status") return "h1bStatus";

  return h.replace(/[^a-z0-9]+(.)/g, function (_, chr) {
    return chr.toUpperCase();
  });
}

function rowToObject(headers, cells) {
  const obj = {};

  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = cells[i] || "";
  }

  return obj;
}

function normalizeJobRow(raw, source, section) {
  const companyLink = extractFirstMarkdownLink(raw.company || "");
  const titleLink = extractFirstMarkdownLink(raw.title || "");
  const applyLink = extractFirstMarkdownLink(raw.apply || "");

  return {
    source: source.source,
    sourceCategory: source.category,
    repoType: source.repoType,
    section: section,

    company: companyLink.text || cleanMarkdown(raw.company || ""),
    companyUrl: companyLink.url || "",

    title: titleLink.text || cleanMarkdown(raw.title || ""),
    applyUrl: titleLink.url || applyLink.url || "",

    location: cleanMarkdown(raw.location || ""),
    workModel: cleanMarkdown(raw.workModel || ""),
    datePosted: cleanMarkdown(raw.datePosted || ""),
    age: cleanMarkdown(raw.age || ""),
    salary: cleanMarkdown(raw.salary || ""),
    level: cleanMarkdown(raw.level || ""),
    h1bStatus: cleanMarkdown(raw.h1bStatus || ""),

    fetchedAt: new Date().toISOString()
  };
}

function extractFirstMarkdownLink(text) {
  const match = String(text).match(/\[([^\]]+)\]\(([^)]+)\)/);

  if (!match) {
    return {
      text: "",
      url: ""
    };
  }

  return {
    text: cleanMarkdown(match[1]),
    url: match[2]
  };
}

function cleanMarkdown(text) {
  return String(text)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function writeJobsToSheet() {
  const jobs = fetchAndParseAllJobRepos();

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = "GitHub Jobs";
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  sheet.clear();

  const headers = [
    "source",
    "sourceCategory",
    "section",
    "company",
    "title",
    "location",
    "workModel",
    "datePosted",
    "age",
    "salary",
    "level",
    "h1bStatus",
    "applyUrl",
    "companyUrl",
    "fetchedAt"
  ];

  const rows = jobs.map(function (job) {
    return headers.map(function (header) {
      return job[header] || "";
    });
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  sheet.autoResizeColumns(1, headers.length);
}

function testParseMarkdownJobTables() {
  const fakeMarkdown = [
    "### Other",
    "| Company | Position | Location | Posting | Age |",
    "|---|---|---|---|---|",
    "| [Acme](https://example.com) | Backend Intern | Remote | [Apply](https://apply.example.com) | 1d |"
  ].join("\n");

  const jobs = parseMarkdownJobTables(fakeMarkdown, {
    source: "Test Source",
    repoType: "speedyapply",
    category: "test"
  });

  if (jobs.length !== 1) {
    throw new Error("Expected 1 parsed job, got " + jobs.length);
  }

  if (jobs[0].company !== "Acme") {
    throw new Error("Company parse failed");
  }

  if (jobs[0].title !== "Backend Intern") {
    throw new Error("Title parse failed");
  }

  if (jobs[0].applyUrl !== "https://apply.example.com") {
    throw new Error("Apply URL parse failed");
  }

  Logger.log("Functional parser test passed.");
}

function testRejectsNonTableNoise() {
  const fakeMarkdown = [
    "# Heading",
    "This is not a table.",
    "| Just | Two |",
    "|---|---|",
    "| Bad | Row |"
  ].join("\n");

  const jobs = parseMarkdownJobTables(fakeMarkdown, {
    source: "Security Test",
    repoType: "unknown",
    category: "test"
  });

  if (jobs.length !== 0) {
    throw new Error("Parser accepted malformed non-job table.");
  }

  Logger.log("Security/noise parser test passed.");
}