/*
/**
 * Jobs API — Google Apps Script web app.
 *
 * Live-only job search.
 *
 * Providers expected:
 * - runProvidersLiveV2_(req) (defined below; handleJobSearch calls it directly)
 *
 * Sibling files expected:
 * - Config.gs
 * - Util.gs
 * - Validation.gs
 * - JobRanking.gs
 * - UrlUtil.gs
 * - ProvidersLive.gs
 * - github_jobs.gs
 */

/* ============================================================
 * GET helpers
 * ============================================================ */

function getGetQueryStringLength_(e) {
    if (e && e.queryString != null && String(e.queryString).length) {
      return String(e.queryString).length;
    }
  
    var p = (e && e.parameter) || {};
    var n = 0;
  
    for (var k in p) {
      if (Object.prototype.hasOwnProperty.call(p, k)) {
        n +=
          String(k).length +
          1 +
          String(p[k] == null ? "" : p[k]).length +
          1;
      }
    }
  
    return n;
  }
  
  /**
   * JSONP: return callback(payload); as JavaScript when callback name is safe; else JSON.
   */
  function jobSearchGetOutput_(out, callback) {
    var cb = callback == null ? "" : String(callback);
    var payload;
  
    try {
      payload = JSON.stringify(out);
    } catch (se) {
      Logger.log("[SEARCH] jobSearchGetOutput_: JSON.stringify failed: " + (se && se.message));
      throw se;
    }
  
    if (cb && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(cb)) {
      return ContentService.createTextOutput(cb + "(" + payload + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  
    return jsonOut(out);
  }
  
  function doGetJsonpError_(err, callback) {
    Logger.log("[SEARCH] doGetJsonpError_: " + (err && err.message));
  
    var errBody = { error: "Internal error" };
    var m = err && err.message ? String(err.message) : "";
  
    if (m === "Unauthorized") {
      errBody = { error: "Unauthorized" };
    } else if (m === "Rate limit exceeded") {
      errBody = { error: "Rate limit exceeded" };
    } else if (m === "Bad request") {
      errBody = { error: "Bad request" };
    }
  
    return jobSearchGetOutput_(errBody, callback);
  }
  
  /* ============================================================
   * Web handlers
   * ============================================================ */
  
  /**
   * Log-safe summary of a job-search request: never includes api_key (both
   * doGet/doPost payloads carry it in plaintext) and skips full result/description
   * text, so this is cheap to stringify on every request instead of dumping the
   * whole payload.
   */
  function summarizeJobSearchRequestForLog_(payload) {
    payload = payload || {};
  
    return {
      query_text_len: String(payload.query_text || "").length,
      location_text: payload.location_text || "",
      employment_type: payload.employment_type || "",
      search_type: payload.search_type || "",
      remote_mode: payload.remote_mode || "",
      limit_per_provider: payload.limit_per_provider || "",
      has_api_key: !!payload.api_key
    };
  }
  
  function doGet(e) {
    e = e || {};
    e.parameter = e.parameter || {};
  
    var action = String(e.parameter.action || "health").toLowerCase();
    var jsonpCallback = e.parameter.callback;
  
    try {
      if (action === "health") {
        assertGetParamsAllowlisted_(e.parameter, { action: 1 });
  
        Logger.log(
          "health: " +
          JSON.stringify({
            ok: true,
            service: "jobs-api-gas"
          })
        );
  
        return jsonOut({
          ok: true,
          service: "jobs-api-gas"
        });
      }
  
      if (action === "job-search") {
        Logger.log("[SEARCH] doGet:job-search triggered");
  
        assertGetParamsAllowlisted_(e.parameter, GET_JOB_SEARCH_PARAM_ALLOWLIST);
  
        if (getGetQueryStringLength_(e) > MAX_GET_QUERY_STRING_CHARS) {
          Logger.log("[SEARCH] Query string too long");
          return jobSearchGetOutput_({ error: "Bad request" }, jsonpCallback);
        }
  
        checkRateLimit_();
  
        var payload = buildJobSearchPayloadFromGet_(e.parameter);
  
        Logger.log("[SEARCH] Payload: " + JSON.stringify(summarizeJobSearchRequestForLog_(payload)));
  
        assertApiKey(payload);
  
        var out = handleJobSearch(payload);
  
        Logger.log("[SEARCH] handleJobSearch returned " + (out.results ? out.results.length : 0) + " results (cache_hit=" + out.cache_hit + ")");
  
        return jobSearchGetOutput_(out, jsonpCallback);
      }
  
      return jsonOut({ error: "Not found" }, 404);
    } catch (err) {
      Logger.log("[SEARCH] doGet error (action=" + action + "): " + (err && err.message));
  
      if (
        action === "job-search" &&
        jsonpCallback &&
        /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(String(jsonpCallback))
      ) {
        return doGetJsonpError_(err, jsonpCallback);
      }
  
      return jsonOutClientError_(err);
    }
  }
  
  function doPost(e) {
    try {
      e = e || {};
      e.postData = e.postData || {};
  
      var raw = e.postData.contents || "{}";
  
      Logger.log("[SEARCH] doPost received body of length: " + raw.length);
  
      if (raw.length > MAX_POST_BODY_BYTES) {
        Logger.log("[SEARCH] Body too large");
        return jsonOut({ error: "Bad request" });
      }
  
      var body = JSON.parse(raw);
  
      if (body === null || typeof body !== "object" || Array.isArray(body)) {
        Logger.log("[SEARCH] Invalid body format");
        return jsonOut({ error: "Bad request" });
      }
  
      if (Object.keys(body).length > MAX_JSON_KEYS) {
        Logger.log("[SEARCH] Too many keys in body");
        return jsonOut({ error: "Bad request" });
      }
  
      if (body.action === "health") {
        assertOnlyAllowedKeys_(body, ["action"]);
  
        if (String(body.action).toLowerCase() !== "health") {
          return jsonOut({ error: "Bad request" });
        }
  
        return jsonOut({
          ok: true,
          service: "jobs-api-gas"
        });
      }
  
      Logger.log("[SEARCH] doPost:job-search action triggered");
  
      assertOnlyAllowedKeys_(body, JOB_SEARCH_KEYS);
      checkRateLimit_();
      assertApiKey(body);
  
      Logger.log("[SEARCH] Payload: " + JSON.stringify(summarizeJobSearchRequestForLog_(body)));
  
      var out = handleJobSearch(body);
  
      Logger.log("[SEARCH] handleJobSearch returned " + (out.results ? out.results.length : 0) + " results (cache_hit=" + out.cache_hit + ")");
  
      return jsonOut(out);
    } catch (err) {
      Logger.log("[SEARCH] doPost error (isSyntax=" + (err instanceof SyntaxError) + "): " + (err && err.message));
  
      if (err instanceof SyntaxError) {
        return jsonOut({ error: "Bad request" });
      }
  
      return jsonOutClientError_(err);
    }
  }
  
  function buildJobSearchPayloadFromGet_(parameter) {
    parameter = parameter || {};
  
    return {
      query_text: parameter.query_text || '',
      location_text: parameter.location_text || '',
      min_pay: parameter.min_pay ? Number(parameter.min_pay) : undefined,
  
      // Graduation timeline / availability.
      employment_type: parameter.employment_type || undefined,
  
      // Actual internship/job filter.
      search_type: parameter.search_type || undefined,
  
      remote_mode: parameter.remote_mode || undefined,
      limit_per_provider: parameter.limit_per_provider
        ? Number(parameter.limit_per_provider)
        : undefined,
      notes: parameter.notes || undefined,
      authorization: parameter.authorization || undefined,
      api_key: parameter.api_key || undefined
    };
  }
  
  /* ============================================================
   * Main job-search handler
   * ============================================================ */
  
  function handleJobSearch(body) {
    Logger.log("[SEARCH] handleJobSearch started: " + JSON.stringify(summarizeJobSearchRequestForLog_(body)));
  
    var validation = validateJobSearchRequest(body);
  
    if (!validation || !validation.ok) {
      Logger.log("[SEARCH] Validation failed: " + (validation && validation.error));
  
      return {
        request_id: Utilities.getUuid(),
        cache_hit: false,
        results: [],
        provider_status: [],
        error: validation && validation.error ? validation.error : "Bad request"
      };
    }
  
    var req = validation.value;
    req.search_type = normalizeJobSearchType_(body.search_type);
    var requestId = Utilities.getUuid();
  
    Logger.log("[SEARCH] Validated request: " + JSON.stringify(req));
  
    var cache = CacheService.getScriptCache();
    var queryKey = makeJobSearchCacheKey_(req);
  
    var cachedRaw = cache.get(queryKey);
  
    Logger.log(
      "[SEARCH] Cache lookup with key: " +
      queryKey +
      ", found: " +
      (cachedRaw ? "yes" : "no")
    );
  
    if (cachedRaw) {
      var cached;
      var cacheUsable = false;
  
      try {
        cached = JSON.parse(cachedRaw);
  
        if (isUsableJobSearchCachePayload_(cached)) {
          cacheUsable = true;
          Logger.log("[SEARCH] Cache parsed: " + cached.results.length + " results");
        } else {
          Logger.log("[SEARCH] Cache ignored; proceeding to live providers");
        }
      } catch (pe) {
        Logger.log("[SEARCH] Cache parse failed, falling through to live fetch: " + (pe && pe.message));
      }
  
      if (cacheUsable) {
        Logger.log("[SEARCH] Returning cached results");
  
        return {
          request_id: requestId,
          cache_hit: true,
          results: cached.results,
          provider_status: cached.provider_status || []
        };
      }
    }
  
    Logger.log("[SEARCH] Cache miss, proceeding to live providers");
  
    var providerOut = runProvidersLiveV2_(req);
    providerOut = normalizeJobSearchProviderOut_(providerOut);
  
    Logger.log(
      "[SEARCH] providers returned " + providerOut.results.length + " results: " +
      JSON.stringify(providerOut.provider_status)
    );
  
    var ranked = rankAndCapResults(providerOut.results, req.limit_per_provider);
  
    Logger.log("[SEARCH] Ranked to " + ranked.length + " results");
  
    var payloadToCache = {
      results: ranked,
      provider_status: providerOut.provider_status
    };
  
    if (shouldCacheJobSearchPayload_(payloadToCache)) {
      var payloadStr = JSON.stringify(payloadToCache);
      var maxV =
        typeof MAX_SCRIPT_CACHE_VALUE_BYTES === "number"
          ? MAX_SCRIPT_CACHE_VALUE_BYTES
          : 100 * 1024;
  
      if (payloadStr.length > maxV) {
        Logger.log("[SEARCH] Skipped cache write: payload too large (" + payloadStr.length + " > " + maxV + " bytes)");
      } else {
        try {
          cache.put(queryKey, payloadStr, getJobSearchCacheSeconds_());
          Logger.log("[SEARCH] Cached non-empty live results successfully");
        } catch (ce) {
          Logger.log("[SEARCH] cache.put failed, continuing without cache: " + (ce && ce.message));
        }
      }
    } else {
      Logger.log(
        "[SEARCH] Skipped cache write because results were empty or provider set was incomplete"
      );
    }
  
    var finalOut = {
      request_id: requestId,
      cache_hit: false,
      results: ranked,
      provider_status: providerOut.provider_status
    };
  
    Logger.log("[SEARCH] Returning " + finalOut.results.length + " results (cache_hit=false)");
  
    return finalOut;
  }
  
  /* ============================================================
   * Cache helpers
   * ============================================================ */
  
  function makeJobSearchCacheKey_(req) {
    return (
      'query:' +
      getJobSearchCacheVersion_() +
      ':' +
      sha256Hex(
        stableStringifyForCache_({
          query_text: String(req.query_text || '').toLowerCase(),
          location_text: String(req.location_text || '').toLowerCase(),
          min_pay: req.min_pay != null ? req.min_pay : null,
          employment_type: req.employment_type != null ? req.employment_type : null,
          search_type: req.search_type != null ? req.search_type : null,
          remote_mode: req.remote_mode != null ? req.remote_mode : null,
          notes: req.notes != null ? req.notes : null,
          authorization: req.authorization != null ? req.authorization : null,
          limit_per_provider:
            req.limit_per_provider != null ? req.limit_per_provider : 8
        })
      )
    );
  }
  
  function getJobSearchCacheVersion_() {
    /*
     * v4 because earlier v1/v2/v3 cache entries may contain empty or mock-ish results.
     * v6 because v5 entries can contain sub-30% matches cached before the
     * MIN_MATCH_SCORE_PERCENT floor and the shelter/"elt" relevance false-positive
     * were fixed.
     * v7 because v6 entries predate two changes: (a) usajobs/github_markdown/
     * handshake_rss switched from a raw token-hit-count match_score (max ~10 for
     * a single-token query) to a 0-100 percentage, so the v6 floor was silently
     * dropping most of their results; (b) the cybersecurity_jobs_sheet provider
     * didn't exist yet.
     * v8 because v7 entries predate: (a) the domain-relevance filter now also
     * runs on github_markdown (was Handshake-only — "Jobright H1B Tech Jobs"
     * turned out to include non-tech roles like "Life Sciences Creative
     * Director" and "Structural Engineer"); (b) new-grad searches now drop
     * clearly senior/leadership titles (Director, VP, Principal, Manager, ...).
     * v9 because v8 entries predate the professorship/faculty gate — those
     * titles require a terminal degree and now only show up when the search
     * itself is PhD-level (phd/doctorate/doctoral in the query text).
     * v10 because v9 entries predate degree-level-aware seniority filtering —
     * bachelor's-level new-grad searches now also drop plain "Senior"/"Sr"/
     * "Lead" titles (previously only Director/VP/Principal/Manager were cut),
     * while MS/PhD-level searches still allow them.
     * v11 because v10 entries predate postdoc coverage in the professorship
     * gate — "Postdoctoral Scholar"/"Postdoc"/"Post-Doc" titles now require a
     * PhD-level query too, same as Professor/Faculty.
     * v12 because v11 entries predate the cs_business/cs_criminology/
     * cs_social_sciences provider_query fix — those interdisciplinary
     * profiles now include the full core CS/software vocabulary (previously
     * cs_criminology had none at all, and the other two only had a single
     * loose "software engineer" token), so a BSCS + <specialty> search
     * returns both general CS roles and the specialty-area roles.
     * v13 because v12 entries predate "primarily <specialty>" job coverage for
     * cs_business/cs_criminology/cs_social_sciences: (a) their provider_query/
     * aliases/usajobs_query now also include pure-specialty terms (e.g.
     * "criminal justice", "business operations", "social worker"), not just
     * the tech-hybrid ones; (b) the Handshake/github_markdown relevance filter
     * now request-scopes in that specialty as an extra allowed domain for
     * these 3 searches only; (c) fixed a bare "office" exclude phrase that was
     * silently matching "Officer" (Probation Officer, Police Officer, ...) and
     * canceling out the new criminology domain score.
     * v14 because v13 entries predate a USAJOBS query-routing fix: USAJOBS
     * was being sent req.query_text (the FULLY EXPANDED provider_query — 20+
     * words for the interdisciplinary profiles) as one literal Keyword
     * string instead of the short curated usajobs_query, which is almost
     * certainly why those searches were returning nothing. Also removed a
     * dead duplicate liveAdapterNormalizeUsaJobsQuery_ that was shadowing the
     * real one. cs_business/cs_criminology/cs_social_sciences now issue TWO
     * independent short USAJOBS queries (CS half + specialty half, e.g.
     * "software engineer" and "business analyst") and merge the results,
     * guaranteeing OR semantics instead of trusting a single multi-word
     * Keyword string to behave as OR on USAJOBS's end.
     * v15 because v14 entries predate interdisciplinary match_score rework:
     * cs_business/cs_criminology/cs_social_sciences results are now rescored
     * as two independent halves (CS core + specialty), each worth up to 50
     * points, instead of one flat ratio over the combined vocabulary — a job
     * matching only one half now lands ~40-50%, matching both lands ~80-99%.
     * v16 because v15 entries predate the "bscsc" label fix — the frontend
     * sends "bscsc" as the short code for BSCS + Criminology (matching the
     * bscp/bscse/bsai/bscys/bsit short-code convention), which didn't match
     * any cs_criminology label, so the whole degree-profile system (query
     * expansion, interdisciplinary domain detection, USAJOBS OR-merge,
     * two-half scoring) was silently never activating for that search.
     * v17 because v16 entries predate the "bscsb" (BSCS + Business) and
     * "bscsiss" (BSCS + Interdisciplinary Social Sciences) label additions —
     * same missing-short-code issue as bscsc, now fixed for all 3.
     * v18 because v17 entries predate two fixes: (a) jobs.html was sending
     * LIGHTCAST_DEGREE_CONFIGS' human-readable label (e.g. "BS Computer
     * Science", "MS Cybersecurity") as query_text instead of the short code
     * (e.g. "bscs", "mscys") every profile's labels list actually expects —
     * since normalizeProgramQueryForProviders_/v2GetDegreeLevelFromQuery_
     * require an exact normalized match, this meant NO degree (not just the
     * interdisciplinary ones) was ever hitting its curated provider_query,
     * usajobs_query, or degree-level detection; master's searches were
     * silently defaulting to "bachelors" seniority filtering. jobs.html now
     * sends the short code. (b) normalizeProgramQueryForProviders_'s
     * substring-substitution fallback (for when skills text is appended
     * after the code) had no rule for bscsb/bscsc/bscsiss, so those 3 still
     * failed to expand whenever the skills field was non-empty — added.
     * v19 because v18 entries predate two USAJOBS scoring fixes: (a) USAJOBS
     * rows never captured any duties/summary text (MatchedObjectDescriptor
     * only has title/org/location) — v2RescoreForInterdisciplinaryDomain_ and
     * liveAdapterSimpleMatchScore_ could only ever see the bare job title, so
     * e.g. a federal "Management Analyst" posting whose DUTIES describe
     * exactly the cs_business specialty (data collection, SQL, reporting)
     * scored ~40% because only the title contributed. Now captures
     * UserArea.Details.JobSummary/MajorDuties + QualificationSummary into
     * job.description and feeds it into both scorers. (b) cs_business's
     * specialty_aliases (and the shared bscs core aliases used as the CS-half
     * term set for all 3 interdisciplinary profiles) didn't include common
     * data/quantitative-duty vocabulary (sql, database, data analysis/
     * collection, statistical/quantitative analysis, reporting, dashboards) —
     * added, so duty text using this language now contributes to both halves
     * instead of only exact job-title phrases like "management analyst"
     * counting.
     * v20 because v19 entries predate two location-filtering fixes: (a) USAJOBS
     * results had no post-fetch location check at all — every other provider
     * re-verifies location_text against the job's own location string, but
     * USAJOBS just trusted its LocationName query param, which is a soft hint
     * upstream (not a hard filter) and returns "Multiple Locations" with no
     * state info for many multi-site postings — wrong-state rows (e.g. Arizona
     * for a Florida search) had nothing to catch them. Now checks
     * PositionLocationDisplay + each PositionLocation duty station. (b)
     * liveAdapterLocationMatchesRequest_ (shared by every provider) couldn't
     * parse the compound "City, State" values jobs.html's location dropdown
     * actually sends (e.g. "Tampa, Florida") — it only recognized a bare state
     * name or 2-letter code, so it looked for the literal substring
     * "tampa, florida" in job locations, which real listings never spell out
     * that way ("Tampa, FL" instead). City-level location picks were likely
     * broken for every provider, not just USAJOBS. Now splits city/state and
     * checks each independently.
     * v21 because v20 entries predate a provider filtering-parity audit: (a)
     * github_simplify had its own separate simplifyLocationMatchesRequest_
     * with the identical "can't parse compound City, State queries" bug —
     * removed the duplicate, now shares the one fixed liveAdapterLocationMatchesRequest_.
     * (b) handshake_rss had NO query_text or location_text filtering at all —
     * it just took the first `limit` RSS items in feed order and relied
     * entirely on the downstream domain allowlist (which checks broad domain,
     * not the actual query) to weed things out. Now runs the same
     * liveAdapterQueryMatchesBlob_/liveAdapterLocationMatchesRequest_ checks
     * every other provider already had, against title/company/description
     * text (handshakeParseTitle_ still doesn't extract a real location field,
     * so the location check is best-effort against incidental text until the
     * feed's actual field layout is confirmed via debugDumpHandshakeRssFirstItem_).
     * v22 because v21 entries predate two more fixes: (a) cybersecurity_jobs_sheet
     * now requires genuine criminology/digital-forensics signal (not just plain
     * "cybersecurity") before contributing to a cs_criminology search — see
     * v2FilterCybersecuritySheetForCriminology_. (b) fetchUsaJobsJobs_ and all
     * 3 github_markdown fetch paths (sheet-cache/full-refresh/live-filtered)
     * plus cybersecurity_jobs_sheet were trimming to perProviderCap/perPage
     * using each provider's own pre-rescore baseline match_score, BEFORE
     * v2RescoreForInterdisciplinaryDomain_ (and, for the cybersecurity sheet,
     * the new criminology filter) ever ran on the full merged list — a genuine
     * dual-half match for cs_business/cs_criminology/cs_social_sciences could
     * get discarded here in favor of a weaker single-half match, permanently,
     * before the correct score was ever computed. Removed all 4 premature
     * trims; the final rankAndCapResults in handleJobSearch already caps
     * per-provider using the real, fully-rescored/filtered match_score.
     * v23 because v22 entries predate a baseline-scorer rewrite: all 3 copies
     * of the "simple" match scorer (liveAdapterSimpleMatchScore_ for usajobs/
     * cybersecurity_jobs_sheet/github_markdown, v2SimpleMatchScore_ as
     * handshake_rss's only scorer and the catch-all backstop, simpleMatchScore_
     * for github_simplify) split the curated query into bare single words
     * ("engineer", "engineering", "systems", "computer", ...) instead of
     * matching known multi-word phrases — so ANY "<Discipline> Engineer"
     * posting (Civil Engineer, Electronics Engineer, USAJOBS's catch-all
     * "General Engineer" series, none of them CS/CE-relevant) scored ~75% off
     * generic engineering words alone, on top of a 50-point floor that let
     * even a zero-relevance result survive by default. All 3 now score against
     * liveAdapterGetAllKnownJobPhrases_ (TECH_DOMAIN_PHRASES + every degree
     * profile's aliases/specialty_aliases) and use a 10-99 range instead of a
     * 50-99 floor, so a genuine non-match lands under rankAndCapResults' 30%
     * cutoff and gets dropped instead of defaulting to a coin-flip score.
     * v24 because v23 entries predate widening the professorship/postdoc
     * PhD gate (v2FilterJobsByProfessorshipRequiresPhD_) to also drop any
     * title that explicitly says "PhD"/"doctorate"/"doctoral" outside of a
     * professor/faculty/postdoc title — e.g. "Data Scientist, Core Data -
     * PhD" was leaking through to bachelor's-level searches (bscsb, etc.)
     * because it isn't a professorship/postdoc title and doesn't match any
     * senior/leadership title regex either.
     * v25 because v24 entries predate generalizing "percentage of course"
     * rescoring (formerly v2RescoreForInterdisciplinaryDomain_, now
     * v2RescoreForDegreeProfile_) from the 3 BSCS interdisciplinary
     * double-majors to all 18 degree profiles. Every profile's match_score
     * across all 5 providers (including cybersecurity_jobs_sheet and
     * github_markdown, the "CybersecurityJobs"/"GitHub Jobs" sheets) is now
     * scored against that specific degree's own curated `aliases` via
     * v2PercentOfCourseMatchScore_, instead of the shared global phrase pool
     * every provider's baseline score came from — a bscp/bsit/etc. search
     * previously scored jobs against every degree's vocabulary combined, not
     * its own.
     * v26 because v25 entries predate three fixes: (a)
     * v2PercentOfCourseMatchScore_ (added in v25) computed a literal
     * hits/courseTerms.length percentage — since most alias lists are mostly
     * synonyms for one role concept, a real match against just 1-2 terms in
     * a 10+ term list (e.g. "sql" + "developer") scored as low as 24%,
     * under the 30% floor, silently dropping genuinely relevant jobs; now
     * delegates to v2TermMatchStrength_'s hit-based curve instead (1 term
     * hit ~81%, 2+ hits ~99%), same fix already applied to the
     * interdisciplinary specialty-half scorer. (b) rankAndCapResults now
     * falls back to a provider's pre-rescore ranking instead of dropping it
     * to 0 results when every one of its rows happens to land under the 30%
     * floor after a degree-profile rescore. (c) cs_economics/cs_anthropology
     * — interdisciplinary CS+specialty double-majors like cs_business/
     * cs_criminology/cs_social_sciences, but previously missing everything
     * those 3 get — now have a usajobs_query_or (CS-half USAJOBS query;
     * previously only ever searched the specialty term), an
     * INTERDISCIPLINARY_PROFILE_TO_DOMAIN entry (so Handshake/
     * github_markdown's economics/anthropology-flavored postings survive
     * the tech-only domain allowlist), and specialty_aliases for the same
     * two-half 50/50 match_score split as the original 3.
     */
    return "v26-course-match-strength-and-interdisciplinary-parity";
  }
  
  function getJobSearchCacheSeconds_() {
    if (typeof QUERY_CACHE_TTL_SEC === "number") {
      return QUERY_CACHE_TTL_SEC;
    }
  
    if (typeof CACHE_SECONDS === "number") {
      return CACHE_SECONDS;
    }
  
    return 60 * 15;
  }
  
  function isUsableJobSearchCachePayload_(cached) {
    if (!cached || !Array.isArray(cached.results)) {
      Logger.log("[SEARCH] Cache rejected: missing valid results array");
      return false;
    }
  
    if (!Array.isArray(cached.provider_status)) {
      Logger.log("[SEARCH] Cache rejected: missing provider_status array");
      return false;
    }
  
    if (cached.results.length === 0) {
      Logger.log("[SEARCH] Cache rejected: empty result set");
      return false;
    }
  
    if (!cacheProviderStatusHasProvider_(cached.provider_status, "github_markdown")) {
      Logger.log("[SEARCH] Cache rejected: missing github_markdown provider");
      return false;
    }
  
    return true;
  }
  
  function shouldCacheJobSearchPayload_(payload) {
    if (!payload || !Array.isArray(payload.results) || payload.results.length === 0) {
      return false;
    }
  
    if (!Array.isArray(payload.provider_status)) {
      return false;
    }
  
    /*
     * Require github_markdown so stale two-provider payloads do not get cached.
     */
    if (!cacheProviderStatusHasProvider_(payload.provider_status, "github_markdown")) {
      return false;
    }
  
    return true;
  }
  
  function cacheProviderStatusHasProvider_(providerStatus, providerName) {
    providerStatus = Array.isArray(providerStatus) ? providerStatus : [];
  
    for (var i = 0; i < providerStatus.length; i++) {
      if (providerStatus[i] && providerStatus[i].provider === providerName) {
        return true;
      }
    }
  
    return false;
  }
  
  function stableStringifyForCache_(value) {
    return JSON.stringify(sortObjectKeysDeep_(value));
  }
  
  function sortObjectKeysDeep_(value) {
    if (Array.isArray(value)) {
      return value.map(function (item) {
        return sortObjectKeysDeep_(item);
      });
    }
  
    if (value && typeof value === "object") {
      var out = {};
      var keys = Object.keys(value).sort();
  
      for (var i = 0; i < keys.length; i++) {
        out[keys[i]] = sortObjectKeysDeep_(value[keys[i]]);
      }
  
      return out;
    }
  
    return value;
  }
  
  /* ============================================================
   * Provider/ranking normalization
   * ============================================================ */
  
  function normalizeJobSearchProviderOut_(providerOut) {
    providerOut = providerOut || {};
  
    return {
      results: Array.isArray(providerOut.results) ? providerOut.results : [],
      provider_status: Array.isArray(providerOut.provider_status)
        ? providerOut.provider_status
        : []
    };
  }
  
  /* ============================================================
   * Debug helpers
   * ============================================================ */
  
  function debugLogLiveSearchNewGrad() {
    var params = {
      action: "job-search",
      query_text: "bscs",
      location_text: "United States",
      employment_type: "Already Graduated",
      limit_per_provider: "20",
      authorization: "US citizen / permanent resident"
    };
  
    var fakeEvent = buildFakeGetEvent_(params);
    var output = doGet(fakeEvent);
  
    if (output && typeof output.getContent === "function") {
      Logger.log(output.getContent());
    } else {
      Logger.log(output);
    }
  }
  
  function debugLogLiveSearchInternship() {
    var params = {
      action: "job-search",
      query_text: "software engineering internship",
      location_text: "United States",
      employment_type: "Summer 2026",
      limit_per_provider: "20",
      authorization: "US citizen / permanent resident"
    };
  
    var fakeEvent = buildFakeGetEvent_(params);
    var output = doGet(fakeEvent);
  
    if (output && typeof output.getContent === "function") {
      Logger.log(output.getContent());
    } else {
      Logger.log(output);
    }
  }
  
  function buildFakeGetEvent_(params) {
    params = params || {};
  
    return {
      parameter: params,
      parameters: Object.keys(params).reduce(function (acc, key) {
        acc[key] = [String(params[key])];
        return acc;
      }, {}),
      queryString: Object.keys(params)
        .map(function (key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key]));
        })
        .join("&")
    };
  }
  
  function normalizeJobSearchType_(value) {
    var v = String(value || 'any').toLowerCase().trim();
  
    if (v === 'internship' || v === 'intern' || v === 'internships') {
      return 'internship';
    }
  
    if (
      v === 'job' ||
      v === 'jobs' ||
      v === 'fulltime' ||
      v === 'full-time' ||
      v === 'full_time' ||
      v === 'entry' ||
      v === 'entry-level' ||
      v === 'entry_level'
    ) {
      return 'job';
    }
  
    return 'any';
  }
  
  /**
   * Shared limits and allowlists for job-search requests.
   * Loaded with other .gs files into one Apps Script project (single global scope).
   */
  
  /** Shared workbook: "GitHub Jobs" (writeJobsToSheet), "CybersecurityJobs" (external crawler of jobs.cybersecurityjobs.com, read by fetchCybersecurityJobsSheetForLiveSearch_), "CrawlerLogs". */
  var JOBS_SPREADSHEET_ID = "1SxsNMdKbYSugEinu8GfXjykj-m89FJ6HHJIFuF6g9gw";
  
  var GITHUB_JOBS_SHEET_NAME = "GitHub Jobs";
  var GITHUB_JOBS_SHEET_HEADERS = [
    "source", "sourceCategory", "section", "company", "title", "location",
    "workModel", "datePosted", "age", "salary", "level", "h1bStatus",
    "applyUrl", "companyUrl", "fetchedAt"
  ];
  /**
   * How long a "GitHub Jobs" sheet snapshot is trusted before a live search
   * falls back to re-scraping GitHub. installGithubJobsScrapeTriggers_()
   * schedules writes ~8h apart, so 6h keeps most searches on the fast sheet
   * read while still catching one missed trigger before staleness sets in.
   */
  var GITHUB_JOBS_SHEET_TTL_MINUTES = 360;
  
  var CRAWLER_LOGS_SHEET_NAME = "CrawlerLogs";
  
  var QUERY_CACHE_TTL_SEC = 6 * 60 * 60; // Script cache max 21600
  /** CacheService.put value limit is ~100KB; larger payloads must not be stored or put throws. */
  var MAX_SCRIPT_CACHE_VALUE_BYTES = 100 * 1024;
  var MAX_LIMIT_PER_PROVIDER = 20;
  var MAX_POST_BODY_BYTES = 32768;
  /** Reject GET job-search when query string exceeds this (URL + proxy limits; JSONP uses long query strings). */
  var MAX_GET_QUERY_STRING_CHARS = 7168;
  var MAX_JSON_KEYS = 24;
  
  /** Job-search: only these keys allowed (strict). Matches jobs_page fetch body + api_key + min_pay. */
  var JOB_SEARCH_KEYS = [
    'action',
    'query_text',
    'location_text',
    'min_pay',
    'employment_type',
    'search_type',
    'remote_mode',
    'limit_per_provider',
    'notes',
    'authorization',
    'api_key'
  ];
  
  var MAX_LEN = {
    query_text: 512,
    location_text: 200,
    employment_type: 120,
    remote_mode: 80,
    notes: 2000,
    authorization: 120,
    api_key: 512
  };
  
  var GET_JOB_SEARCH_PARAM_ALLOWLIST = {
    action: 1,
    callback: 1,
    query_text: 1,
    location_text: 1,
    min_pay: 1,
    employment_type: 1,
    search_type: 1,
    remote_mode: 1,
    limit_per_provider: 1,
    notes: 1,
    authorization: 1,
    api_key: 1
  };
  
  
  /**
   * Manual test: run from the Apps Script editor (select function → Run).
   * View output: View → Logs, or Executions → click the run → Logs.
   *
   * Exercises the same live path as the web app: USAJOBS + Simplify (GitHub JSON),
   * then dedupeAndRankJobs_ + rankAndCapResults.
   *
   * Script properties: USAJOBS_API_KEY, USAJOBS_USER_AGENT (USAJOBS only; Simplify is public).
   */
  function debugProviderSymbols() {
    var symbols = {
      runProvidersLiveV2_: typeof runProvidersLiveV2_,
      fetchUsaJobsJobs_: typeof fetchUsaJobsJobs_,
      fetchSimplifyJsonForLiveSearch_: typeof fetchSimplifyJsonForLiveSearch_,
      fetchGithubMarkdownJobsForLiveSearch_: typeof fetchGithubMarkdownJobsForLiveSearch_,
      fetchCybersecurityJobsSheetForLiveSearch_: typeof fetchCybersecurityJobsSheetForLiveSearch_,
      JOB_MARKDOWN_SOURCES: typeof JOB_MARKDOWN_SOURCES
    };
  
    Logger.log("[PROVIDER_SYMBOLS] " + JSON.stringify(symbols, null, 2));
  }
  
  function debugLogLiveSearch() {
  
    const params = {
      action: "job-search",
      query_text: "software engineer",
      location_text: "United States",
      employment_type: "Any",
      limit_per_provider: "20",
      authorization: "US citizen / permanent resident"
    };
  
  
    const fakeEvent = buildFakeGetEvent_(params);
    const output = doGet(fakeEvent);
  
    // If jsonOut/jobSearchGetOutput_ returns ContentService TextOutput,
    // getContent() makes the logged result readable.
    if (output && typeof output.getContent === "function") {
      Logger.log(output.getContent());
    } else {
      Logger.log(output);
    }
  }
  function buildFakeGetEvent_(params) {
    return {
      parameter: params,
      parameters: Object.keys(params).reduce(function (acc, key) {
        acc[key] = [String(params[key])];
        return acc;
      }, {}),
      queryString: Object.keys(params)
        .map(function (key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key]));
        })
        .join("&")
    };
  }
  
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
    // Shared with github_markdown/cybersecurity_jobs_sheet/usajobs instead of a
    // second copy — this provider used to have its own simplifyLocationMatchesRequest_
    // with the same "can't parse compound City, State queries" bug that
    // liveAdapterLocationMatchesRequest_ had before it was fixed.
    if (!liveAdapterLocationMatchesRequest_(locQ, locStr)) {
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
  
  /**
   * Scheduled entry point (see installGithubJobsScrapeTriggers_) and the
   * manual "run from the editor" refresh. Shares writeGithubJobsToSheet_ with
   * the opportunistic cache-miss refresh in fetchGithubMarkdownJobsForLiveSearch_
   * so both paths write the sheet the same way.
   */
  function writeJobsToSheet() {
    var startedAt = Date.now();
    var jobs = fetchAndParseAllJobRepos();
  
    writeGithubJobsToSheet_(jobs);
  
    logToCrawlerLogsSheet_("INFO", "github_markdown sheet refreshed (scheduled)", {
      job_count: jobs.length,
      duration_ms: Date.now() - startedAt
    });
  }
  
  function writeGithubJobsToSheet_(jobs) {
    jobs = Array.isArray(jobs) ? jobs : [];
  
    var spreadsheet = SpreadsheetApp.openById(JOBS_SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(GITHUB_JOBS_SHEET_NAME);
  
    if (!sheet) {
      sheet = spreadsheet.insertSheet(GITHUB_JOBS_SHEET_NAME);
    }
  
    sheet.clear();
  
    var rows = jobs.map(function (job) {
      return GITHUB_JOBS_SHEET_HEADERS.map(function (header) {
        return job[header] || "";
      });
    });
  
    sheet.getRange(1, 1, 1, GITHUB_JOBS_SHEET_HEADERS.length).setValues([GITHUB_JOBS_SHEET_HEADERS]);
  
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, GITHUB_JOBS_SHEET_HEADERS.length).setValues(rows);
    }
  
    sheet.autoResizeColumns(1, GITHUB_JOBS_SHEET_HEADERS.length);
  }
  
  /**
   * Appends {Timestamp, Level, Message, Data} to the "CrawlerLogs" sheet so
   * cache staleness/health is visible without digging through execution logs.
   * Never throws — a logging failure must not break the caller.
   */
  function logToCrawlerLogsSheet_(level, message, data) {
    try {
      var spreadsheet = SpreadsheetApp.openById(JOBS_SPREADSHEET_ID);
      var sheet = spreadsheet.getSheetByName(CRAWLER_LOGS_SHEET_NAME);
  
      if (!sheet) {
        sheet = spreadsheet.insertSheet(CRAWLER_LOGS_SHEET_NAME);
        sheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "Level", "Message", "Data"]]);
      }
  
      sheet.appendRow([
        new Date().toISOString(),
        String(level || "INFO"),
        String(message || ""),
        data == null ? "" : JSON.stringify(data)
      ]);
    } catch (err) {
      Logger.log("[CRAWLER_LOGS] failed to write: " + (err && err.message));
    }
  }
  
  /**
   * One-time setup: run this once from the Apps Script editor (select
   * installGithubJobsScrapeTriggers_ -> Run) to schedule writeJobsToSheet a
   * few times a day, so the "GitHub Jobs" sheet cache (see
   * fetchGithubMarkdownJobsForLiveSearch_) rarely goes stale on its own —
   * the opportunistic live-refresh fallback still covers any gap if a
   * trigger run fails or this hasn't been installed yet.
   *
   * Safe to re-run: it clears any existing writeJobsToSheet triggers first,
   * so it won't pile up duplicates. Adjust GITHUB_JOBS_SCRAPE_HOURS below to
   * change the schedule, then re-run this function.
   */
  var GITHUB_JOBS_SCRAPE_HOURS = [6, 14, 22];
  
  function installGithubJobsScrapeTriggers_() {
    var existing = ScriptApp.getProjectTriggers();
    var removed = 0;
  
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].getHandlerFunction() === "writeJobsToSheet") {
        ScriptApp.deleteTrigger(existing[i]);
        removed++;
      }
    }
  
    for (var h = 0; h < GITHUB_JOBS_SCRAPE_HOURS.length; h++) {
      ScriptApp.newTrigger("writeJobsToSheet")
        .timeBased()
        .atHour(GITHUB_JOBS_SCRAPE_HOURS[h])
        .everyDays(1)
        .create();
    }
  
    Logger.log(
      "[TRIGGERS] Removed " + removed + " old writeJobsToSheet trigger(s); installed " +
      GITHUB_JOBS_SCRAPE_HOURS.length + " daily trigger(s) at hours: " + GITHUB_JOBS_SCRAPE_HOURS.join(", ")
    );
  }
  
  function uninstallGithubJobsScrapeTriggers_() {
    var existing = ScriptApp.getProjectTriggers();
    var removed = 0;
  
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].getHandlerFunction() === "writeJobsToSheet") {
        ScriptApp.deleteTrigger(existing[i]);
        removed++;
      }
    }
  
    Logger.log("[TRIGGERS] Removed " + removed + " writeJobsToSheet trigger(s)");
  }
  
  /**
   * JobRelevanceFilter.gs
   *
   * Domain relevance + quality filtering for normalized job objects.
   *
   * Built for a software / data / security / infra job board. The Handshake
   * USF feed is mostly noise for that audience (sales SDR spam, unpaid
   * "fellowships", $7/hr AI-labeling gigs, MLM, manual labor), so this layer:
   *
   *   1. Classifies each job into a domain (software, data, security, infra,
   *      ai_ml, sales, marketing, recruiting, ops_admin, manual, gig_labeling).
   *   2. Flags quality problems (unpaid, equity-only, commission-only,
   *      piecework pay, apply-by-personal-email, MLM language).
   *   3. Computes a relevance score and a keep/drop decision against an
   *      allowed-domain set + quality gate.
   *
   * Provider-agnostic: operates on { title, company, description, ... }.
   *
   * Tune everything via JOB_FILTER_CONFIG below.
   */
  
  var JOB_FILTER_CONFIG = {
    // Domains you want to surface. Anything classified outside this set is dropped
    // (unless allow_unknown is true and the job has no strong exclude signal).
    allowed_domains: ["software", "data", "security", "infra", "ai_ml"],
  
    allow_unknown: false,
  
    // Title hits are worth more than description hits.
    title_weight: 4,
    desc_weight: 1,
  
    // Minimum net (tech - exclude) score to keep a job.
    min_score: 3,
  
    // Hard-drop any job with one of these quality flags, regardless of score.
    hard_drop_flags: [
      "commission_only",
      "mlm",
      "piecework_low_pay",
      "unpaid_with_equity_bait"
    ],
  
    // Soft penalty per remaining quality flag (subtracted from score).
    soft_flag_penalty: 3
  };
  
  /* ============================================================
   * Keyword tables
   * Multi-word phrases are matched with indexOf (substring).
   * Ambiguous short tokens use word-boundary regex (see TECH_REGEX).
   * ============================================================ */
  
  var TECH_DOMAIN_PHRASES = {
    software: [
      "software engineer", "software engineering", "software developer",
      "full stack", "full-stack", "fullstack", "frontend", "front-end",
      "front end", "backend", "back-end", "back end", "web developer",
      "web development", "application developer", "mobile developer",
      "ios developer", "android developer", "spring boot", "react",
      "angular", "node.js", "nodejs", "typescript", ".net", "c#",
      "java developer", "python developer", "embedded"
    ],
    data: [
      "data engineer", "data engineering", "data analyst", "data scientist",
      "data science", "analytics engineer", "business intelligence",
      "bi developer", "power bi", "tableau", "data pipeline",
      "database administrator", "data warehouse", "snowflake", "bigquery"
    ],
    security: [
      "cybersecurity", "cyber security", "security analyst", "security engineer",
      "information security", "infosec", "soc analyst", "penetration",
      "appsec", "application security", "vulnerability"
    ],
    infra: [
      "devops", "site reliability", "infrastructure engineer", "platform engineer",
      "network engineer", "systems administrator", "system administrator",
      "sysadmin", "cloud engineer", "kubernetes", "terraform", "ci/cd"
    ],
    ai_ml: [
      "machine learning", "ai engineer", "ml engineer", "deep learning",
      "computer vision", "nlp engineer", "mlops", "algorithm engineer",
      "applied scientist"
    ]
  };
  
  // Word-boundary tokens that are too short/ambiguous for substring matching.
  var TECH_DOMAIN_REGEX = {
    software: [/\bswe\b/, /\bsdk\b/, /\bapi\b/],
    data: [/\bsql\b/, /\bdba\b/, /\betl\b/, /\belt\b/],
    security: [/\bsoc\b/],
    infra: [/\bsre\b/, /\baws\b/, /\bazure\b/, /\bgcp\b/],
    ai_ml: [/\bai\b/, /\bml\b/, /\bllm\b/]
  };
  
  var EXCLUDE_DOMAIN_PHRASES = {
    sales: [
      "sales development representative", "sales development rep", "sdr",
      "business development representative", "business development rep", "bdr",
      "account manager", "account executive", "sales representative",
      "outside sales", "inside sales", "b2b sales", "lead generation",
      "lead generation executive", "sales associate", "sales administrator",
      "field sales", "technical sales", "sales consultant", "cold call"
    ],
    marketing: [
      "marketing intern", "marketing &", "social media", "content creator",
      "ugc", "brand marketing", "brand ambassador", "seo intern",
      "digital marketing", "community storyteller", "content marketing",
      "growth assistant", "marketplace growth", "host producer"
    ],
    recruiting: [
      "recruiter", "technical recruiter", "staffing recruiter", "talent specialist",
      "talent acquisition", "tech recruiter"
    ],
    ops_admin: [
      "executive assistant", "personal assistant", "assistant to the ceo",
      "operations associate", "business operations associate",
      "office coordinator", "office manager", "office assistant", "front office",
      "buyer", "payroll", "people operations", "human resources",
      "hr intern", "hr coordinator", "program analyst", "sales administrator",
      "customer service associate", "support associate", "passport",
      "deployment technician", "deployment coordinator", "launch coordinator"
    ],
    manual: [
      "bartender", "ticket agent", "tram operator", "mechanic",
      "greenhouse", "copier technician", "assembly technician",
      "laboratory assistant", "lab assistant", "electronic technician",
      "field service", "deployment", "qa inspector", "manufacturing quality",
      "electrical designer", "materials engineer", "mechanical engineer",
      "test engineer", "process automation"
    ],
    gig_labeling: [
      "data annotat", "ai data", "data trainer", "model evaluator",
      "llm trainer", "ai quality", "content review", "image quality rater",
      "caption analyst", "video contributor", "data collection specialist",
      "benchmark researcher", "do your chores", "household task",
      "face motion", "ai data annotator", "prompt engineer"
    ]
  };
  
  /**
   * "Primarily <specialty>" phrases for the BSCS interdisciplinary double-major
   * profiles (cs_criminology/cs_business/cs_social_sciences/cs_economics/
   * cs_anthropology) — pure specialty roles, not just the tech-hybrid ones
   * already covered by TECH_DOMAIN_PHRASES.
   * Deliberately kept OUT of TECH_DOMAIN_PHRASES/JOB_FILTER_CONFIG.allowed_domains,
   * which stay software/data/security/infra/ai_ml only for every other search
   * (this config is shared with Handshake's noise filter — a random criminology
   * or marketing posting is exactly what that filter exists to drop). Instead,
   * v2GetInterdisciplinaryDomainFromQuery_ detects when a request's query
   * matches one of these profiles, and runProvidersLiveV2_ passes the
   * matching phrase set into v2FilterJobsByRelevance_ as a request-scoped
   * extra allowed domain — only that search gets the wider net.
   */
  var INTERDISCIPLINARY_DOMAIN_PHRASES = {
    criminology: [
      "criminal justice", "criminology", "law enforcement", "corrections",
      "probation", "parole", "victim advocate", "victim services",
      "crime analyst", "criminal investigator", "fraud investigator",
      "forensic", "compliance investigator", "paralegal", "loss prevention"
    ],
    business: [
      // "account manager"/"account executive"/"human resources" deliberately
      // omitted — they're exact duplicates of EXCLUDE_DOMAIN_PHRASES.sales/
      // ops_admin entries, so they'd always net-cancel to zero and contribute
      // nothing (see hr business partner below for the HR-adjacent term that
      // doesn't collide).
      "business development", "business operations", "operations manager",
      "management analyst", "business administration",
      "marketing coordinator", "marketing manager",
      "sales operations", "financial analyst",
      "hr business partner", "supply chain", "project coordinator",
      "program manager", "program coordinator"
    ],
    social_science: [
      "social science", "research assistant", "policy analyst",
      "social worker", "community outreach", "public health",
      "sociology", "psychology", "nonprofit", "case manager",
      "counselor", "victim services"
    ],
    economics: [
      "economic analyst", "economist", "market research analyst",
      "financial analyst", "econometrics", "actuary", "underwriter",
      "cost analyst", "budget analyst", "economic research",
      "policy analyst"
    ],
    anthropology: [
      "ux researcher", "user researcher", "user experience researcher",
      "design researcher", "ethnographic research", "qualitative researcher",
      "market researcher", "anthropologist", "human factors researcher"
    ]
  };
  
  /** cs_* degree profile key -> INTERDISCIPLINARY_DOMAIN_PHRASES key. */
  var INTERDISCIPLINARY_PROFILE_TO_DOMAIN = {
    cs_criminology: "criminology",
    cs_business: "business",
    cs_social_sciences: "social_science",
    cs_economics: "economics",
    cs_anthropology: "anthropology"
  };
  
  /** Inverse of INTERDISCIPLINARY_PROFILE_TO_DOMAIN — domain -> profile key. */
  var INTERDISCIPLINARY_DOMAIN_TO_PROFILE = {
    criminology: "cs_criminology",
    business: "cs_business",
    social_science: "cs_social_sciences",
    economics: "cs_economics",
    anthropology: "cs_anthropology"
  };
  
  /* ============================================================
   * Quality / spam flag patterns (run against title + description, lowercased)
   * ============================================================ */
  
  var QUALITY_PATTERNS = {
    unpaid: /\bunpaid\b/,
    unpaid_with_equity_bait: /(unpaid|no stipend|stipend (begin|after)).{0,200}(equity|stock|ownership)|(equity|stock|ownership).{0,200}(unpaid|no stipend)/s,
    commission_only: /(1099)|(commission only)|(pure commission)|(uncapped commission)|(100% commission)/,
    piecework_low_pay: /\$\s?(7|7\.25|7\.5|8|10)\s?(\/|per )\s?hour|per (approved|submitted) (video|data|set)|\$\s?7 for a valid/,
    mlm: /(passive income)|(place .{0,20}machine)|(10% of everything)|(the machine does the work)|(earn .{0,15}passive)|(machine placement)/,
    apply_via_personal_email: /(send (your )?resume to .{0,40}@)|(apply.{0,20}@gmail)|(reply back confirming)|(complete this form in addition to handshake)/,
    stipend_after_period: /(no stipend for the first)|(stipend (beginning|begin) (after|around))|(first 30 days)/
  };
  
  /* ============================================================
   * Classification
   * ============================================================ */
  
  function jobBlob_(job) {
    job = job || {};
    return {
      title: String(job.title || "").toLowerCase(),
      body: [job.title, job.company, job.description, job.summary]
        .join(" ")
        .toLowerCase()
    };
  }
  
  function countDomainHits_(text, phrases, regexes) {
    var hits = 0;
  
    for (var i = 0; i < phrases.length; i++) {
      if (text.indexOf(phrases[i]) !== -1) {
        hits++;
      }
    }
  
    if (regexes) {
      for (var j = 0; j < regexes.length; j++) {
        if (regexes[j].test(text)) {
          hits++;
        }
      }
    }
  
    return hits;
  }
  
  /**
   * Returns { domain, tech_score, exclude_score, scores }
   * Title hits weighted by title_weight, body hits by desc_weight.
   *
   * extraDomainPhrases (optional): a TECH_DOMAIN_PHRASES-shaped object
   * ({domainKey: [phrase, ...]}) scored alongside the built-in tech domains
   * for this call only — used to request-scope in the interdisciplinary
   * criminology/business/social_science phrase sets (see
   * INTERDISCIPLINARY_DOMAIN_PHRASES) without touching the global
   * TECH_DOMAIN_PHRASES table that every other search relies on.
   */
  function v2ScoreJobDomains_(job, extraDomainPhrases) {
    var cfg = JOB_FILTER_CONFIG;
    var b = jobBlob_(job);
  
    var scores = {};
    var bestTech = null;
    var bestTechScore = 0;
  
    var key;
  
    // Tech domains
    for (key in TECH_DOMAIN_PHRASES) {
      if (!TECH_DOMAIN_PHRASES.hasOwnProperty(key)) {
        continue;
      }
  
      var titleHits = countDomainHits_(
        b.title,
        TECH_DOMAIN_PHRASES[key],
        TECH_DOMAIN_REGEX[key]
      );
      var bodyHits = countDomainHits_(
        b.body,
        TECH_DOMAIN_PHRASES[key],
        TECH_DOMAIN_REGEX[key]
      );
  
      var s = titleHits * cfg.title_weight + bodyHits * cfg.desc_weight;
      scores[key] = s;
  
      if (s > bestTechScore) {
        bestTechScore = s;
        bestTech = key;
      }
    }
  
    // Request-scoped extra domains (e.g. interdisciplinary criminology/business/social_science)
    if (extraDomainPhrases) {
      for (key in extraDomainPhrases) {
        if (!Object.prototype.hasOwnProperty.call(extraDomainPhrases, key)) {
          continue;
        }
  
        var extraTitleHits = countDomainHits_(b.title, extraDomainPhrases[key], null);
        var extraBodyHits = countDomainHits_(b.body, extraDomainPhrases[key], null);
  
        var extraScore = extraTitleHits * cfg.title_weight + extraBodyHits * cfg.desc_weight;
        scores[key] = extraScore;
  
        if (extraScore > bestTechScore) {
          bestTechScore = extraScore;
          bestTech = key;
        }
      }
    }
  
    // Exclude domains
    var bestExclude = null;
    var bestExcludeScore = 0;
  
    for (key in EXCLUDE_DOMAIN_PHRASES) {
      if (!EXCLUDE_DOMAIN_PHRASES.hasOwnProperty(key)) {
        continue;
      }
  
      var xTitle = countDomainHits_(b.title, EXCLUDE_DOMAIN_PHRASES[key], null);
      var xBody = countDomainHits_(b.body, EXCLUDE_DOMAIN_PHRASES[key], null);
  
      var xs = xTitle * cfg.title_weight + xBody * cfg.desc_weight;
      scores[key] = xs;
  
      if (xs > bestExcludeScore) {
        bestExcludeScore = xs;
        bestExclude = key;
      }
    }
  
    var domain;
  
    if (bestTechScore === 0 && bestExcludeScore === 0) {
      domain = "unknown";
    } else if (bestTechScore >= bestExcludeScore && bestTechScore > 0) {
      domain = bestTech;
    } else {
      domain = bestExclude;
    }
  
    return {
      domain: domain,
      tech_score: bestTechScore,
      exclude_score: bestExcludeScore,
      scores: scores
    };
  }
  
  function v2JobQualityFlags_(job) {
    var b = jobBlob_(job);
    var flags = [];
  
    for (var key in QUALITY_PATTERNS) {
      if (!QUALITY_PATTERNS.hasOwnProperty(key)) {
        continue;
      }
  
      if (QUALITY_PATTERNS[key].test(b.body)) {
        flags.push(key);
      }
    }
  
    return flags;
  }
  
  /**
   * Full relevance evaluation for one job.
   * Returns { keep, score, domain, tech_score, exclude_score, flags, reason }.
   *
   * opts (optional): { extra_domain_phrases, extra_allowed_domains } — see
   * v2ScoreJobDomains_ and v2FilterJobsByRelevance_.
   */
  function v2EvaluateJobRelevance_(job, opts) {
    opts = opts || {};
  
    var cfg = JOB_FILTER_CONFIG;
  
    var d = v2ScoreJobDomains_(job, opts.extra_domain_phrases);
    var flags = v2JobQualityFlags_(job);
  
    // Hard drop on disqualifying quality flags.
    for (var i = 0; i < flags.length; i++) {
      if (cfg.hard_drop_flags.indexOf(flags[i]) !== -1) {
        return {
          keep: false,
          score: -999,
          domain: d.domain,
          tech_score: d.tech_score,
          exclude_score: d.exclude_score,
          flags: flags,
          reason: "hard_drop_flag:" + flags[i]
        };
      }
    }
  
    var score = d.tech_score - d.exclude_score;
  
    // Soft penalty for remaining (non-hard-drop) flags.
    var softFlags = flags.filter(function (f) {
      return cfg.hard_drop_flags.indexOf(f) === -1;
    });
    score -= softFlags.length * cfg.soft_flag_penalty;
  
    var allowedDomains = cfg.allowed_domains;
  
    if (opts.extra_allowed_domains && opts.extra_allowed_domains.length) {
      allowedDomains = allowedDomains.concat(opts.extra_allowed_domains);
    }
  
    var domainAllowed = allowedDomains.indexOf(d.domain) !== -1;
    var isUnknown = d.domain === "unknown";
  
    var keep;
    var reason;
  
    if (domainAllowed && score >= cfg.min_score) {
      keep = true;
      reason = "allowed_domain_above_threshold";
    } else if (isUnknown && cfg.allow_unknown && d.exclude_score === 0) {
      keep = true;
      reason = "unknown_allowed";
    } else if (!domainAllowed) {
      keep = false;
      reason = "domain_not_allowed:" + d.domain;
    } else {
      keep = false;
      reason = "below_min_score";
    }
  
    return {
      keep: keep,
      score: score,
      domain: d.domain,
      tech_score: d.tech_score,
      exclude_score: d.exclude_score,
      flags: flags,
      reason: reason
    };
  }
  
  /**
   * Filter an array of normalized jobs by relevance.
   * Attaches relevance metadata to each kept job and logs drop samples.
   *
   * opts (optional): { attach_meta: true, extra_domain_phrases, extra_allowed_domains }
   * extra_domain_phrases/extra_allowed_domains request-scope in additional
   * allowed domains (e.g. INTERDISCIPLINARY_DOMAIN_PHRASES.criminology for a
   * cs_criminology search) without touching the global JOB_FILTER_CONFIG that
   * every other search relies on — see v2EvaluateJobRelevance_.
   */
  function v2FilterJobsByRelevance_(jobs, opts) {
    jobs = Array.isArray(jobs) ? jobs : [];
    opts = opts || {};
  
    var kept = [];
    var keptSamples = [];
    var droppedSamples = [];
  
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];
  
      if (!job) {
        continue;
      }
  
      var ev = v2EvaluateJobRelevance_(job, opts);
  
      if (ev.keep) {
        if (opts.attach_meta !== false) {
          job.relevance_domain = ev.domain;
          job.relevance_score = ev.score;
          job.relevance_flags = ev.flags;
        }
  
        kept.push(job);
  
        if (keptSamples.length < 12) {
          keptSamples.push({
            title: job.title || "",
            domain: ev.domain,
            score: ev.score
          });
        }
      } else if (droppedSamples.length < 15) {
        droppedSamples.push({
          title: job.title || "",
          domain: ev.domain,
          score: ev.score,
          reason: ev.reason,
          flags: ev.flags
        });
      }
    }
  
    Logger.log(
      "[RELEVANCE_FILTER] " +
        JSON.stringify({
          before: jobs.length,
          after: kept.length,
          allowed_domains: JOB_FILTER_CONFIG.allowed_domains.concat(opts.extra_allowed_domains || []),
          min_score: JOB_FILTER_CONFIG.min_score,
          kept_samples: keptSamples,
          dropped_samples: droppedSamples
        })
    );
  
    return kept;
  }
  
  /*
   * Cybersecurity-adjacent terms that specifically bridge into criminology/law
   * enforcement — kept separate from INTERDISCIPLINARY_DOMAIN_PHRASES.
   * criminology (pure CJ vocabulary) because v2FilterCybersecuritySheetForCriminology_
   * needs both combined: a bare "cybersecurity"/"security analyst" hit alone
   * shouldn't be enough to justify surfacing a job for a cs_criminology search
   * — that only describes the CS half, not the criminology half.
   */
  var CRIMINOLOGY_FORENSICS_BRIDGE_PHRASES = [
    "digital forensics", "cybercrime", "intelligence analyst", "fraud analyst"
  ];
  
  /**
   * cybersecurity_jobs_sheet skips the general TECH_DOMAIN_PHRASES allowlist
   * (it's a curated, already tech-scoped source) — but for a cs_criminology
   * search, "tech-scoped" isn't restrictive enough on its own, since the
   * search's own expanded query text includes plain "cybersecurity" and would
   * let any generic SOC/security-engineer posting through. This requires
   * actual criminology/digital-forensics signal in the job text first.
   */
  function v2FilterCybersecuritySheetForCriminology_(jobs) {
    jobs = Array.isArray(jobs) ? jobs : [];
  
    var requireTerms = INTERDISCIPLINARY_DOMAIN_PHRASES.criminology.concat(
      CRIMINOLOGY_FORENSICS_BRIDGE_PHRASES
    );
  
    var kept = [];
    var droppedSamples = [];
  
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];
  
      if (!job) {
        continue;
      }
  
      var blob = [job.title, job.company, job.location, job.description, job.source]
        .join(" ")
        .toLowerCase();
  
      var hasCriminologySignal = false;
  
      for (var t = 0; t < requireTerms.length; t++) {
        if (blob.indexOf(requireTerms[t]) !== -1) {
          hasCriminologySignal = true;
          break;
        }
      }
  
      if (hasCriminologySignal) {
        kept.push(job);
      } else if (droppedSamples.length < 10) {
        droppedSamples.push(job.title || "");
      }
    }
  
    Logger.log(
      "[CYBERSECURITY_SHEET_CRIMINOLOGY_FILTER] " +
        JSON.stringify({ before: jobs.length, after: kept.length, dropped_samples: droppedSamples })
    );
  
    return kept;
  }
  
  /* ============================================================
   * Debug: dry-run classification over whatever the live runner returns
   * ============================================================ */
  
  function debugHandshakeTechDrops() {
    var out = fetchHandshakeRssJobs_(
      { employment_type: "Any" },
      50,
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    );
  
    var jobs = (out && out.results) || [];
    var techDomains = JOB_FILTER_CONFIG.allowed_domains;
  
    var dropped = [];
    var kept = [];
  
    jobs.forEach(function (job) {
      var ev = v2EvaluateJobRelevance_(job);
      var isTech = techDomains.indexOf(ev.domain) !== -1;
  
      if (!ev.keep && isTech) {
        dropped.push({ title: job.title, domain: ev.domain, score: ev.score, reason: ev.reason });
      } else if (ev.keep) {
        kept.push({ title: job.title, domain: ev.domain, score: ev.score });
      }
    });
  
    Logger.log("[HS_TECH] feed=" + jobs.length + " kept=" + kept.length + " tech_dropped=" + dropped.length);
    Logger.log("[HS_TECH] kept: " + JSON.stringify(kept, null, 2));
    Logger.log("[HS_TECH] tech-classified but dropped: " + JSON.stringify(dropped, null, 2));
  }
  
  function debugRelevanceOnLiveResults() {
    var out = runProvidersLiveV2_({
      query_text: "software engineer",
      location_text: "United States",
      employment_type: "Any",
      search_type: "any",
      limit_per_provider: 50
    });
  
    var jobs = (out && out.results) || [];
  
    var rows = jobs.map(function (job) {
      var ev = v2EvaluateJobRelevance_(job);
      return {
        keep: ev.keep,
        domain: ev.domain,
        score: ev.score,
        flags: ev.flags,
        title: job.title || ""
      };
    });
  
    Logger.log("[RELEVANCE_DRYRUN] total=" + rows.length);
    Logger.log(JSON.stringify(rows, null, 2));
  }
  
  /**
   * ProvidersHandshakeRss.gs
   *
   * Live Handshake external-feed (RSS 2.0) provider.
   *
   * Contract matches the other V2 providers:
   *   fetchHandshakeRssJobs_(req, limit, expiry)
   *     -> { results: [...], status: {...} }
   *
   * Each result mirrors the shape consumed by v2DedupeAndRankJobs_ and
   * v2ClassifyJobRoleType_ (needs at least title + apply_url).
   *
   * SECURITY: the feed URL embeds a token. Do NOT hardcode it.
   * Set it in Project Settings -> Script Properties:
   *   key:   HANDSHAKE_RSS_URL
   *   value: https://usf.joinhandshake.com/external_feeds/26589/public.rss?token=...
   *
   * NOTE: handshakeParseDescription_ lives in JobRelevanceFilter.gs (project-wide
   * global). This file does not redefine it.
   */
  
  function getHandshakeRssUrl_() {
    var url = PropertiesService.getScriptProperties().getProperty("HANDSHAKE_RSS_URL");
    return url ? String(url).trim() : "";
  }
  
  /**
   * Strips the HANDSHAKE_RSS_URL token= value out of text before it's logged.
   * UrlFetchApp exceptions can embed the full fetched URL (token included) in
   * err.message, and debug dumps can embed it in a JSON-stringified status
   * object — this covers both since it just scans for the token= pattern
   * wherever it appears in the string.
   */
  function handshakeRedact_(text) {
    return String(text || "").replace(/([?&]token=)[^&\s"']+/gi, "$1REDACTED");
  }
  
  function fetchHandshakeRssJobs_(req, limit, expiry) {
    req = req || {};
    limit = v2ToBoundedInt_(limit, 8, 1, 50);
  
    var url = getHandshakeRssUrl_();
  
    if (!url) {
      return {
        results: [],
        status: {
          provider: "handshake_rss",
          mode: "live",
          success: false,
          error: "HANDSHAKE_RSS_URL script property not set",
          row_count: 0
        }
      };
    }
  
    var resp = UrlFetchApp.fetch(url, {
      method: "get",
      followRedirects: true,
      muteHttpExceptions: true
    });
  
    var code = resp.getResponseCode();
  
    if (code < 200 || code >= 300) {
      return {
        results: [],
        status: {
          provider: "handshake_rss",
          mode: "live",
          success: false,
          error: "HTTP " + code,
          row_count: 0
        }
      };
    }
  
    var items;
  
    try {
      var doc = XmlService.parse(resp.getContentText());
      var root = doc.getRootElement();          // <rss>
      var channel = root.getChild("channel");   // <channel>
  
      if (!channel) {
        throw new Error("No <channel> element in feed");
      }
  
      items = channel.getChildren("item");
    } catch (err) {
      return {
        results: [],
        status: {
          provider: "handshake_rss",
          mode: "live",
          success: false,
          error: "XML parse failed: " + (err && err.message ? err.message : String(err)),
          row_count: 0
        }
      };
    }
  
    var results = [];
    var skipped = 0;
  
    Logger.log("[HANDSHAKE_RSS] parsed item count: " + items.length);
  
    for (var i = 0; i < items.length && results.length < limit; i++) {
      var item = items[i];
  
      var title = handshakeTextOf_(item.getChild("title"));
      var link = handshakeTextOf_(item.getChild("link"));
      var rawDescription = handshakeTextOf_(item.getChild("description"));
      var pubDate = handshakeTextOf_(item.getChild("pubDate"));
  
      if (!title || !link) {
        skipped++;
        if (skipped <= 3) {
          Logger.log(
            "[HANDSHAKE_RSS] skipped item " + i +
            " title=" + JSON.stringify(title) +
            " link=" + JSON.stringify(link)
          );
        }
        continue;
      }
  
      var titleParsed = handshakeParseTitle_(title);
      var descParsed = handshakeParseDescription_(rawDescription);
  
      // Prefer Employer: line for company; fall back to "...at Company" title split.
      var company = descParsed.company || titleParsed.company || "";
      var location = titleParsed.location || "";
      var descriptionBody = descParsed.body || rawDescription || "";
  
      /*
       * Unlike every other provider, this feed was never checked against
       * query_text/location_text at all — it just took the first `limit` RSS
       * items in feed order and relied entirely on the downstream domain
       * allowlist (v2FilterJobsByRelevance_) to weed things out, which only
       * checks broad domain, not the actual query. handshakeParseTitle_ never
       * extracts a real `location` (always ""), so the location check here is
       * best-effort against whatever incidental location text shows up in the
       * title/description — better than no check, but if this feed encodes
       * location in a dedicated field we're not reading yet, that's a
       * follow-up (see debugDumpHandshakeRssFirstItem_).
       */
      var matchBlob = (titleParsed.title + " " + company + " " + descriptionBody).toLowerCase();
  
      if (!liveAdapterQueryMatchesBlob_(req.query_text, matchBlob)) {
        skipped++;
        continue;
      }
  
      if (!liveAdapterLocationMatchesRequest_(req.location_text, location + " " + matchBlob)) {
        skipped++;
        continue;
      }
  
      results.push({
        title: titleParsed.title,
        company: company,
        location: location,
        apply_url: link,
        source: "handshake:usf",
        provider: "handshake_rss",
        /*
         * Do NOT copy req.employment_type here — that's what the caller
         * searched for, not anything the feed actually reported about this
         * job. v2ClassifyJobRoleType_ trusts employment_type/job_type as a
         * "structured" internship signal, so echoing the request back would
         * let every Handshake row inherit whatever role_type the caller
         * asked for instead of its real one. The feed has no structured
         * type field, so leave both blank and let title-text signals decide.
         */
        employment_type: "",
        job_type: "",
        description: descriptionBody,
        posted_at: pubDate || "",
        expires_at: descParsed.expires || "",
        expiry: expiry || ""
      });
    }
  
    Logger.log(
      "[HANDSHAKE_RSS] kept=" + results.length + " skipped=" + skipped
    );
  
    return {
      results: results,
      status: {
        provider: "handshake_rss",
        mode: "live",
        success: true,
        row_count: results.length
      }
    };
  }
  
  /**
   * XmlService text extractor. Returns "" for missing elements.
   * XmlService already unwraps CDATA via getText().
   */
  function handshakeTextOf_(el) {
    if (!el) {
      return "";
    }
  
    return String(el.getText() || "").trim();
  }
  
  /**
   * Heuristic title splitter.
   *
   * Handshake external feeds format titles as "Job Title at Employer".
   * Company is more reliably pulled from the description's "Employer:" line
   * (see handshakeParseDescription_); this is the fallback.
   */
  function handshakeParseTitle_(rawTitle) {
    var title = String(rawTitle || "").trim();
    var company = "";
  
    var atIdx = title.toLowerCase().lastIndexOf(" at ");
  
    if (atIdx !== -1) {
      company = title.slice(atIdx + 4).trim();
      title = title.slice(0, atIdx).trim();
      return { title: title, company: company, location: "" };
    }
  
    var dashParts = title.split(/\s+[-\u2013\u2014]\s+/);
  
    if (dashParts.length >= 2) {
      title = dashParts[0].trim();
      company = dashParts[dashParts.length - 1].trim();
      return { title: title, company: company, location: "" };
    }
  
    return { title: title, company: "", location: "" };
  }
  
  /* ============================================================
   * Debug
   * ============================================================ */
  
  /**
   * Dumps raw XML of the first feed item so you can see the real field layout.
   */
  function debugDumpHandshakeRssFirstItem_() {
    var url = getHandshakeRssUrl_();
  
    if (!url) {
      Logger.log("[HANDSHAKE_RSS] HANDSHAKE_RSS_URL not set");
      return;
    }
  
    var resp;
  
    try {
      resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    } catch (err) {
      // Network failures (DNS, timeout) embed the full token-bearing URL in
      // err.message. Redact before logging.
      Logger.log("[HANDSHAKE_RSS] fetch failed: " + handshakeRedact_(err && err.message ? err.message : String(err)));
      return;
    }
  
    Logger.log("[HANDSHAKE_RSS] HTTP " + resp.getResponseCode());
  
    var doc = XmlService.parse(resp.getContentText());
    var channel = doc.getRootElement().getChild("channel");
  
    if (!channel) {
      Logger.log("[HANDSHAKE_RSS] no <channel>");
      return;
    }
  
    var items = channel.getChildren("item");
    Logger.log("[HANDSHAKE_RSS] item count: " + items.length);
  
    if (!items.length) {
      return;
    }
  
    var xml = XmlService.getPrettyFormat().format(items[0]);
    Logger.log("[HANDSHAKE_RSS] first item:\n" + xml);
  }
  
  function debugFetchHandshakeRssJobs_() {
    var out = fetchHandshakeRssJobs_(
      { employment_type: "Any" },
      10,
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    );
  
    // out.status.error is already redacted inside fetchHandshakeRssJobs_, but
    // redact the whole serialized blob as a belt-and-suspenders guard.
    Logger.log("[HANDSHAKE_RSS_DIRECT] " + handshakeRedact_(JSON.stringify(out, null, 2)));
  }
  
  /**
   * Handshake feed descriptions start with:
   *   "Employer: <Company> \n\n Expires: MM/DD/YYYY \n\n <real body...>"
   * Pulls company + expiry from that preamble, returns body with preamble stripped.
   */
  function handshakeParseDescription_(rawDescription) {
    var raw = String(rawDescription || "");
  
    var company = "";
    var expires = "";
  
    var companyMatch = raw.match(/^\s*Employer:\s*([\s\S]*?)\s*(?:\r?\n|Expires:|$)/i);
    if (companyMatch) {
      company = companyMatch[1].replace(/\s+/g, " ").trim();
    }
  
    var expiresMatch = raw.match(/Expires:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);
    if (expiresMatch) {
      expires = expiresMatch[1].trim();
    }
  
    var body = raw
      .replace(/^\s*Employer:\s*[\s\S]*?(?:\r?\n|(?=Expires:)|$)/i, "")
      .replace(/^\s*Expires:\s*[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  
    return { company: company, expires: expires, body: body };
  }
  
  /**
   * CybersecurityJobs sheet provider.
   *
   * Reads the "CybersecurityJobs" tab of JOBS_SPREADSHEET_ID — populated by an
   * external crawler of jobs.cybersecurityjobs.com — instead of hitting that
   * site directly. Columns: Job ID, Title, Company, Location, Posted Date,
   * Job URL, Apply URL, Description, Source, First Seen, Last Seen, Raw Dedupe
   * Key. Same contract as the other V2 providers:
   *   fetchCybersecurityJobsSheetForLiveSearch_(req, limit, expiry)
   *     -> { results: [...], status: {...} }
   * Reuses liveAdapterQueryMatchesBlob_ / liveAdapterLocationMatchesRequest_ /
   * liveAdapterSimpleMatchScore_ (generic text-blob helpers, not markdown-specific)
   * instead of duplicating query/location matching for this provider.
   */
  
  var CYBERSECURITY_JOBS_SHEET_NAME = "CybersecurityJobs";
  
  function fetchCybersecurityJobsSheetForLiveSearch_(req, limit, expiry) {
    req = req || {};
  
    var sheet;
  
    try {
      sheet = SpreadsheetApp.openById(JOBS_SPREADSHEET_ID).getSheetByName(CYBERSECURITY_JOBS_SHEET_NAME);
    } catch (err) {
      return {
        results: [],
        status: {
          provider: "cybersecurity_jobs_sheet",
          mode: "live",
          success: false,
          error: err && err.message ? String(err.message) : String(err),
          row_count: 0
        }
      };
    }
  
    if (!sheet) {
      return {
        results: [],
        status: {
          provider: "cybersecurity_jobs_sheet",
          mode: "live",
          success: false,
          error: 'Sheet "' + CYBERSECURITY_JOBS_SHEET_NAME + '" not found',
          row_count: 0
        }
      };
    }
  
    var values = sheet.getDataRange().getValues();
  
    if (values.length < 2) {
      return {
        results: [],
        status: {
          provider: "cybersecurity_jobs_sheet",
          mode: "live",
          success: true,
          row_count: 0
        }
      };
    }
  
    var colIndex = {};
    var headerRow = values[0];
  
    for (var c = 0; c < headerRow.length; c++) {
      colIndex[String(headerRow[c] || "").trim()] = c;
    }
  
    var rows = [];
  
    for (var i = 1; i < values.length; i++) {
      var raw = cybersecuritySheetRowToObject_(colIndex, values[i]);
  
      if (!cybersecurityJobMatchesRequest_(req, raw)) {
        continue;
      }
  
      var row = cybersecuritySheetRowToJobRow_(raw, req, expiry);
  
      if (row) {
        rows.push(row);
      }
    }
  
    // Not trimmed to perProviderCap here — see the matching comment in
    // fetchUsaJobsJobs_ (this provider also feeds v2RescoreForDegreeProfile_
    // and the new v2FilterCybersecuritySheetForCriminology_ downstream, both of
    // which need the full candidate set, not a pre-rescore top-N slice).
    rows.sort(function (a, b) {
      return (b.match_score || 0) - (a.match_score || 0);
    });
  
    return {
      results: rows,
      status: {
        provider: "cybersecurity_jobs_sheet",
        mode: "live",
        success: true,
        row_count: rows.length
      }
    };
  }
  
  function cybersecuritySheetRowToObject_(colIndex, valuesRow) {
    function cell(name) {
      var idx = colIndex[name];
      return idx == null || valuesRow[idx] == null ? "" : String(valuesRow[idx]).trim();
    }
  
    return {
      jobId: cell("Job ID"),
      title: cell("Title"),
      company: cell("Company"),
      location: cell("Location"),
      postedDate: cell("Posted Date"),
      jobUrl: cell("Job URL"),
      applyUrl: cell("Apply URL"),
      description: cell("Description"),
      source: cell("Source")
    };
  }
  
  function cybersecurityJobMatchesRequest_(req, raw) {
    var blob = [raw.title, raw.company, raw.location, raw.description, raw.source]
      .join(" ")
      .toLowerCase();
  
    if (!liveAdapterQueryMatchesBlob_(req.query_text, blob)) {
      return false;
    }
  
    if (!liveAdapterLocationMatchesRequest_(req.location_text, raw.location)) {
      return false;
    }
  
    return true;
  }
  
  function cybersecuritySheetRowToJobRow_(raw, req, expiry) {
    var title = String(raw.title || "").trim();
    var apply = normalizeHttpsUrl_(raw.applyUrl || raw.jobUrl || "");
  
    if (!title || !apply) {
      return null;
    }
  
    var resultId = raw.jobId
      ? "cyberjobs-" + raw.jobId
      : "cyberjobs-" + sha256Hex(apply + "|" + title).slice(0, 24);
  
    return {
      result_id: resultId,
      title: title,
      company: raw.company || "",
      location: raw.location || "",
      pay: "",
      apply_url: apply,
      provider: "cybersecurity_jobs_sheet",
      match_score: liveAdapterSimpleMatchScore_(
        req.query_text || "",
        [title, raw.company, raw.location, raw.description, raw.source].join(" ")
      ),
      expiry_at: expiry,
      source: (raw.company ? raw.company + " · " : "") + (raw.source || "CybersecurityJobs.com")
    };
  }
  
  function debugFetchCybersecurityJobsSheet_() {
    var out = fetchCybersecurityJobsSheetForLiveSearch_(
      { query_text: "security", location_text: "United States" },
      10,
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    );
  
    Logger.log("[CYBERSECURITY_JOBS_SHEET_DIRECT] " + JSON.stringify(out, null, 2));
  }
  
  /**
   * Dedupe, match scoring, per-provider cap, and response interleaving.
   */
  
  /** @typedef {{result_id:string,title:string,location:string,pay:string,apply_url:string,provider:string,match_score:number,expiry_at:string,source?:string}} JobRow */
  
  function dedupeAndRankJobs_(jobs, queryText) {
    var best = {};
    for (var i = 0; i < jobs.length; i++) {
      var j = jobs[i];
      var key = sha256Hex(
        String(j.apply_url || '').toLowerCase() + '|' + String(j.title || '').toLowerCase()
      );
      var sc = simpleMatchScore_(queryText, j.title || '');
      j.match_score = Math.max(j.match_score || 0, sc);
      if (!best[key] || best[key].match_score < j.match_score) {
        best[key] = j;
      }
    }
    var out = [];
    for (var k in best) {
      if (Object.prototype.hasOwnProperty.call(best, k)) {
        out.push(best[k]);
      }
    }
    out.sort(function (a, b) {
      return b.match_score - a.match_score;
    });
    return out;
  }
  var MIN_MATCH_SCORE_PERCENT = 30;
  
  function rankAndCapResults(results, limitPerProvider) {
    limitPerProvider = limitPerProvider || 20;

    var byProv = {};

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var p = r.provider;

      // Convert the score to a number and cap it at 100%.
      var score = Number(r.match_score);

      if (isNaN(score)) {
        score = 0;
      }

      r.match_score = Math.min(score, 100);

      if (!byProv[p]) {
        byProv[p] = [];
      }

      byProv[p].push(r);
    }

    var providers = Object.keys(byProv);
    var capped = [];

    for (var j = 0; j < providers.length; j++) {
      var providerResults = byProv[providers[j]];

      // Drop weak matches instead of showing a job the query barely relates to.
      var kept = providerResults.filter(function (r) {
        return r.match_score >= MIN_MATCH_SCORE_PERCENT;
      });

      if (kept.length > 0) {
        kept.sort(function (a, b) {
          return b.match_score - a.match_score;
        });
      } else if (providerResults.length > 0) {
        // A degree-profile rescore can floor out an entire provider (e.g.
        // short titles with no description can't hit enough alias terms).
        // Fall back to the provider's pre-rescore ranking instead of
        // dropping it to zero results.
        kept = providerResults.slice().sort(function (a, b) {
          var aScore = a._baseline_match_score != null ? a._baseline_match_score : a.match_score;
          var bScore = b._baseline_match_score != null ? b._baseline_match_score : b.match_score;
          return bScore - aScore;
        });

        Logger.log(
          "[RANK_FALLBACK] provider " + providers[j] + " had 0 results >= " +
            MIN_MATCH_SCORE_PERCENT + "%, falling back to pre-rescore ranking for " +
            kept.length + " result(s)"
        );
      }

      // Keep only the configured number of results per provider.
      capped = capped.concat(kept.slice(0, limitPerProvider));
    }

    // Sort the final combined results from highest to lowest.
    capped.sort(function (a, b) {
      return b.match_score - a.match_score;
    });

    return capped;
  }
  
  
  
  /**
   * ProvidersLiveAdapters.gs
   *
   * Missing live provider adapters for:
   * - USAJOBS
   * - GitHub markdown repositories
   *
   * This file intentionally provides the exact function names expected by
   * runProvidersLiveV2_():
   *
   * - fetchUsaJobsJobs_(req, limit, expiry)
   * - fetchGithubMarkdownJobsForLiveSearch_(req, limit, expiry)
   *
   * It does not use mock providers.
   */
  
  /* ============================================================
   * USAJOBS provider
   * ============================================================ */
  
  /**
   * Orchestrator: issues one USAJOBS Keyword search per query variant (see
   * liveAdapterGetUsaJobsQueryVariants_) and merges/dedupes the results.
   *
   * Normally that's a single variant. For the BSCS interdisciplinary double-
   * majors (cs_business/cs_criminology/cs_social_sciences/cs_economics/
   * cs_anthropology — any profile with usajobs_query_or) it's two — one
   * short query for the CS half, one for the specialty half — queried and
   * merged independently rather than concatenated into a single Keyword
   * string. USAJOBS's Keyword field isn't documented/verified to treat a
   * multi-word string as OR, and previously req.query_text (the FULL expanded
   * provider_query — 20+ words for these profiles) was being sent as one
   * literal Keyword string, which is almost certainly why searches for these
   * profiles were returning nothing.
   */
  function fetchUsaJobsJobs_(req, limit, expiry) {
    req = req || {};
  
    var authKey = getProp_("USAJOBS_API_KEY");
    var userAgent = getProp_("USAJOBS_USER_AGENT");
  
    if (!authKey || !userAgent) {
      return {
        results: [],
        status: {
          provider: "usajobs",
          mode: "live",
          success: false,
          configured: false,
          error: "Not configured",
          raw_count: 0,
          parsed_count: 0,
          row_count: 0
        }
      };
    }
  
    var queryVariants = liveAdapterGetUsaJobsQueryVariants_(req.original_query_text || req.query_text || "");
    var locationParam = liveAdapterNormalizeUsaJobsLocationParam_(req.location_text || "");
    var perPage = liveAdapterToBoundedInt_(limit, 8, 1, 25);
  
    var seenIds = {};
    var mergedRows = [];
    var variantStats = [];
    var anySuccess = false;
    var lastHttpStatus = null;
    var errors = [];
    var totalRawCount = 0;
    var totalParsedCount = 0;
  
    for (var v = 0; v < queryVariants.length; v++) {
      var variantQuery = queryVariants[v];
      var outcome = fetchUsaJobsJobsForQuery_(variantQuery, locationParam, perPage, req, expiry, authKey, userAgent);
  
      variantStats.push({
        query_text_used: variantQuery,
        success: outcome.success,
        http_status: outcome.httpStatus,
        raw_count: outcome.rawCount,
        parsed_count: outcome.parsedCount,
        row_count: outcome.rows.length,
        skipped: outcome.skipped,
        error: outcome.error || null
      });
  
      if (outcome.success) {
        anySuccess = true;
        lastHttpStatus = outcome.httpStatus;
        totalRawCount += outcome.rawCount || 0;
        totalParsedCount += outcome.parsedCount || 0;
  
        for (var r = 0; r < outcome.rows.length; r++) {
          var row = outcome.rows[r];
  
          if (seenIds[row.result_id]) {
            continue;
          }
  
          seenIds[row.result_id] = true;
          mergedRows.push(row);
        }
      } else {
        errors.push(variantQuery + ": " + outcome.error);
      }
    }
  
    /*
     * Deliberately NOT trimmed to perPage here. For the 3 interdisciplinary
     * profiles this merges up to 2 query variants (CS half + specialty half),
     * and trimming now would use liveAdapterSimpleMatchScore_'s baseline
     * per-title score — computed before v2RescoreForDegreeProfile_
     * runs on the full merged list downstream. A genuine dual-match job (both
     * halves) could score lower under that baseline than a single-half match
     * and get cut here, permanently, before the correct two-half score is ever
     * computed. Each variant is already capped at perPage by the USAJOBS API's
     * ResultsPerPage param, so the merged set is bounded (<= perPage * variant
     * count); the final rankAndCapResults in handleJobSearch caps to
     * limit_per_provider using the real, fully-rescored match_score instead.
     */
    mergedRows.sort(function (a, b) {
      return (b.match_score || 0) - (a.match_score || 0);
    });
  
    Logger.log("[PROVIDER_DEBUG] usajobs variants: " + JSON.stringify(variantStats));
  
    return {
      results: mergedRows,
      status: {
        provider: "usajobs",
        mode: "live",
        success: anySuccess,
        configured: true,
        http_status: lastHttpStatus,
        query_variants_used: queryVariants,
        location_name_used: locationParam || null,
        raw_count: totalRawCount,
        parsed_count: totalParsedCount,
        row_count: mergedRows.length,
        error: anySuccess ? null : errors.join("; ")
      }
    };
  }
  
  /**
   * Single USAJOBS Keyword search + row mapping for one query variant.
   * Never throws — every failure path returns { success: false, error }.
   */
  function fetchUsaJobsJobsForQuery_(queryText, locationParam, perPage, req, expiry, authKey, userAgent) {
    var qUrl = liveAdapterBuildUsaJobsSearchUrl_(queryText, locationParam, perPage, req.min_pay);
  
    Logger.log(
      "[PROVIDER_DEBUG] usajobs before_fetch: " +
        JSON.stringify({
          query_text_used: queryText,
          location_name_used: locationParam,
          per_page: perPage,
          url: qUrl
        })
    );
  
    try {
      var res = UrlFetchApp.fetch(qUrl, {
        method: "get",
        muteHttpExceptions: true,
        followRedirects: true,
        validateHttpsCertificates: true,
        headers: {
          "User-Agent": userAgent,
          "Authorization-Key": authKey,
          Accept: "application/json"
        }
      });
  
      var responseCode = res.getResponseCode();
      var body = res.getContentText() || "";
  
      if (responseCode !== 200) {
        return { success: false, httpStatus: responseCode, rawCount: 0, parsedCount: 0, rows: [], skipped: null, error: "HTTP " + responseCode };
      }
  
      var data;
  
      try {
        data = JSON.parse(body);
      } catch (parseErr) {
        return { success: false, httpStatus: responseCode, rawCount: 0, parsedCount: 0, rows: [], skipped: null, error: "JSON parse failed" };
      }
  
      var sr = data.SearchResult || {};
      var searchResultCount = sr.SearchResultCount != null ? Number(sr.SearchResultCount) : null;
      var items = sr.SearchResultItems || [];
  
      if (!Array.isArray(items)) {
        return { success: false, httpStatus: responseCode, rawCount: searchResultCount, parsedCount: 0, rows: [], skipped: null, error: "SearchResultItems was not an array" };
      }
  
      var rows = [];
      var skipped = {
        missing_descriptor: 0,
        missing_title: 0,
        missing_apply_url: 0,
        bad_apply_url: 0,
        location_mismatch: 0
      };
  
      for (var i = 0; i < items.length; i++) {
        var item = items[i] || {};
        var d = item.MatchedObjectDescriptor || null;
  
        if (!d) {
          skipped.missing_descriptor++;
          continue;
        }
  
        var title = d.PositionTitle ? String(d.PositionTitle).trim() : "";
        var company = d.OrganizationName ? String(d.OrganizationName).trim() : "USAJOBS";
        var loc = d.PositionLocationDisplay ? String(d.PositionLocationDisplay).trim() : "";
        var applyRaw = d.PositionURI ? String(d.PositionURI).trim() : "";
        var apply = normalizeHttpsUrl_(applyRaw);
        var description = liveAdapterExtractUsaJobsDescription_(d);
  
        if (!title) {
          skipped.missing_title++;
          continue;
        }
  
        if (!applyRaw) {
          skipped.missing_apply_url++;
          continue;
        }
  
        if (!apply) {
          skipped.bad_apply_url++;
          continue;
        }
  
        /*
         * The `LocationName` query param is a soft hint to USAJOBS, not a hard
         * filter — a bare state name like "Florida" (as opposed to a specific
         * "Tampa, Florida" city entry) can come back loosely matched or
         * effectively ignored, so wrong-state rows (e.g. Arizona for a Florida
         * search) leak straight through with nothing to catch them. Every
         * other provider (github_markdown, cybersecurity_jobs_sheet, simplify)
         * already re-checks location_text client-side after fetching; USAJOBS
         * was the one provider trusting the upstream param blindly. Checks
         * PositionLocation's individual duty-station names too, since
         * PositionLocationDisplay often just says "Multiple Locations" for
         * multi-site postings with no state info at all.
         */
        var locationDetailNames = Array.isArray(d.PositionLocation)
          ? d.PositionLocation
              .map(function (pl) {
                return pl && pl.LocationName ? String(pl.LocationName) : "";
              })
              .join(" | ")
          : "";
  
        if (!liveAdapterLocationMatchesRequest_(req.location_text, loc + " " + locationDetailNames)) {
          skipped.location_mismatch++;
          continue;
        }
  
        rows.push({
          result_id:
            "usajobs-" +
            String(d.PositionID || item.MatchedObjectId || Utilities.getUuid()),
          title: title,
          company: company,
          location: loc,
          pay: liveAdapterExtractUsaJobsPayText_(d),
          apply_url: apply,
          provider: "usajobs",
          description: description,
          match_score: liveAdapterSimpleMatchScore_(
            req.query_text || "",
            title + " " + company + " " + loc + " " + description
          ),
          expiry_at: expiry,
          source: "Federal (USAJOBS)"
        });
      }
  
      return { success: true, httpStatus: responseCode, rawCount: searchResultCount, parsedCount: items.length, rows: rows, skipped: skipped, error: null };
    } catch (err) {
      return {
        success: false,
        httpStatus: null,
        rawCount: 0,
        parsedCount: 0,
        rows: [],
        skipped: null,
        error: err && err.message ? String(err.message) : String(err)
      };
    }
  }
  
  function liveAdapterBuildUsaJobsSearchUrl_(queryText, locationParam, perPage, minPay) {
    var qUrl =
      "https://data.usajobs.gov/api/search?Keyword=" +
      encodeURIComponent(queryText) +
      "&ResultsPerPage=" +
      encodeURIComponent(String(perPage));
  
    if (locationParam) {
      qUrl += "&LocationName=" + encodeURIComponent(locationParam);
    }
  
    if (minPay != null && String(minPay).trim() !== "") {
      qUrl += "&RemunerationMinimumAmount=" + encodeURIComponent(String(minPay));
    }
  
    return qUrl;
  }
  
  function liveAdapterNormalizeUsaJobsLocationParam_(locationText) {
    var loc = String(locationText || "").trim();
  
    if (!loc) {
      return "";
    }
  
    var lower = loc.toLowerCase();
  
    var broadLocations = {
      "united states": true,
      usa: true,
      us: true,
      "u.s.": true,
      "u.s.a.": true,
      remote: true,
      "remote / anywhere in us": true,
      "remote / anywhere in the us": true,
      anywhere: true,
      "anywhere in us": true,
      "anywhere in the us": true,
      nationwide: true
    };
  
    if (broadLocations[lower]) {
      return "";
    }
  
    loc = loc.replace(/,\s*FL$/i, ", Florida");
    loc = loc.replace(/,\s*GA$/i, ", Georgia");
    loc = loc.replace(/,\s*DC$/i, ", District of Columbia");
    loc = loc.replace(/,\s*CA$/i, ", California");
    loc = loc.replace(/,\s*NY$/i, ", New York");
    loc = loc.replace(/,\s*TX$/i, ", Texas");
    loc = loc.replace(/,\s*VA$/i, ", Virginia");
    loc = loc.replace(/,\s*MD$/i, ", Maryland");
  
    return loc;
  }
  
  function liveAdapterExtractUsaJobsPayText_(descriptor) {
    descriptor = descriptor || {};
  
    var rem =
      descriptor.PositionRemuneration && descriptor.PositionRemuneration.length
        ? descriptor.PositionRemuneration[0]
        : null;
  
    if (!rem) {
      return "";
    }
  
    var min = rem.MinimumRange || "";
    var max = rem.MaximumRange || "";
    var rate = rem.RateIntervalCode || "";
  
    if (min && max) {
      return "$" + String(min) + " - $" + String(max) + (rate ? " / " + String(rate) : "");
    }
  
    if (min) {
      return "$" + String(min) + "+";
    }
  
    return "";
  }
  
  /**
   * USAJOBS's MatchedObjectDescriptor carries only title/org/location — the
   * actual duties/summary text (what v2RescoreForDegreeProfile_ and
   * liveAdapterSimpleMatchScore_ need to tell e.g. a business-oriented
   * "Management Analyst" posting from an unrelated one) lives under
   * UserArea.Details and QualificationSummary instead. Truncated to keep the
   * per-row payload/cache size reasonable — this only feeds keyword matching,
   * not display.
   */
  function liveAdapterExtractUsaJobsDescription_(descriptor) {
    descriptor = descriptor || {};
  
    var details = (descriptor.UserArea && descriptor.UserArea.Details) || {};
    var parts = [];
  
    if (details.JobSummary) {
      parts.push(String(details.JobSummary));
    }
  
    if (Array.isArray(details.MajorDuties)) {
      parts.push(details.MajorDuties.join(" "));
    } else if (details.MajorDuties) {
      parts.push(String(details.MajorDuties));
    }
  
    if (descriptor.QualificationSummary) {
      parts.push(String(descriptor.QualificationSummary));
    }
  
    if (details.Requirements) {
      parts.push(String(details.Requirements));
    }
  
    return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 3000);
  }
  
  /* ============================================================
   * GitHub markdown provider
   * ============================================================ */
  
  /**
   * Entry point used by runProvidersLiveV2_. Tries the "GitHub Jobs" sheet
   * cache first (fast, no UrlFetchApp calls); falls back to a live re-scrape
   * only when the cache is stale/missing. See fetchGithubMarkdownJobsFromSheetCache_
   * and fetchGithubMarkdownJobsLiveFullRefresh_ below.
   */
  function fetchGithubMarkdownJobsForLiveSearch_(req, limit, expiry) {
    req = req || {};
  
    var cached = fetchGithubMarkdownJobsFromSheetCache_(req, limit, expiry);
  
    if (cached) {
      return cached;
    }
  
    // Cache is stale/missing. Only one concurrent request should pay for the
    // full re-scrape + sheet write-back; anyone else who lands here at the
    // same time just answers their own request live without duplicating that
    // work (or piling more concurrent full scrapes on top of each other).
    var lock = LockService.getScriptLock();
    var haveLock = false;
  
    try {
      haveLock = lock.tryLock(5000);
    } catch (lockErr) {
      haveLock = false;
    }
  
    if (!haveLock) {
      return fetchGithubMarkdownJobsLiveFiltered_(req, limit, expiry);
    }
  
    try {
      return fetchGithubMarkdownJobsLiveFullRefresh_(req, limit, expiry);
    } finally {
      lock.releaseLock();
    }
  }
  
  /**
   * Reads the "GitHub Jobs" sheet and answers from it if the cached snapshot
   * is within GITHUB_JOBS_SHEET_TTL_MINUTES. Returns null (not an empty
   * result) when the cache can't be trusted, so the caller knows to fall back
   * — an empty array here would otherwise be indistinguishable from "sheet is
   * fresh but nothing matched this query."
   */
  function fetchGithubMarkdownJobsFromSheetCache_(req, limit, expiry) {
    req = req || {};
  
    var values;
  
    try {
      var sheet = SpreadsheetApp.openById(JOBS_SPREADSHEET_ID).getSheetByName(GITHUB_JOBS_SHEET_NAME);
  
      if (!sheet) {
        return null;
      }
  
      values = sheet.getDataRange().getValues();
    } catch (err) {
      return null;
    }
  
    if (values.length < 2) {
      return null;
    }
  
    var colIndex = {};
    var headerRow = values[0];
  
    for (var c = 0; c < headerRow.length; c++) {
      colIndex[String(headerRow[c] || "").trim()] = c;
    }
  
    var fetchedAtIdx = colIndex.fetchedAt;
    var ageMinutes = fetchedAtIdx == null ? null : githubJobsSheetAgeMinutes_(values[1][fetchedAtIdx]);
  
    if (ageMinutes == null || ageMinutes > GITHUB_JOBS_SHEET_TTL_MINUTES) {
      return null;
    }
  
    var rows = [];
  
    for (var i = 1; i < values.length; i++) {
      var job = githubJobsSheetRowToJobObject_(colIndex, values[i]);
  
      var sourceMeta = githubJobSourceMeta_(job);
      var sourceKind = liveAdapterInferGithubSourceKind_(sourceMeta);
      var sourceRegion = liveAdapterInferGithubSourceRegion_(sourceMeta);
  
      if (!liveAdapterGithubMarkdownSourceMatchesRequest_(sourceKind, sourceRegion, req)) {
        continue;
      }
  
      if (!liveAdapterGithubMarkdownJobMatchesRequest_(req, job)) {
        continue;
      }
  
      var row = liveAdapterGithubMarkdownJobToJobRow_(job, req, expiry);
  
      if (row) {
        rows.push(row);
      }
    }
  
    // Not trimmed to perProviderCap here — see the matching comment in
    // fetchUsaJobsJobs_. v2RescoreForDegreeProfile_ and the domain
    // allowlist run downstream on the full merged list and need the complete
    // candidate set, not a pre-rescore top-N slice from this one provider.
    rows.sort(function (a, b) {
      return (b.match_score || 0) - (a.match_score || 0);
    });
  
    return {
      results: rows,
      status: {
        provider: "github_markdown",
        mode: "live",
        success: true,
        source: "sheet_cache",
        sheet_age_minutes: Math.round(ageMinutes),
        row_count: rows.length
      }
    };
  }
  
  function githubJobsSheetRowToJobObject_(colIndex, valuesRow) {
    function cell(name) {
      var idx = colIndex[name];
      return idx == null || valuesRow[idx] == null ? "" : String(valuesRow[idx]).trim();
    }
  
    return {
      source: cell("source"),
      sourceCategory: cell("sourceCategory"),
      repoType: cell("repoType"),
      section: cell("section"),
      company: cell("company"),
      companyUrl: cell("companyUrl"),
      title: cell("title"),
      applyUrl: cell("applyUrl"),
      location: cell("location"),
      workModel: cell("workModel"),
      datePosted: cell("datePosted"),
      age: cell("age"),
      salary: cell("salary"),
      level: cell("level"),
      h1bStatus: cell("h1bStatus"),
      fetchedAt: cell("fetchedAt")
    };
  }
  
  /**
   * liveAdapterInferGithubSourceKind_/Region_ read source.category (the short
   * slug, e.g. "swe_internship_usa") and source.source (the display name) —
   * matching the shape of a JOB_MARKDOWN_SOURCES entry, not a normalized job
   * row. Normalized job objects (from normalizeJobRow / githubJobsSheetRowToJobObject_)
   * store that same slug under sourceCategory instead, so this adapts one to
   * the other rather than passing the job object straight through.
   */
  function githubJobSourceMeta_(job) {
    return {
      source: job && job.source,
      category: job && job.sourceCategory,
      repoType: job && job.repoType
    };
  }
  
  function githubJobsSheetAgeMinutes_(fetchedAtValue) {
    if (!fetchedAtValue) {
      return null;
    }
  
    var t = fetchedAtValue instanceof Date ? fetchedAtValue.getTime() : new Date(fetchedAtValue).getTime();
  
    if (isNaN(t)) {
      return null;
    }
  
    return (Date.now() - t) / 60000;
  }
  
  /**
   * Cache-miss path: full unfiltered re-scrape of every JOB_MARKDOWN_SOURCES
   * repo (same as writeJobsToSheet/fetchAndParseAllJobRepos, not just the
   * sources this one request cares about) so the write-back refreshes a
   * complete, general-purpose cache rather than a request-scoped slice of it.
   * Answers the current request from that same freshly-scraped data.
   */
  function fetchGithubMarkdownJobsLiveFullRefresh_(req, limit, expiry) {
    req = req || {};
  
    var startedAt = Date.now();
    var allJobs;
  
    try {
      allJobs = fetchAndParseAllJobRepos();
    } catch (err) {
      var errMsg = err && err.message ? String(err.message) : String(err);
  
      logToCrawlerLogsSheet_("ERROR", "github_markdown live refresh failed", { error: errMsg });
  
      return {
        results: [],
        status: {
          provider: "github_markdown",
          mode: "live",
          success: false,
          source: "live_refresh_failed",
          error: errMsg,
          row_count: 0
        }
      };
    }
  
    try {
      writeGithubJobsToSheet_(allJobs);
      logToCrawlerLogsSheet_("INFO", "github_markdown sheet refreshed (opportunistic)", {
        job_count: allJobs.length,
        duration_ms: Date.now() - startedAt
      });
    } catch (writeErr) {
      // Non-fatal: still answer this request from the freshly scraped data below.
      logToCrawlerLogsSheet_("WARN", "github_markdown sheet write-back failed", {
        error: writeErr && writeErr.message ? String(writeErr.message) : String(writeErr)
      });
    }
  
    var rows = [];
  
    for (var i = 0; i < allJobs.length; i++) {
      var job = allJobs[i];
  
      var sourceMeta = githubJobSourceMeta_(job);
      var sourceKind = liveAdapterInferGithubSourceKind_(sourceMeta);
      var sourceRegion = liveAdapterInferGithubSourceRegion_(sourceMeta);
  
      if (!liveAdapterGithubMarkdownSourceMatchesRequest_(sourceKind, sourceRegion, req)) {
        continue;
      }
  
      if (!liveAdapterGithubMarkdownJobMatchesRequest_(req, job)) {
        continue;
      }
  
      var row = liveAdapterGithubMarkdownJobToJobRow_(job, req, expiry);
  
      if (row) {
        rows.push(row);
      }
    }
  
    // Not trimmed to perProviderCap here — see the matching comment in
    // fetchUsaJobsJobs_.
    rows.sort(function (a, b) {
      return (b.match_score || 0) - (a.match_score || 0);
    });
  
    return {
      results: rows,
      status: {
        provider: "github_markdown",
        mode: "live",
        success: true,
        source: "live_refresh",
        row_count: rows.length
      }
    };
  }
  
  /**
   * Original per-request live fetch: only fetches sources whose inferred kind/
   * region match this request, so it's cheaper than a full refresh. Used when
   * the sheet cache is stale but another concurrent request already holds the
   * refresh lock — answers this request without adding a second full scrape.
   */
  function fetchGithubMarkdownJobsLiveFiltered_(req, limit, expiry) {
    req = req || {};
  
    var rows = [];
    var errors = [];
    var sourceStats = [];
    var sourcesTried = 0;
    var sourcesOk = 0;
  
    if (typeof JOB_MARKDOWN_SOURCES === "undefined" || !Array.isArray(JOB_MARKDOWN_SOURCES)) {
      return {
        results: [],
        status: {
          provider: "github_markdown",
          mode: "live",
          success: false,
          error: "JOB_MARKDOWN_SOURCES is not defined or is not an array",
          sources_tried: 0,
          sources_ok: 0,
          row_count: 0
        }
      };
    }
  
    for (var i = 0; i < JOB_MARKDOWN_SOURCES.length; i++) {
      var source = JOB_MARKDOWN_SOURCES[i];
  
      var sourceKind = liveAdapterInferGithubSourceKind_(source);
      var sourceRegion = liveAdapterInferGithubSourceRegion_(source);
  
      if (!liveAdapterGithubMarkdownSourceMatchesRequest_(sourceKind, sourceRegion, req)) {
        sourceStats.push({
          source: source.source || source.url || "unknown",
          skipped: true,
          reason: "request_filter",
          inferred_kind: sourceKind,
          inferred_region: sourceRegion
        });
        continue;
      }
  
      sourcesTried++;
  
      try {
        var markdown = liveAdapterFetchText_(source.url);
        var parsedJobs = parseMarkdownJobTables(markdown, source);
  
        if (!Array.isArray(parsedJobs)) {
          throw new Error("Markdown parser returned non-array");
        }
  
        sourcesOk++;
  
        var matched = 0;
        var skippedFilter = 0;
        var skippedBadRow = 0;
  
        for (var j = 0; j < parsedJobs.length; j++) {
          var job = parsedJobs[j];
  
          if (!liveAdapterGithubMarkdownJobMatchesRequest_(req, job)) {
            skippedFilter++;
            continue;
          }
  
          var row = liveAdapterGithubMarkdownJobToJobRow_(job, req, expiry);
  
          if (!row) {
            skippedBadRow++;
            continue;
          }
  
          matched++;
          rows.push(row);
        }
  
        sourceStats.push({
          source: source.source || source.url || "unknown",
          success: true,
          inferred_kind: sourceKind,
          inferred_region: sourceRegion,
          parsed_count: parsedJobs.length,
          matched_count: matched,
          skipped_filter: skippedFilter,
          skipped_bad_row: skippedBadRow
        });
      } catch (err) {
        var msg = err && err.message ? String(err.message) : String(err);
  
        errors.push((source.source || source.url || "unknown") + ": " + msg);
  
        sourceStats.push({
          source: source.source || source.url || "unknown",
          success: false,
          inferred_kind: sourceKind,
          inferred_region: sourceRegion,
          error: msg,
          parsed_count: 0,
          matched_count: 0
        });
      }
    }
  
    // Not trimmed to perProviderCap here — see the matching comment in
    // fetchUsaJobsJobs_.
    rows.sort(function (a, b) {
      var scoreDiff = (b.match_score || 0) - (a.match_score || 0);
  
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
  
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  
    Logger.log(
      "[PROVIDER_DEBUG] github_markdown summary: " +
        JSON.stringify({
          sources_tried: sourcesTried,
          sources_ok: sourcesOk,
          row_count: rows.length,
          source_stats: sourceStats,
          errors: errors
        })
    );
  
    return {
      results: rows,
      status: {
        provider: "github_markdown",
        mode: "live",
        success: sourcesOk > 0,
        sources_tried: sourcesTried,
        sources_ok: sourcesOk,
        row_count: rows.length,
        source_stats: sourceStats,
        error: sourcesOk > 0 ? null : errors.join("; ")
      }
    };
  }
  
  function liveAdapterFetchText_(url) {
    if (!url) {
      throw new Error("Missing URL");
    }
  
    var response = UrlFetchApp.fetch(String(url), {
      method: "get",
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true,
      headers: {
        Accept: "text/plain"
      }
    });
  
    var status = response.getResponseCode();
  
    if (status !== 200) {
      throw new Error("HTTP " + status + " for " + url);
    }
  
    return response.getContentText();
  }
  
  
  function liveAdapterInferGithubSourceKind_(source) {
    var text = [
      source && source.source,
      source && source.category,
      source && source.repoType,
      source && source.url
    ]
      .join(" ")
      .toLowerCase();
  
    if (
      text.indexOf("internship") !== -1 ||
      text.indexOf("internships") !== -1 ||
      text.indexOf("intern_") !== -1 ||
      text.indexOf("intern-intl") !== -1 ||
      text.indexOf("intern_intl") !== -1
    ) {
      return "internship";
    }
  
    if (
      text.indexOf("new grad") !== -1 ||
      text.indexOf("new_grad") !== -1 ||
      text.indexOf("new-grad") !== -1 ||
      text.indexOf("college") !== -1
    ) {
      return "new_grad";
    }
  
    if (text.indexOf("h1b") !== -1) {
      return "general";
    }
  
    return "general";
  }
  
  function liveAdapterInferGithubSourceRegion_(source) {
    var text = [
      source && source.source,
      source && source.category,
      source && source.url
    ]
      .join(" ")
      .toLowerCase();
  
    if (
      text.indexOf("international") !== -1 ||
      text.indexOf("intl") !== -1 ||
      text.indexOf("intern_intl") !== -1 ||
      text.indexOf("new_grad_intl") !== -1
    ) {
      return "international";
    }
  
    if (
      text.indexOf("usa") !== -1 ||
      text.indexOf("united states") !== -1 ||
      text.indexOf("college-jobs") !== -1 ||
      text.indexOf("h1b") !== -1
    ) {
      return "usa";
    }
  
    return "unknown";
  }
  
  /**
   * search_type ("internship"/"job") is the caller's explicit toggle and takes
   * priority over the employment_type-derived kind below — otherwise a request
   * like { employment_type: "Already Graduated", search_type: "internship" }
   * would gate out every internship source file before search_type ever gets a
   * chance to filter, silently returning zero github_markdown internship rows.
   */
  function liveAdapterSearchTypeToSourceKind_(searchType) {
    var v = String(searchType || "any").toLowerCase().trim();
  
    if (v === "internship") {
      return "internship";
    }
  
    if (v === "job") {
      return "new_grad";
    }
  
    return "any";
  }
  
  function liveAdapterGithubMarkdownSourceMatchesRequest_(sourceKind, sourceRegion, req) {
    var searchTypeKind = liveAdapterSearchTypeToSourceKind_(req.search_type);
    var requestedKind = liveAdapterNormalizeEmploymentKind_(req.employment_type);
    var queryKind = liveAdapterInferEmploymentKindFromQuery_(req.query_text);
    var loc = String(req.location_text || "").toLowerCase().trim();
  
    if (searchTypeKind !== "any") {
      if (sourceKind !== searchTypeKind && sourceKind !== "general") {
        return false;
      }
    } else if (requestedKind !== "any") {
      if (sourceKind !== requestedKind && sourceKind !== "general") {
        return false;
      }
    } else if (queryKind !== "any") {
      if (sourceKind !== queryKind && sourceKind !== "general") {
        return false;
      }
    }
  
    if (liveAdapterIsBroadUsLocation_(loc)) {
      return sourceRegion !== "international";
    }
  
    if (loc && sourceRegion === "international") {
      return false;
    }
  
    return true;
  }
  
  function liveAdapterGithubMarkdownJobMatchesRequest_(req, job) {
    var blob = [
      job && job.company,
      job && job.title,
      job && job.location,
      job && job.workModel,
      job && job.section,
      job && job.source,
      job && job.sourceCategory,
      job && job.level,
      job && job.h1bStatus
    ]
      .join(" ")
      .toLowerCase();
  
    if (!liveAdapterQueryMatchesBlob_(req.query_text, blob)) {
      return false;
    }
  
    if (
      !liveAdapterLocationMatchesRequest_(
        req.location_text,
        [job.location, job.workModel, job.section].join(" ")
      )
    ) {
      return false;
    }
  
    return true;
  }
  
  function liveAdapterGithubMarkdownJobToJobRow_(job, req, expiry) {
    var title = String((job && job.title) || "").trim();
    var company = String((job && job.company) || "").trim();
    var location = String((job && job.location) || "").trim();
    var pay = String((job && job.salary) || "").trim();
  
    var apply = normalizeHttpsUrl_((job && job.applyUrl) || "");
    var companyUrl = normalizeHttpsUrl_((job && job.companyUrl) || "");
  
    if (!apply && companyUrl) {
      apply = companyUrl;
    }
  
    if (!title || !apply) {
      return null;
    }
  
    var idPart = [
      job.source || "",
      company,
      title,
      location,
      apply
    ].join("|");
  
    return {
      result_id: "github-md-" + sha256Hex(idPart).slice(0, 24),
      title: title,
      company: company,
      location: location,
      pay: pay,
      apply_url: apply,
      provider: "github_markdown",
      match_score: liveAdapterSimpleMatchScore_(
        req.query_text || "",
        [
          title,
          company,
          location,
          job.source,
          job.sourceCategory,
          job.section
        ].join(" ")
      ),
      expiry_at: expiry,
      source: (company ? company + " · " : "") + String(job.source || "GitHub Jobs")
    };
  }
  
  /* ============================================================
   * Shared live adapter helpers
   * ============================================================ */
  
  function liveAdapterNormalizeEmploymentKind_(employmentType) {
    var e = String(employmentType || "").toLowerCase().trim();
  
    if (!e) {
      return "any";
    }
  
    if (
      e.indexOf("already graduated") !== -1 ||
      e.indexOf("new grad") !== -1 ||
      e.indexOf("new-grad") !== -1 ||
      e.indexOf("graduate") !== -1 ||
      e.indexOf("entry") !== -1 ||
      e.indexOf("full") !== -1
    ) {
      return "new_grad";
    }
  
    if (
      e.indexOf("intern") !== -1 ||
      e.indexOf("fall") !== -1 ||
      e.indexOf("summer") !== -1 ||
      e.indexOf("spring") !== -1 ||
      e.indexOf("winter") !== -1
    ) {
      return "internship";
    }
  
    if (e === "any" || e === "all") {
      return "any";
    }
  
    return "any";
  }
  
  function liveAdapterInferEmploymentKindFromQuery_(queryText) {
    var q = String(queryText || "").toLowerCase();
  
    if (
      q.indexOf("internship") !== -1 ||
      q.indexOf("intern ") !== -1 ||
      q.indexOf(" intern") !== -1
    ) {
      return "internship";
    }
  
    if (
      q.indexOf("new grad") !== -1 ||
      q.indexOf("new-grad") !== -1 ||
      q.indexOf("entry level") !== -1
    ) {
      return "new_grad";
    }
  
    return "any";
  }
  
  function liveAdapterQueryMatchesBlob_(queryText, blob) {
    var q = String(queryText || "").trim().toLowerCase();
  
    if (!q) {
      return true;
    }
  
    var b = String(blob || "").toLowerCase();
  
    if (!b) {
      return false;
    }
  
    var tokens = q
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 1;
      });
  
    if (!tokens.length) {
      return true;
    }
  
    var checkedAnyMeaningfulToken = false;
  
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
  
      if (liveAdapterIsLowSignalToken_(token)) {
        continue;
      }
  
      checkedAnyMeaningfulToken = true;
  
      if (b.indexOf(token) !== -1) {
        return true;
      }
  
      var aliases = liveAdapterGetJobQueryAliases_(token);
  
      for (var j = 0; j < aliases.length; j++) {
        if (b.indexOf(String(aliases[j]).toLowerCase()) !== -1) {
          return true;
        }
      }
    }
  
    if (!checkedAnyMeaningfulToken) {
      return true;
    }
  
    return false;
  }
  
  function liveAdapterLocationMatchesRequest_(locQ, locStr) {
    var q = String(locQ || "").toLowerCase().trim();
  
    if (!q || liveAdapterIsBroadUsLocation_(q)) {
      return true;
    }
  
    var s = String(locStr || "").toLowerCase();
  
    if (!s) {
      return false;
    }
  
    if (s.indexOf(q) !== -1) {
      return true;
    }
  
    if (s.indexOf("remote") !== -1) {
      return true;
    }
  
    /*
     * jobs.html's location select sends compound "City, State" values (e.g.
     * "Tampa, Florida" for the "Tampa Bay area" option) — split them so the
     * city and state can each be checked separately, since a job's own
     * location string almost never spells out both halves verbatim the same
     * way (e.g. "Tampa, FL" instead of "Tampa, Florida"). For a bare query
     * ("Florida", "FL") this leaves statePart === q, so behavior is unchanged.
     */
    var qParts = q.split(",");
    var cityPart = qParts.length > 1 ? qParts[0].trim() : "";
    var statePart = qParts.length > 1 ? qParts[1].trim() : q;
  
    if (cityPart && s.indexOf(cityPart) !== -1) {
      return true;
    }
  
    var abbr = liveAdapterGetStateAbbreviation_(statePart);
  
    if (abbr) {
      if (s.indexOf(", " + abbr) !== -1) {
        return true;
      }
  
      if (new RegExp("\\b" + abbr + "\\b", "i").test(s)) {
        return true;
      }
    }
  
    if (/^[a-z]{2}$/.test(statePart)) {
      if (s.indexOf(", " + statePart) !== -1) {
        return true;
      }
  
      if (new RegExp("\\b" + statePart + "\\b", "i").test(s)) {
        return true;
      }
    }
  
    return false;
  }
  
  function liveAdapterIsBroadUsLocation_(locationText) {
    var l = String(locationText || "").toLowerCase().trim();
  
    var broad = {
      "united states": true,
      usa: true,
      us: true,
      "u.s.": true,
      "u.s.a.": true,
      remote: true,
      "remote": true,
      anywhere: true,
      "anywhere in us": true,
      "anywhere in the us": true,
      nationwide: true
    };
  
    return !!broad[l];
  }
  
  /** Reuses the single US_STATE_NAME_TO_USPS map instead of keeping a second copy. */
  function liveAdapterGetStateAbbreviation_(stateName) {
    return US_STATE_NAME_TO_USPS[String(stateName || "").toLowerCase().trim()] || "";
  }
  
  /**
   * Combined, deduped list of every known multi-word job-domain phrase
   * (TECH_DOMAIN_PHRASES + every degree profile's aliases/specialty_aliases) —
   * rebuilt per call, same as getDegreeSearchProfiles_() already is elsewhere
   * in this file. See liveAdapterSimpleMatchScore_ for why this exists.
   */
  function liveAdapterGetAllKnownJobPhrases_() {
    var phrases = [];
    var seen = {};
  
    function addAll(list) {
      if (!Array.isArray(list)) {
        return;
      }
  
      for (var i = 0; i < list.length; i++) {
        var p = String(list[i] || "").toLowerCase().trim();
  
        if (p && !seen[p]) {
          seen[p] = true;
          phrases.push(p);
        }
      }
    }
  
    for (var domain in TECH_DOMAIN_PHRASES) {
      if (Object.prototype.hasOwnProperty.call(TECH_DOMAIN_PHRASES, domain)) {
        addAll(TECH_DOMAIN_PHRASES[domain]);
      }
    }
  
    var profiles = getDegreeSearchProfiles_();
  
    for (var key in profiles) {
      if (Object.prototype.hasOwnProperty.call(profiles, key)) {
        addAll(profiles[key].aliases);
        addAll(profiles[key].specialty_aliases);
      }
    }
  
    return phrases;
  }
  
  /**
   * Returns a 0-100 percentage score. MIN_MATCH_SCORE_PERCENT in
   * rankAndCapResults compares match_score against a 0-100 scale, so every
   * scorer that feeds it must share this scale.
   *
   * Scores against known multi-word PHRASES ("software engineer", "systems
   * engineer", ...) instead of single words. The old version split the
   * already-curated query ("computer engineering software engineer embedded
   * systems firmware hardware systems engineer" for BS Computer Engineering)
   * into bare words — "engineer", "engineering", "systems" — which any
   * "<Discipline> Engineer" posting contains regardless of field (Civil
   * Engineer, Electronics Engineer, USAJOBS's catch-all "General Engineer"
   * series, ...), so those scored ~75% purely off generic engineering
   * vocabulary. Matching full phrases means a Civil Engineer posting has to
   * actually contain "software engineer" or "systems engineer" verbatim to get
   * credit, not just the word "engineer". Also drops the old 50-point floor —
   * a genuine zero-match result should land under the 30% quality cutoff and
   * get dropped, not survive as a default "coin flip".
   */
  function liveAdapterSimpleMatchScore_(queryText, blob) {
    var q = String(queryText || "").toLowerCase();
    var b = String(blob || "").toLowerCase();
  
    if (!q) {
      return 50;
    }
  
    var FLOOR = 10;
    var RANGE = 89;
  
    var knownPhrases = liveAdapterGetAllKnownJobPhrases_();
    var relevantPhrases = [];
  
    for (var i = 0; i < knownPhrases.length; i++) {
      if (q.indexOf(knownPhrases[i]) !== -1) {
        relevantPhrases.push(knownPhrases[i]);
      }
    }
  
    if (relevantPhrases.length) {
      var phraseHits = 0;
  
      for (var p = 0; p < relevantPhrases.length; p++) {
        if (b.indexOf(relevantPhrases[p]) !== -1) {
          phraseHits += 1;
        }
      }
  
      return Math.round(Math.min(99, FLOOR + (RANGE * phraseHits) / relevantPhrases.length));
    }
  
    // Fallback for free text that doesn't hit any known phrase (e.g. a skills
    // box entry with no matching profile) — single-word tokens, same low-
    // signal filtering and alias lookup as before, just the same floor/range.
    var tokens = q
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 1 && !liveAdapterIsLowSignalToken_(w);
      });
  
    if (!tokens.length) {
      return 50;
    }
  
    var weightedHits = 0;
  
    for (var t = 0; t < tokens.length; t++) {
      var token = tokens[t];
  
      if (b.indexOf(token) !== -1) {
        weightedHits += 1;
        continue;
      }
  
      var aliases = liveAdapterGetJobQueryAliases_(token);
  
      for (var j = 0; j < aliases.length; j++) {
        if (b.indexOf(String(aliases[j]).toLowerCase()) !== -1) {
          weightedHits += 0.8;
          break;
        }
      }
    }
  
    return Math.round(Math.min(99, FLOOR + (RANGE * weightedHits) / tokens.length));
  }
  
  /**
   * Degree-profile match score: how well a single degree profile's own
   * curated `courseTerms` (its `aliases` list) shows up in `blob`. Same
   * floor(10)/scale(89) convention as liveAdapterSimpleMatchScore_ so it's
   * comparable against MIN_MATCH_SCORE_PERCENT, but scoped to one degree's
   * own term list instead of the global merged phrase pool from
   * liveAdapterGetAllKnownJobPhrases_ — see v2RescoreForDegreeProfile_.
   *
   * Delegates to v2TermMatchStrength_ instead of a literal hits/length
   * ratio. A courseTerms list (e.g. bscs's 13 aliases) is mostly synonyms
   * for one role concept ("software engineer"/"developer"/"backend"/...)
   * plus a couple of adjacent skills (sql/database) — a job that hits 2 of
   * them (say "developer" + "sql") IS a full match, not 15% of one, so
   * requiring a large fraction of the list to match was scoring genuinely
   * relevant jobs (e.g. 24% for a real SQL developer role) below the 30%
   * quality floor and dropping them.
   */
  function v2PercentOfCourseMatchScore_(courseTerms, blob) {
    var b = String(blob || "").toLowerCase();

    if (!Array.isArray(courseTerms) || !courseTerms.length || !b) {
      return 10;
    }

    var strength = v2TermMatchStrength_(courseTerms, b);

    if (strength === 0) {
      return 10;
    }

    return Math.max(1, Math.min(99, Math.round(10 + 89 * strength)));
  }

  function liveAdapterIsLowSignalToken_(token) {
    var low = {
      internship: true,
      internships: true,
      intern: true,
      new: true,
      grad: true,
      graduate: true,
      graduated: true,
      already: true,
      fall: true,
      summer: true,
      spring: true,
      winter: true,
      "2026": true,
      "2027": true,
      job: true,
      jobs: true,
      role: true,
      roles: true,
      position: true,
      positions: true
    };
  
    return !!low[String(token || "").toLowerCase()];
  }
  
  function liveAdapterToBoundedInt_(value, fallback, min, max) {
    var n = parseInt(value, 10);
  
    if (isNaN(n)) {
      n = fallback;
    }
  
    if (n < min) {
      n = min;
    }
  
    if (n > max) {
      n = max;
    }
  
    return n;
  }
  
  function liveAdapterTruncateForLog_(text, maxLen) {
    text = String(text || "");
    maxLen = maxLen || 500;
  
    if (text.length <= maxLen) {
      return text;
    }
  
    return text.slice(0, maxLen) + "...<truncated>";
  }
  
  /* ============================================================
   * Diagnostics / tests
   * ============================================================ */
  
  function debugProviderSymbols_() {
    var symbols = {
      runProvidersLiveV2_: typeof runProvidersLiveV2_,
      fetchUsaJobsJobs_: typeof fetchUsaJobsJobs_,
      fetchSimplifyJsonForLiveSearch_: typeof fetchSimplifyJsonForLiveSearch_,
      fetchGithubMarkdownJobsForLiveSearch_: typeof fetchGithubMarkdownJobsForLiveSearch_,
      fetchCybersecurityJobsSheetForLiveSearch_: typeof fetchCybersecurityJobsSheetForLiveSearch_,
      JOB_MARKDOWN_SOURCES: typeof JOB_MARKDOWN_SOURCES
    };
  
    Logger.log("[PROVIDER_SYMBOLS] " + JSON.stringify(symbols, null, 2));
  }
  
  /**
   * ProvidersRealOnly.gs
   *
   * Self-contained live-only provider runner.
   *
   * This avoids collisions with old duplicate runProvidersLive_() definitions.
   *
   * Expected provider functions somewhere in the project:
   * - fetchUsaJobsJobs_(req, limit, expiry)
   * - fetchSimplifyJsonForLiveSearch_(req, limit, expiry)
   * - fetchGithubMarkdownJobsForLiveSearch_(req, limit, expiry)
   *
   * This file intentionally does NOT call:
   * - normalizeLiveProviderReq_
   * - normalizeProviderOut_
   * - liveDedupeAndRankJobs_
   *
   * because those names may be missing or shadowed by stale files.
   */
  
  function clearJobSearchCache() {
    var cache = CacheService.getScriptCache();
  
    /*
     * Apps Script CacheService does not support clearing all keys globally.
     * So this bumps the cache version by storing a marker and gives you a log.
     *
     * The real cache clear should be done by changing getJobSearchCacheVersion_().
     */
    Logger.log("[CACHE] Apps Script cannot clear all script cache keys directly.");
    Logger.log("[CACHE] Bump getJobSearchCacheVersion_() to invalidate old entries.");
  }
  
  
  function runProvidersLiveV2_(req) {
    Logger.log("[RUN_PROVIDERS_LIVE_V2] active");
  
    req = req || {};
  
    /*
     * Preserve search_type BEFORE v2NormalizeLiveProviderReq_.
     * Some normalizers drop fields they do not know about.
     */
    var rawSearchType = req.search_type;
    var rawRemoteMode = req.remote_mode;
  
    req = v2NormalizeLiveProviderReq_(req);
  
    req.search_type = v2NormalizeSearchType_(rawSearchType || req.search_type);
    req.remote_mode = rawRemoteMode || req.remote_mode;
  
    var expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    var limit = v2ToBoundedInt_(req.limit_per_provider, 8, 1, 50);
  
    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] normalized request: " +
        JSON.stringify({
          original_query_text: req.original_query_text || req.query_text,
          provider_query_text: req.query_text,
          location_text: req.location_text,
          employment_type: req.employment_type,
          search_type: req.search_type,
          authorization: req.authorization,
          limit_per_provider: limit
        })
    );
  
    var u = v2NormalizeProviderOut_(
      "usajobs",
      v2FetchUsaJobsSafe_(req, limit, expiry)
    );
  
    var s = v2NormalizeProviderOut_(
      "github_simplify",
      v2FetchSimplifySafe_(req, limit, expiry)
    );
  
    var g = v2NormalizeProviderOut_(
      "github_markdown",
      v2FetchGithubMarkdownSafe_(req, limit, expiry)
    );
  
    var c = v2NormalizeProviderOut_(
      "cybersecurity_jobs_sheet",
      v2FetchCybersecurityJobsSheetSafe_(req, limit, expiry)
    );
  
    var h = v2NormalizeProviderOut_(
      "handshake_rss",
      v2FetchHandshakeRssSafe_(req, limit, expiry)
    );
  
    // Relevance filter applies to Handshake and github_markdown. Handshake's
    // USF feed is mostly noise; github_markdown's "Jobright H1B Tech Jobs"
    // source turned out NOT to be domain-scoped either — it lists every open
    // role at H1B-sponsoring companies (Life Sciences, Structural Engineering,
    // Creative Director, etc.), not just tech ones. usajobs/github_simplify
    // are left alone: an earlier relevance-filter pass applied to `merged`
    // was dropping legitimate USAJOBS rows (their titles use government-
    // specific terminology that doesn't hit TECH_DOMAIN_PHRASES), so keep
    // this scoped to the two providers actually shown to need it.
    //
    // For the BSCS interdisciplinary double-majors (cs_criminology/cs_business/
    // cs_social_sciences/cs_economics/cs_anthropology — any key in
    // INTERDISCIPLINARY_PROFILE_TO_DOMAIN), request-scope in that specialty's
    // own domain so Handshake's USF feed (which does carry genuine
    // criminology/business/social-science/economics/anthropology postings,
    // not just tech ones) isn't forced through the tech-only allowlist for
    // these specific searches. Every other search gets
    // the unmodified software/data/security/infra/ai_ml allowlist.
    var interdisciplinaryDomain = v2GetInterdisciplinaryDomainFromQuery_(req.original_query_text);
    var relevanceOpts = { attach_meta: true };
  
    if (interdisciplinaryDomain) {
      var extraDomainPhrases = {};
      extraDomainPhrases[interdisciplinaryDomain] = INTERDISCIPLINARY_DOMAIN_PHRASES[interdisciplinaryDomain];
      relevanceOpts.extra_domain_phrases = extraDomainPhrases;
      relevanceOpts.extra_allowed_domains = [interdisciplinaryDomain];
    }
  
    h.results = v2FilterJobsByRelevance_(h.results, relevanceOpts);
    h.status.row_count = h.results.length;
  
    g.results = v2FilterJobsByRelevance_(g.results, relevanceOpts);
    g.status.row_count = g.results.length;
  
    /*
     * cybersecurity_jobs_sheet is a curated, already tech-scoped source, so it
     * skips the general TECH_DOMAIN_PHRASES allowlist that Handshake/
     * github_markdown go through (see comment above). But for a cs_criminology
     * search specifically, "already cybersecurity-scoped" isn't restrictive
     * enough — a plain SOC Analyst / generic Security Engineer posting with no
     * criminal-justice or digital-forensics angle at all would otherwise pass
     * straight through just for containing "cybersecurity" (one of the search's
     * own expanded query terms). Require genuine criminology/forensics signal
     * before this sheet contributes to that specific search.
     */
    if (interdisciplinaryDomain === "criminology") {
      c.results = v2FilterCybersecuritySheetForCriminology_(c.results);
      c.status.row_count = c.results.length;
    }
  
    Logger.log("[RUN_PROVIDERS_LIVE_V2] usajobs status: " + JSON.stringify(u.status));
    Logger.log("[RUN_PROVIDERS_LIVE_V2] github_simplify status: " + JSON.stringify(s.status));
    Logger.log("[RUN_PROVIDERS_LIVE_V2] github_markdown status: " + JSON.stringify(g.status));
    Logger.log("[RUN_PROVIDERS_LIVE_V2] cybersecurity_jobs_sheet status: " + JSON.stringify(c.status));
    Logger.log("[RUN_PROVIDERS_LIVE_V2] handshake_rss status: " + JSON.stringify(h.status));
  
    var merged = []
      .concat(u.results || [])
      .concat(s.results || [])
      .concat(g.results || [])
      .concat(c.results || [])
      .concat(h.results || []);
  
    // NO v2FilterJobsByRelevance_ call here. If you have one on `merged` or
    // `filtered`, DELETE it — that's what's nuking USAJOBS rows.
  
    var filtered = v2FilterJobsBySearchType_(merged, req.search_type);
    filtered = v2FilterJobsByRemoteMode_(filtered, req.remote_mode);
    filtered = v2FilterJobsBySeniorityForNewGrad_(filtered, req);
    filtered = v2FilterJobsByProfessorshipRequiresPhD_(filtered, req);

    var matchedDegreeProfileKey = v2GetMatchedDegreeProfileKeyFromQuery_(req.original_query_text);
    filtered = v2RescoreForDegreeProfile_(filtered, matchedDegreeProfileKey);
  
    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] provider counts: " +
        JSON.stringify({
          usajobs: u.results.length,
          github_simplify: s.results.length,
          github_markdown: g.results.length,
          cybersecurity_jobs_sheet: c.results.length,
          merged: merged.length,
          search_type: req.search_type,
          after_search_type_filter: filtered.length
        })
    );
  
    var ranked = v2DedupeAndRankJobs_(filtered, req.query_text || "");
  
    var maxTotal = limit * 3;
  
    if (ranked.length > maxTotal) {
      ranked = ranked.slice(0, maxTotal);
    }
  
    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] final: " +
        JSON.stringify({
          final_count: ranked.length,
          search_type: req.search_type,
          sample: ranked.length ? ranked[0] : null
        })
    );
  
    return {
      results: ranked,
      provider_status: [
        u.status,
        s.status,
        g.status,
        c.status,
        h.status
      ]
    };
  }
  
  
  function v2FilterJobsByRemoteMode_(jobs, remoteMode) {
    jobs = Array.isArray(jobs) ? jobs : [];
  
    if (String(remoteMode || "").toLowerCase() !== "remote") {
      return jobs;
    }
  
    var out = [];
  
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];
  
      if (!job) {
        continue;
      }
  
      var blob = [job.location, job.title, job.workModel, job.source]
        .join(" ")
        .toLowerCase();
  
      if (
        blob.indexOf("remote") !== -1 ||
        blob.indexOf("anywhere in the u.s") !== -1 ||
        blob.indexOf("anywhere in the us") !== -1
      ) {
        out.push(job);
      }
    }
  
    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] remote filter: " +
        JSON.stringify({ before: jobs.length, after: out.length })
    );
  
    return out;
  }
  
  /**
   * Title-only, word-boundary check for clearly senior/leadership roles.
   * Deliberately narrow: only unambiguous seniority signals, not "Senior" by
   * itself doesn't get excluded when the requester is at bachelor's level
   * (only "Senior"/"Sr"/"Lead" — see SENIOR_OR_LEAD_TITLE_REGEX below).
   * Not "Staff" here either (ambiguous — used for both senior IC and generic
   * roles).
   */
  var SENIOR_TITLE_EXCLUDE_REGEX = /\b(director|vice president|vp|svp|evp|chief|head of|principal|president|manager)\b/i;
  var SENIOR_OR_LEAD_TITLE_REGEX = /\b(senior|sr\.?|lead)\b/i;
  
  function v2IsClearlySeniorTitle_(title) {
    return SENIOR_TITLE_EXCLUDE_REGEX.test(String(title || ""));
  }
  
  function v2IsSeniorOrLeadTitle_(title) {
    return SENIOR_OR_LEAD_TITLE_REGEX.test(String(title || ""));
  }
  
  /**
   * Classifies req.original_query_text against the same degree profiles
   * normalizeProgramQueryForProviders_ uses, so "Senior"/"Lead" titles can be
   * allowed for MS/PhD searches while still being excluded for bachelor's —
   * a Master's or PhD candidate is a reasonable fit for a senior-adjacent
   * role in a way a fresh BS grad usually isn't. Falls back to the phd/
   * doctorate/doctoral text check (same as v2QueryIndicatesPhD_) for free-text
   * queries that don't exactly match a known profile label. Unmatched,
   * non-phd-looking queries default to "bachelors" — this app's primary
   * audience is undergrads, so that's the safer default when the level can't
   * be positively identified as graduate.
   */
  function v2GetDegreeLevelFromQuery_(originalQueryText) {
    var q = String(originalQueryText || "").trim();
  
    if (!q) {
      return "unknown";
    }
  
    if (PHD_QUERY_REGEX.test(q)) {
      return "phd";
    }
  
    var normalizedInput = normalizeDegreeLookupKey_(q);
    var profiles = getDegreeSearchProfiles_();
  
    for (var key in profiles) {
      if (!Object.prototype.hasOwnProperty.call(profiles, key)) {
        continue;
      }
  
      var profile = profiles[key];
      var matched = normalizeDegreeLookupKey_(key) === normalizedInput;
  
      if (!matched) {
        for (var i = 0; i < profile.labels.length; i++) {
          if (normalizeDegreeLookupKey_(profile.labels[i]) === normalizedInput) {
            matched = true;
            break;
          }
        }
      }
  
      if (matched) {
        if (key.indexOf("phd") === 0) {
          return "phd";
        }
  
        if (key.indexOf("ms") === 0) {
          return "masters";
        }
  
        return "bachelors"; // bs* profiles and cs_* interdisciplinary undergrad combos
      }
    }
  
    return "bachelors";
  }
  
  /**
   * Same profile-matching approach as v2GetDegreeLevelFromQuery_, but returns
   * which INTERDISCIPLINARY_DOMAIN_PHRASES key (if any) the query matched —
   * "criminology"/"business"/"social_science" for cs_criminology/cs_business/
   * cs_social_sciences respectively, or null for every other query (including
   * plain "bscs" — a straight CS search shouldn't get criminology/business/
   * social-science jobs mixed in, only the double-major searches should).
   */
  function v2GetInterdisciplinaryDomainFromQuery_(originalQueryText) {
    var q = String(originalQueryText || "").trim();
  
    if (!q) {
      return null;
    }
  
    var normalizedInput = normalizeDegreeLookupKey_(q);
    var profiles = getDegreeSearchProfiles_();
  
    for (var key in INTERDISCIPLINARY_PROFILE_TO_DOMAIN) {
      if (!Object.prototype.hasOwnProperty.call(INTERDISCIPLINARY_PROFILE_TO_DOMAIN, key)) {
        continue;
      }
  
      var profile = profiles[key];
  
      if (!profile) {
        continue;
      }
  
      var matched = normalizeDegreeLookupKey_(key) === normalizedInput;
  
      if (!matched) {
        for (var i = 0; i < profile.labels.length; i++) {
          if (normalizeDegreeLookupKey_(profile.labels[i]) === normalizedInput) {
            matched = true;
            break;
          }
        }
      }
  
      if (matched) {
        return INTERDISCIPLINARY_PROFILE_TO_DOMAIN[key];
      }
    }

    return null;
  }

  /**
   * Same profile-label matching loop as v2GetDegreeLevelFromQuery_ and
   * v2GetInterdisciplinaryDomainFromQuery_, but scans EVERY degree profile
   * (not just the 3 interdisciplinary ones) and returns the matched profile
   * key itself, e.g. "bscys"/"bsit"/"cs_business". Used by
   * v2RescoreForDegreeProfile_ so every degree — not only the 3
   * interdisciplinary double-majors — gets scored against its own curated
   * `aliases` ("percentage of course" matching) instead of the shared
   * global phrase pool. Returns null for free-text queries that don't match
   * any curated profile — those keep whatever score their provider already
   * computed.
   */
  function v2GetMatchedDegreeProfileKeyFromQuery_(originalQueryText) {
    var q = String(originalQueryText || "").trim();

    if (!q) {
      return null;
    }

    var normalizedInput = normalizeDegreeLookupKey_(q);
    var profiles = getDegreeSearchProfiles_();

    for (var key in profiles) {
      if (!Object.prototype.hasOwnProperty.call(profiles, key)) {
        continue;
      }

      var profile = profiles[key];
      var matched = normalizeDegreeLookupKey_(key) === normalizedInput;

      if (!matched) {
        for (var i = 0; i < profile.labels.length; i++) {
          if (normalizeDegreeLookupKey_(profile.labels[i]) === normalizedInput) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        return key;
      }
    }

    return null;
  }

  /**
   * 0 (no match) to 1 (confident match) for how well `terms` shows up in
   * `blob`. One matching term already counts as a real signal (0.8); a
   * second distinct term pushes it to full confidence (1.0). Deliberately
   * NOT hits/terms.length — these lists have 15-20+ synonyms, so requiring a
   * large fraction of them to match would make even an obvious match (a
   * single "software engineer" or "business analyst" hit) score near zero.
   */
  function v2TermMatchStrength_(terms, blob) {
    if (!terms || !terms.length || !blob) {
      return 0;
    }
  
    var hits = 0;
  
    for (var i = 0; i < terms.length; i++) {
      if (blob.indexOf(String(terms[i]).toLowerCase()) !== -1) {
        hits++;
  
        if (hits >= 2) {
          break;
        }
      }
    }
  
    if (hits === 0) {
      return 0;
    }
  
    return hits === 1 ? 0.8 : 1;
  }
  
  /**
   * Re-scores every merged job (all 5 providers) against the matched degree
   * profile's own curated `aliases`, instead of the shared global phrase
   * pool every provider's baseline match_score comes from
   * (liveAdapterGetAllKnownJobPhrases_ merges every profile's vocabulary
   * together, so a bscp/bsit/etc. search previously scored jobs against ALL
   * degrees' terms combined, not its own). No-op when `profileKey` is null
   * (free-text queries that don't match any curated profile) — those keep
   * their provider's original score.
   *
   * For the 5 BSCS interdisciplinary double-majors (cs_business/
   * cs_criminology/cs_social_sciences/cs_economics/cs_anthropology,
   * identified by having `specialty_aliases`), the CS half and the specialty
   * half each contribute up to 50 points independently via
   * v2TermMatchStrength_, instead of one flat ratio over the combined
   * CS+specialty vocabulary (which is why "Business Intelligence Analyst"
   * was landing right at the ~50 baseline almost by accident — a huge
   * combined term list dilutes any single match). Matching only one half
   * lands ~40-50; matching both lands ~80-99.
   *
   * Every other degree profile has no `specialty_aliases`, so its full
   * `aliases` list is scored via v2PercentOfCourseMatchScore_, which shares
   * the same v2TermMatchStrength_ hit-based curve rather than a literal
   * percentage of the list (a real match against 1-2 terms in a 10+ term
   * synonym list is a full match, not 10-20% of one).
   */
  function v2RescoreForDegreeProfile_(jobs, profileKey) {
    jobs = Array.isArray(jobs) ? jobs : [];

    if (!profileKey) {
      return jobs;
    }

    var profiles = getDegreeSearchProfiles_();
    var profile = profiles[profileKey];

    if (!profile) {
      return jobs;
    }

    var specialtyTerms = profile.specialty_aliases || null;
    var coreTerms = specialtyTerms ? profiles.bscs.aliases : profile.aliases;

    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];

      if (!job) {
        continue;
      }

      // Preserve the provider's pre-rescore score so rankAndCapResults can
      // fall back to it if this profile's floor filters out every result.
      if (job._baseline_match_score == null) {
        job._baseline_match_score = job.match_score;
      }

      var blob = [job.title, job.company, job.location, job.source, job.description]
        .join(" ")
        .toLowerCase();

      if (specialtyTerms) {
        var coreStrength = v2TermMatchStrength_(coreTerms, blob);
        var specialtyStrength = v2TermMatchStrength_(specialtyTerms, blob);

        job.match_score = Math.max(
          1,
          Math.min(99, Math.round(50 * coreStrength + 50 * specialtyStrength))
        );
      } else {
        job.match_score = v2PercentOfCourseMatchScore_(coreTerms, blob);
      }
    }

    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] rescored " + jobs.length + " jobs for degree profile=" + profileKey
    );

    return jobs;
  }
  
  /**
   * Drops obviously senior/leadership titles (Director, VP, Chief, Head of,
   * Principal, Manager, President) when the request is a new-grad search —
   * and, for bachelor's-level new-grad searches specifically, also drops
   * plain "Senior"/"Sr"/"Lead" titles, which are fine for MS/PhD candidates
   * but not for a fresh BS grad. Scoped to employment_type === new_grad only
   * — internship and "any" searches are untouched.
   */
  function v2FilterJobsBySeniorityForNewGrad_(jobs, req) {
    jobs = Array.isArray(jobs) ? jobs : [];
    req = req || {};
  
    if (liveAdapterNormalizeEmploymentKind_(req.employment_type) !== "new_grad") {
      return jobs;
    }
  
    var degreeLevel = v2GetDegreeLevelFromQuery_(req.original_query_text);
    var excludeSeniorOrLead = degreeLevel !== "masters" && degreeLevel !== "phd";
  
    var out = [];
    var rejectedSamples = [];
  
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];
  
      if (!job) {
        continue;
      }
  
      var drop = v2IsClearlySeniorTitle_(job.title) ||
        (excludeSeniorOrLead && v2IsSeniorOrLeadTitle_(job.title));
  
      if (drop) {
        if (rejectedSamples.length < 10) {
          rejectedSamples.push(job.title || "");
        }
        continue;
      }
  
      out.push(job);
    }
  
    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] seniority filter (new_grad, degree_level=" + degreeLevel + "): " +
        JSON.stringify({ before: jobs.length, after: out.length, rejected_samples: rejectedSamples })
    );
  
    return out;
  }
  
  /**
   * Professorships/faculty positions, postdoctoral roles, AND any other title
   * that explicitly calls out a PhD requirement (e.g. "Data Scientist, Core
   * Data - PhD", "Research Scientist (PhD)") require a terminal degree —
   * they have no business showing up for a BS/new-grad/internship search
   * regardless of how loosely the title happens to match tech-domain
   * keywords. Unconditional: applies no matter what employment_type/
   * search_type is set to, since the rule isn't about career stage, it's
   * about the credential the role requires.
   */
  var PROFESSORSHIP_TITLE_REGEX = /\b(professor|faculty|post-?doc(toral)?)\b/i;
  var TITLE_REQUIRES_PHD_REGEX = /\b(ph\.?d\.?|doctorate|doctoral)\b/i;
  var PHD_QUERY_REGEX = /\b(phd|ph\.?d\.?|doctorate|doctoral)\b/i;

  function v2QueryIndicatesPhD_(originalQueryText) {
    return PHD_QUERY_REGEX.test(String(originalQueryText || ""));
  }

  function v2TitleRequiresPhD_(title) {
    var t = String(title || "");
    return PROFESSORSHIP_TITLE_REGEX.test(t) || TITLE_REQUIRES_PHD_REGEX.test(t);
  }

  function v2FilterJobsByProfessorshipRequiresPhD_(jobs, req) {
    jobs = Array.isArray(jobs) ? jobs : [];

    if (v2QueryIndicatesPhD_(req && req.original_query_text)) {
      return jobs;
    }

    var out = [];
    var rejectedSamples = [];

    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];

      if (!job) {
        continue;
      }

      if (v2TitleRequiresPhD_(job.title)) {
        if (rejectedSamples.length < 10) {
          rejectedSamples.push(job.title || "");
        }
        continue;
      }

      out.push(job);
    }

    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] professorship/postdoc/phd-title filter (non-phd query): " +
        JSON.stringify({ before: jobs.length, after: out.length, rejected_samples: rejectedSamples })
    );

    return out;
  }
  
  /* ============================================================
   * Safe provider wrappers
   * ============================================================ */
  
  function v2FetchUsaJobsSafe_(req, limit, expiry) {
    if (typeof fetchUsaJobsJobs_ !== "function") {
      return {
        results: [],
        status: {
          provider: "usajobs",
          mode: "live",
          success: false,
          error: "fetchUsaJobsJobs_ is not defined",
          row_count: 0
        }
      };
    }
  
    try {
      return fetchUsaJobsJobs_(req, limit, expiry);
    } catch (err) {
      return {
        results: [],
        status: {
          provider: "usajobs",
          mode: "live",
          success: false,
          error: err && err.message ? String(err.message) : String(err),
          row_count: 0
        }
      };
    }
  }
  
  function v2FetchSimplifySafe_(req, limit, expiry) {
    if (typeof fetchSimplifyJsonForLiveSearch_ !== "function") {
      return {
        results: [],
        status: {
          provider: "github_simplify",
          mode: "live",
          success: false,
          error: "fetchSimplifyJsonForLiveSearch_ is not defined",
          row_count: 0
        }
      };
    }
  
    try {
      return fetchSimplifyJsonForLiveSearch_(req, limit, expiry);
    } catch (err) {
      return {
        results: [],
        status: {
          provider: "github_simplify",
          mode: "live",
          success: false,
          error: err && err.message ? String(err.message) : String(err),
          row_count: 0
        }
      };
    }
  }
  
  function v2FetchGithubMarkdownSafe_(req, limit, expiry) {
    if (typeof fetchGithubMarkdownJobsForLiveSearch_ !== "function") {
      return {
        results: [],
        status: {
          provider: "github_markdown",
          mode: "live",
          success: false,
          error: "fetchGithubMarkdownJobsForLiveSearch_ is not defined",
          row_count: 0
        }
      };
    }
  
    try {
      return fetchGithubMarkdownJobsForLiveSearch_(req, limit, expiry);
    } catch (err) {
      return {
        results: [],
        status: {
          provider: "github_markdown",
          mode: "live",
          success: false,
          error: err && err.message ? String(err.message) : String(err),
          row_count: 0
        }
      };
    }
  }
  
  function v2FetchHandshakeRssSafe_(req, limit, expiry) {
    if (typeof fetchHandshakeRssJobs_ !== "function") {
      return {
        results: [],
        status: {
          provider: "handshake_rss",
          mode: "live",
          success: false,
          error: "fetchHandshakeRssJobs_ is not defined",
          row_count: 0
        }
      };
    }
  
    try {
      return fetchHandshakeRssJobs_(req, limit, expiry);
    } catch (err) {
      var msg = err && err.message ? String(err.message) : String(err);
      return {
        results: [],
        status: {
          provider: "handshake_rss",
          mode: "live",
          success: false,
          error: handshakeRedact_(msg),
          row_count: 0
        }
      };
    }
  }
  
  function v2FetchCybersecurityJobsSheetSafe_(req, limit, expiry) {
    if (typeof fetchCybersecurityJobsSheetForLiveSearch_ !== "function") {
      return {
        results: [],
        status: {
          provider: "cybersecurity_jobs_sheet",
          mode: "live",
          success: false,
          error: "fetchCybersecurityJobsSheetForLiveSearch_ is not defined",
          row_count: 0
        }
      };
    }
  
    try {
      return fetchCybersecurityJobsSheetForLiveSearch_(req, limit, expiry);
    } catch (err) {
      return {
        results: [],
        status: {
          provider: "cybersecurity_jobs_sheet",
          mode: "live",
          success: false,
          error: err && err.message ? String(err.message) : String(err),
          row_count: 0
        }
      };
    }
  }
  
  /* ============================================================
   * V2 result normalization / ranking
   * ============================================================ */
  
  function v2NormalizeProviderOut_(providerName, out) {
    out = out || {};
  
    var results = Array.isArray(out.results) ? out.results : [];
  
    var status = out.status || {
      provider: providerName,
      mode: "live",
      success: false,
      error: "Provider returned no status"
    };
  
    if (!status.provider) {
      status.provider = providerName;
    }
  
    if (!status.mode) {
      status.mode = "live";
    }
  
    if (status.row_count == null) {
      status.row_count = results.length;
    }
  
    return {
      results: results,
      status: status
    };
  }
  
  function v2DedupeAndRankJobs_(jobs, queryText) {
    jobs = Array.isArray(jobs) ? jobs : [];
  
    var seen = {};
    var out = [];
  
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];
  
      if (!job || !job.apply_url || !job.title) {
        continue;
      }
  
      var key = String(job.apply_url).toLowerCase();
  
      if (seen[key]) {
        continue;
      }
  
      seen[key] = true;
  
      if (job.match_score == null) {
        job.match_score = v2SimpleMatchScore_(
          queryText || "",
          [
            job.title,
            job.company,
            job.location,
            job.source,
            job.provider
          ].join(" ")
        );
      }
  
      out.push(job);
    }
  
    out.sort(function (a, b) {
      var scoreDiff = (b.match_score || 0) - (a.match_score || 0);
  
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
  
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  
    return out;
  }
  
  /**
   * 0-100 percentage score. handshake_rss rows reach this as their only
   * scorer (they don't set match_score themselves), and it also backstops any
   * other provider row missing a score, so it must stay on the same scale
   * MIN_MATCH_SCORE_PERCENT expects.
   *
   * Shares liveAdapterSimpleMatchScore_'s phrase-based approach (and its
   * liveAdapterGetAllKnownJobPhrases_ dictionary) instead of the old bare-word
   * tokenization — this was the same bug: splitting a curated query into single
   * words like "engineer"/"systems" let any "<Discipline> Engineer" posting
   * score ~75% off generic engineering vocabulary alone, and since Handshake
   * has no other scorer, its results were the most exposed to it.
   */
  function v2SimpleMatchScore_(queryText, blob) {
    var q = String(queryText || "").toLowerCase();
    var b = String(blob || "").toLowerCase();
  
    if (!q) {
      return 50;
    }
  
    var FLOOR = 10;
    var RANGE = 89;
  
    var knownPhrases = liveAdapterGetAllKnownJobPhrases_();
    var relevantPhrases = [];
  
    for (var i = 0; i < knownPhrases.length; i++) {
      if (q.indexOf(knownPhrases[i]) !== -1) {
        relevantPhrases.push(knownPhrases[i]);
      }
    }
  
    if (relevantPhrases.length) {
      var phraseHits = 0;
  
      for (var p = 0; p < relevantPhrases.length; p++) {
        if (b.indexOf(relevantPhrases[p]) !== -1) {
          phraseHits += 1;
        }
      }
  
      return Math.round(Math.min(99, FLOOR + (RANGE * phraseHits) / relevantPhrases.length));
    }
  
    var tokens = q
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(function (token) {
        return token.length > 1 && !v2IsLowSignalToken_(token);
      });
  
    if (!tokens.length) {
      return 50;
    }
  
    var weightedHits = 0;
  
    for (var t = 0; t < tokens.length; t++) {
      var token = tokens[t];
  
      if (b.indexOf(token) !== -1) {
        weightedHits += 1;
        continue;
      }
  
      var aliases = v2AliasesForToken_(token);
  
      for (var j = 0; j < aliases.length; j++) {
        if (b.indexOf(aliases[j]) !== -1) {
          weightedHits += 0.8;
          break;
        }
      }
    }
  
    return Math.round(Math.min(99, FLOOR + (RANGE * weightedHits) / tokens.length));
  }
  
  /*
   * v2AliasesForToken_ intentionally NOT defined here.
   * The real implementation lives in Util.js (DegreeQueryMapping.gs) and
   * delegates to getDegreeAliasesForToken_(), which covers every degree
   * profile. A stale hardcoded duplicate used to live in this file and was
   * silently shadowing that one for every query (Apps Script merges all
   * files into one global scope, so duplicate function names collide) —
   * see the warning at the top of Util.js. Do not re-add a copy here.
   */
  
  function v2IsLowSignalToken_(token) {
    var low = {
      internship: true,
      internships: true,
      intern: true,
      new: true,
      grad: true,
      graduate: true,
      graduated: true,
      already: true,
      summer: true,
      fall: true,
      spring: true,
      winter: true,
      "2026": true,
      "2027": true,
      job: true,
      jobs: true,
      role: true,
      roles: true,
      position: true,
      positions: true
    };
  
    return !!low[String(token || "").toLowerCase()];
  }
  
  function v2ToBoundedInt_(value, fallback, min, max) {
    var n = parseInt(value, 10);
  
    if (isNaN(n)) {
      n = fallback;
    }
  
    if (n < min) {
      n = min;
    }
  
    if (n > max) {
      n = max;
    }
  
    return n;
  }
  
  /* ============================================================
   * Debug/tests
   * ============================================================ */
  
  function debugRunProvidersLiveV2Direct_() {
    var out = runProvidersLiveV2_({
      query_text: "software engineer",
      location_text: "United States",
      employment_type: "Any",
      authorization: "US citizen / permanent resident",
      limit_per_provider: 20
    });
  
    Logger.log("[RUN_PROVIDERS_LIVE_V2_DIRECT] " + JSON.stringify(out, null, 2));
  }
  
  function v2NormalizeSearchType_(value) {
    var v = String(value || 'any').toLowerCase().trim();
  
    if (v === 'internship' || v === 'intern' || v === 'internships') {
      return 'internship';
    }
  
    if (
      v === 'job' ||
      v === 'jobs' ||
      v === 'fulltime' ||
      v === 'full-time' ||
      v === 'full_time' ||
      v === 'entry' ||
      v === 'entry-level' ||
      v === 'entry_level'
    ) {
      return 'job';
    }
  
    return 'any';
  }
  
  function v2JobLooksLikeInternship_(job) {
    return v2ClassifyJobRoleType_(job).role_type === "internship";
  }
  
  function v2FilterJobsBySearchType_(jobs, searchType) {
    jobs = Array.isArray(jobs) ? jobs : [];
    searchType = v2NormalizeSearchType_(searchType);
  
    if (searchType === "any") {
      return jobs;
    }
  
    var out = [];
    var rejectedSamples = [];
    var keptSamples = [];
  
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];
  
      if (!job) {
        continue;
      }
  
      var classification = v2ClassifyJobRoleType_(job);
      var keep = false;
  
      if (searchType === "internship") {
        keep = classification.role_type === "internship";
      } else if (searchType === "job") {
        keep = classification.role_type === "job";
      }
  
      if (keep) {
        out.push(job);
  
        if (keptSamples.length < 10) {
          keptSamples.push({
            title: job.title || "",
            source: job.source || "",
            provider: job.provider || "",
            role_type: classification.role_type,
            reason: classification.reason
          });
        }
      } else if (rejectedSamples.length < 10) {
        rejectedSamples.push({
          title: job.title || "",
          source: job.source || "",
          provider: job.provider || "",
          search_type: searchType,
          role_type: classification.role_type,
          reason: classification.reason
        });
      }
    }
  
    Logger.log(
      "[RUN_PROVIDERS_LIVE_V2] search_type filter: " +
        JSON.stringify({
          search_type: searchType,
          before: jobs.length,
          after: out.length,
          kept_samples: keptSamples,
          rejected_samples: rejectedSamples
        })
    );
  
    return out;
  }
  
  function v2ClassifyJobRoleType_(job) {
    job = job || {};
  
    var title = String(job.title || "").toLowerCase();
    var source = String(job.source || "").toLowerCase();
    var provider = String(job.provider || "").toLowerCase();
    var employmentType = String(job.employment_type || "").toLowerCase();
    var jobType = String(job.job_type || "").toLowerCase();
    var description = String(job.description || job.summary || "").toLowerCase();
  
    /*
     * Title-level internship signals.
     * These are trusted.
     */
    var titleHasInternshipSignal =
      /\bintern\b/.test(title) ||
      /\binternship\b/.test(title) ||
      /\binternships\b/.test(title) ||
      /\bco-op\b/.test(title) ||
      /\bco op\b/.test(title) ||
      /\bcoop\b/.test(title) ||
      /\bstudent trainee\b/.test(title) ||
      /\bsummer analyst\b/.test(title) ||
      /\bsummer associate\b/.test(title) ||
      /\bapprentice\b/.test(title) ||
      /\bapprenticeship\b/.test(title);
  
    if (titleHasInternshipSignal) {
      return {
        role_type: "internship",
        reason: "title_has_internship_signal"
      };
    }
  
    /*
     * Structured field internship signals.
     * These are trusted only if the provider actually supplies them as fields.
     * Do NOT include source here.
     */
    var structuredBlob = [
      employmentType,
      jobType
    ].join(" ");
  
    var structuredHasInternshipSignal =
      /\bintern\b/.test(structuredBlob) ||
      /\binternship\b/.test(structuredBlob) ||
      /\binternships\b/.test(structuredBlob) ||
      /\bco-op\b/.test(structuredBlob) ||
      /\bco op\b/.test(structuredBlob) ||
      /\bcoop\b/.test(structuredBlob) ||
      /\bstudent trainee\b/.test(structuredBlob) ||
      /\bapprentice\b/.test(structuredBlob) ||
      /\bapprenticeship\b/.test(structuredBlob);
  
    if (structuredHasInternshipSignal) {
      return {
        role_type: "internship",
        reason: "structured_field_has_internship_signal"
      };
    }
  
    /*
     * Everything below is job by default.
     * Source/feed names are too noisy to classify internships.
     */
    return {
      role_type: "job",
      reason: "default_job_no_title_or_structured_internship_signal"
    };
  }
  
  /**
   * Apply-link validation for external job APIs.
   */
  
  function normalizeHttpsUrl_(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var u = raw.trim();
    if (u.indexOf('http://') === 0) {
      u = 'https://' + u.substring(7);
    }
    if (u.indexOf('https://') !== 0) return '';
    try {
      var parsed = parseUrlLoose_(u);
      if (!parsed.host) return '';
      var h = parsed.host.toLowerCase();
      if (h === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(h)) return '';
      return u;
    } catch (e) {
      return '';
    }
  }
  
  function parseUrlLoose_(url) {
    var m = /^https:\/\/([^\/:?#]+)/i.exec(url);
    return { host: m ? m[1] : '' };
  }
  
  
  /**
   * DegreeQueryMapping.gs
   *
   * Centralized program/degree query expansion for live job search.
   *
   * Supports:
   * - BSCS, BSCP, BSCSE, BSAI, BSCYS, BSIT
   * - interdisciplinary CS combinations
   * - MSCS, MSCSE, MSCpE, MSAI, MSCYS
   * - PhD CSE, PhD Big Data Analytics
   *
   * Important:
   * Do not append duplicate versions of normalizeProgramQueryForProviders_,
   * liveAdapterGetJobQueryAliases_, or v2AliasesForToken_ elsewhere.
   * Replace the old versions with these.
   */
  
  /* ============================================================
   * Degree/program search profiles
   * ============================================================ */
  
  function getDegreeSearchProfiles_() {
    return {
      /* ---------------- Undergraduate ---------------- */
  
      bscs: {
        labels: [
          "bscs",
          "bs cs",
          "computer science",
          "computer science bscs",
          "computer science bs"
        ],
        provider_query: "computer science software engineer software developer backend frontend full stack web developer",
        aliases: [
          "computer science",
          "software engineer",
          "software engineering",
          "software developer",
          "developer",
          "backend",
          "frontend",
          "full stack",
          "web developer",
          "swe",
          // General technical/data skills that show up in a lot of real
          // job-duty text (not just literal "software engineer" titles) —
          // used as v2RescoreForDegreeProfile_'s shared CS-half
          // term set, so e.g. a "Management Analyst" posting whose duties
          // mention SQL/data analysis gets CS-half credit too, not just
          // whatever credit its specialty half earns.
          "sql",
          "database",
          "data analysis"
        ],
        usajobs_query: "software engineer"
      },
  
      bscp: {
        labels: [
          "bscp",
          "bs cp",
          "computer engineering",
          "computer engineering bscp",
          "computer engineering bs"
        ],
        provider_query: "computer engineering software engineer embedded systems firmware hardware systems engineer",
        aliases: [
          "computer engineering",
          "software engineer",
          "embedded systems",
          "embedded software",
          "firmware",
          "hardware",
          "systems engineer",
          "electrical engineering",
          "computer hardware"
        ],
        usajobs_query: "computer engineer"
      },
  
      bscse: {
        labels: [
          "bscse",
          "bs cse",
          "computer science engineering",
          "computer science and engineering",
          "computer science & engineering",
          "computer science & engineering bscse"
        ],
        provider_query: "computer science engineering software engineer systems engineer embedded systems software developer",
        aliases: [
          "computer science",
          "computer science engineering",
          "computer science and engineering",
          "software engineer",
          "software developer",
          "systems engineer",
          "embedded systems",
          "backend",
          "full stack",
          "swe"
        ],
        usajobs_query: "software engineer"
      },
  
      bsai: {
        labels: [
          "bsai",
          "bs ai",
          "artificial intelligence",
          "artificial intelligence bs",
          "artificial intelligence bsai"
        ],
        provider_query: "artificial intelligence machine learning ai ml software engineer data scientist ai engineer machine learning engineer",
        aliases: [
          "artificial intelligence",
          "machine learning",
          "ai",
          "ml",
          "ai engineer",
          "machine learning engineer",
          "data scientist",
          "data science",
          "software engineer",
          "python"
        ],
        usajobs_query: "artificial intelligence"
      },
  
      bscys: {
        labels: [
          "bscys",
          "bs cys",
          "cybersecurity",
          "cybersecurity bs",
          "cyber security",
          "cybersecurity bscys"
        ],
        provider_query: "cybersecurity cyber security information security infosec security analyst security engineer soc analyst",
        aliases: [
          "cybersecurity",
          "cyber security",
          "cyber",
          "information security",
          "infosec",
          "security analyst",
          "security engineer",
          "soc analyst",
          "incident response",
          "application security",
          "appsec",
          "network security"
        ],
        usajobs_query: "information security"
      },
  
      bsit: {
        labels: [
          "bsit",
          "bs it",
          "information technology",
          "information technology bs",
          "information technology bsit"
        ],
        provider_query: "information technology it support systems administrator network administrator cloud support devops help desk technical support",
        aliases: [
          "information technology",
          "it support",
          "technical support",
          "systems administrator",
          "system administrator",
          "network administrator",
          "cloud support",
          "help desk",
          "desktop support",
          "devops",
          "infrastructure"
        ],
        usajobs_query: "information technology"
      },
  
      /* ---------------- Interdisciplinary ---------------- */
  
      /*
       * These "cs_*" interdisciplinary profiles are BSCS + <specialty> double
       * majors, so their provider_query/aliases lead with the same core CS/SWE
       * terms as the bscs profile above, then add the specialty's own terms —
       * a search should return both general CS/software roles AND the
       * specialty-area roles, not just one half of the degree.
       */
      cs_business: {
        labels: [
          "bscsb",
          "computer science business",
          "computer science + business",
          "cs business",
          "cs + business",
          "computer science and business"
        ],
        provider_query: "computer science software engineer software developer backend frontend full stack web developer business analyst product analyst technical product manager data analyst business intelligence business development business operations operations manager management analyst business administration marketing coordinator sales operations financial analyst supply chain program manager data analysis data collection statistical analysis quantitative analysis reporting dashboards sql database",
        aliases: [
          "computer science",
          "software engineer",
          "software engineering",
          "software developer",
          "developer",
          "backend",
          "frontend",
          "full stack",
          "web developer",
          "swe",
          "business analyst",
          "product analyst",
          "technical product manager",
          "product manager",
          "data analyst",
          "business intelligence",
          "analytics",
          "technical consultant",
          "business development",
          "business operations",
          "operations manager",
          "management analyst",
          "business administration",
          "marketing coordinator",
          "marketing manager",
          "sales operations",
          "financial analyst",
          "hr business partner",
          "supply chain",
          "project coordinator",
          "program manager",
          "program coordinator",
          "data analysis",
          "data collection",
          "statistical analysis",
          "quantitative analysis",
          "reporting",
          "dashboards",
          "sql",
          "database"
        ],
        usajobs_query: "software engineer",
        usajobs_query_or: "business analyst",
        // Specialty half only (excludes the shared core CS terms above) — used
        // by v2RescoreForDegreeProfile_ to score the CS half and the
        // business half independently instead of one flat combined ratio.
        // Includes quantitative/data-duty vocabulary (data analysis, SQL,
        // reporting, ...) alongside job-title terms — real business-analyst-
        // style postings (e.g. federal "Management Analyst") describe this
        // work in their duties text, not in the title, so title-only terms
        // like "management analyst" were the only thing keeping these from
        // scoring near zero.
        specialty_aliases: [
          "business analyst",
          "product analyst",
          "technical product manager",
          "product manager",
          "data analyst",
          "business intelligence",
          "analytics",
          "technical consultant",
          "business development",
          "business operations",
          "operations manager",
          "management analyst",
          "business administration",
          "marketing coordinator",
          "marketing manager",
          "sales operations",
          "financial analyst",
          "hr business partner",
          "supply chain",
          "project coordinator",
          "program manager",
          "program coordinator",
          "data analysis",
          "data collection",
          "statistical analysis",
          "quantitative analysis",
          "reporting",
          "dashboards",
          "sql",
          "database"
        ]
      },
  
      cs_criminology: {
        labels: [
          "bscsc",
          "computer science criminology",
          "computer science + criminology",
          "cs criminology",
          "cs + criminology",
          "computer science and criminology"
        ],
        provider_query: "computer science software engineer software developer backend frontend full stack web developer cybersecurity digital forensics cybercrime security analyst intelligence analyst fraud analyst forensic analyst criminal justice criminology law enforcement corrections probation parole victim advocate crime analyst criminal investigator",
        aliases: [
          "computer science",
          "software engineer",
          "software engineering",
          "software developer",
          "developer",
          "backend",
          "frontend",
          "full stack",
          "web developer",
          "swe",
          "cybersecurity",
          "digital forensics",
          "cybercrime",
          "security analyst",
          "intelligence analyst",
          "fraud analyst",
          "forensic analyst",
          "incident response",
          "threat intelligence",
          "criminal justice",
          "criminology",
          "law enforcement",
          "corrections",
          "probation",
          "parole",
          "victim advocate",
          "victim services",
          "crime analyst",
          "criminal investigator",
          "fraud investigator",
          "forensic",
          "compliance investigator",
          "paralegal",
          "loss prevention"
        ],
        usajobs_query: "software engineer",
        usajobs_query_or: "criminal justice",
        specialty_aliases: [
          "cybersecurity",
          "digital forensics",
          "cybercrime",
          "security analyst",
          "intelligence analyst",
          "fraud analyst",
          "forensic analyst",
          "incident response",
          "threat intelligence",
          "criminal justice",
          "criminology",
          "law enforcement",
          "corrections",
          "probation",
          "parole",
          "victim advocate",
          "victim services",
          "crime analyst",
          "criminal investigator",
          "fraud investigator",
          "forensic",
          "compliance investigator",
          "paralegal",
          "loss prevention"
        ]
      },
  
      cs_social_sciences: {
        labels: [
          "bscsiss",
          "computer science interdisciplinary social sciences",
          "computer science + interdisciplinary social sciences",
          "cs interdisciplinary social sciences",
          "cs + interdisciplinary social sciences",
          "computer science and interdisciplinary social sciences"
        ],
        provider_query: "computer science software engineer software developer backend frontend full stack web developer data analyst ux researcher user researcher product analyst civic technology research analyst social science research assistant policy analyst social worker community outreach public health",
        aliases: [
          "computer science",
          "software engineer",
          "software engineering",
          "software developer",
          "developer",
          "backend",
          "frontend",
          "full stack",
          "web developer",
          "swe",
          "data analyst",
          "ux researcher",
          "user researcher",
          "product analyst",
          "research analyst",
          "civic technology",
          "human computer interaction",
          "hci",
          "social science",
          "research assistant",
          "policy analyst",
          "social worker",
          "community outreach",
          "public health",
          "sociology",
          "psychology",
          "nonprofit",
          "case manager",
          "counselor",
          "victim services"
        ],
        usajobs_query: "software engineer",
        usajobs_query_or: "social science",
        specialty_aliases: [
          "data analyst",
          "ux researcher",
          "user researcher",
          "product analyst",
          "research analyst",
          "civic technology",
          "human computer interaction",
          "hci",
          "social science",
          "research assistant",
          "policy analyst",
          "social worker",
          "community outreach",
          "public health",
          "sociology",
          "psychology",
          "nonprofit",
          "case manager",
          "counselor",
          "victim services"
        ]
      },
  
      cs_economics: {
        labels: [
          "computer science economics",
          "computer science + economics",
          "cs economics",
          "cs + economics",
          "computer science and economics"
        ],
        provider_query: "data analyst economic analyst business analyst quantitative analyst analytics software engineer financial technology",
        aliases: [
          "data analyst",
          "economic analyst",
          "business analyst",
          "quantitative analyst",
          "analytics",
          "software engineer",
          "financial technology",
          "fintech",
          "business intelligence"
        ],
        // CS half + specialty half, same OR-merge pattern as cs_business/
        // cs_criminology/cs_social_sciences (see fetchUsaJobsJobs_) — this
        // profile previously only ever searched USAJOBS for "data analyst",
        // never "software engineer", so a genuine CS-side USAJOBS role
        // never had a chance to surface.
        usajobs_query: "software engineer",
        usajobs_query_or: "data analyst",
        // Specialty half only (excludes the shared core CS terms, scored via
        // profiles.bscs.aliases instead) — same two-half match_score math as
        // cs_business/cs_criminology/cs_social_sciences (see
        // v2RescoreForDegreeProfile_): CS half and economics half each
        // contribute up to 50 points independently, so a pure economics role
        // (no CS terms at all) still lands ~40-50%, and a role hitting both
        // halves lands ~80-99%.
        specialty_aliases: [
          "data analyst",
          "economic analyst",
          "economist",
          "business analyst",
          "quantitative analyst",
          "analytics",
          "financial technology",
          "fintech",
          "business intelligence",
          "market research analyst",
          "financial analyst",
          "econometrics",
          "actuary",
          "underwriter",
          "cost analyst",
          "budget analyst",
          "economic research",
          "policy analyst"
        ]
      },
  
      cs_anthropology: {
        labels: [
          "computer science anthropology",
          "computer science + anthropology",
          "cs anthropology",
          "cs + anthropology",
          "computer science and anthropology"
        ],
        provider_query: "ux researcher user researcher human computer interaction product analyst data analyst software engineer",
        aliases: [
          "ux researcher",
          "user researcher",
          "human computer interaction",
          "hci",
          "product analyst",
          "data analyst",
          "software engineer",
          "research analyst"
        ],
        // Same CS-half/specialty-half OR-merge as cs_economics above.
        usajobs_query: "software engineer",
        usajobs_query_or: "user researcher",
        // Specialty half only — same two-half match_score math as
        // cs_economics above.
        specialty_aliases: [
          "ux researcher",
          "user researcher",
          "human computer interaction",
          "hci",
          "product analyst",
          "data analyst",
          "research analyst",
          "user experience researcher",
          "design researcher",
          "ethnographic research",
          "qualitative researcher",
          "market researcher",
          "anthropologist",
          "human factors researcher"
        ]
      },
  
      /* ---------------- Graduate ---------------- */
  
      mscs: {
        labels: [
          "mscs",
          "ms cs",
          "computer science ms",
          "computer science masters",
          "computer science master's",
          "computer science graduate"
        ],
        provider_query: "computer science software engineer backend engineer platform engineer systems engineer software developer",
        aliases: [
          "computer science",
          "software engineer",
          "backend engineer",
          "platform engineer",
          "systems engineer",
          "software developer",
          "distributed systems",
          "cloud",
          "swe"
        ],
        usajobs_query: "software engineer"
      },
  
      mscse: {
        labels: [
          "mscse",
          "ms cse",
          "computer science engineering ms",
          "computer science and engineering ms",
          "computer science & engineering ms"
        ],
        provider_query: "computer science engineering software engineer systems engineer platform engineer embedded systems",
        aliases: [
          "computer science engineering",
          "software engineer",
          "systems engineer",
          "platform engineer",
          "embedded systems",
          "software developer",
          "computer science"
        ],
        usajobs_query: "software engineer"
      },
  
      mscpe: {
        labels: [
          "mscpe",
          "ms cpe",
          "mscp e",
          "computer engineering ms",
          "computer engineering masters",
          "computer engineering graduate"
        ],
        provider_query: "computer engineering embedded systems firmware hardware systems engineer software engineer",
        aliases: [
          "computer engineering",
          "embedded systems",
          "firmware",
          "hardware",
          "systems engineer",
          "software engineer",
          "embedded software",
          "device engineer"
        ],
        usajobs_query: "computer engineer"
      },
  
      msai: {
        labels: [
          "msai",
          "ms ai",
          "artificial intelligence ms",
          "artificial intelligence masters",
          "artificial intelligence graduate"
        ],
        provider_query: "artificial intelligence machine learning ai ml machine learning engineer ai engineer data scientist software engineer",
        aliases: [
          "artificial intelligence",
          "machine learning",
          "ai",
          "ml",
          "machine learning engineer",
          "ai engineer",
          "data scientist",
          "data science",
          "software engineer",
          "python",
          "deep learning"
        ],
        usajobs_query: "artificial intelligence"
      },
  
      mscys: {
        labels: [
          "mscys",
          "ms cys",
          "cybersecurity ms",
          "cybersecurity masters",
          "cyber security ms",
          "cybersecurity graduate"
        ],
        provider_query: "cybersecurity cyber security information security security engineer security analyst threat intelligence incident response",
        aliases: [
          "cybersecurity",
          "cyber security",
          "information security",
          "infosec",
          "security engineer",
          "security analyst",
          "threat intelligence",
          "incident response",
          "soc analyst",
          "application security",
          "appsec"
        ],
        usajobs_query: "information security"
      },
  
      phd_cse: {
        labels: [
          "phd computer science and engineering",
          "computer science and engineering phd",
          "computer science & engineering phd",
          "phd cse",
          "cse phd"
        ],
        provider_query: "research scientist software engineer computer science machine learning systems distributed systems data scientist",
        aliases: [
          "research scientist",
          "software engineer",
          "computer science",
          "machine learning",
          "systems",
          "distributed systems",
          "data scientist",
          "applied scientist",
          "scientist"
        ],
        usajobs_query: "computer scientist"
      },
  
      phd_big_data: {
        labels: [
          "big data analytics phd",
          "phd big data analytics",
          "big data phd",
          "data analytics phd",
          "phd data science",
          "data science phd",
          "phdds"
        ],
        provider_query: "data scientist data engineer machine learning big data analytics research scientist applied scientist",
        aliases: [
          "data scientist",
          "data engineer",
          "machine learning",
          "big data",
          "analytics",
          "research scientist",
          "applied scientist",
          "business intelligence",
          "data analyst"
        ],
        usajobs_query: "data scientist"
      }
    };
  }
  
  /* ============================================================
   * Query normalization
   * ============================================================ */
  
  function normalizeProgramQueryForProviders_(queryText) {
    var q = String(queryText || "").trim();
  
    if (!q) {
      return "software engineer";
    }
  
    var normalizedInput = normalizeDegreeLookupKey_(q);
    var profiles = getDegreeSearchProfiles_();
  
    for (var key in profiles) {
      if (!Object.prototype.hasOwnProperty.call(profiles, key)) {
        continue;
      }
  
      var profile = profiles[key];
  
      for (var i = 0; i < profile.labels.length; i++) {
        if (normalizeDegreeLookupKey_(profile.labels[i]) === normalizedInput) {
          return profile.provider_query;
        }
      }
    }
  
    /*
     * Replace degree/program tokens inside longer search strings.
     * Example: "msai internship" -> "artificial intelligence machine learning ..."
     */
    var expanded = q;
  
    expanded = replaceDegreeTerm_(expanded, "bscs", profiles.bscs.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bs cs", profiles.bscs.provider_query);
    expanded = replaceDegreeTerm_(expanded, "mscs", profiles.mscs.provider_query);
    expanded = replaceDegreeTerm_(expanded, "ms cs", profiles.mscs.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "bscp", profiles.bscp.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bs cp", profiles.bscp.provider_query);
    expanded = replaceDegreeTerm_(expanded, "mscpe", profiles.mscpe.provider_query);
    expanded = replaceDegreeTerm_(expanded, "ms cpe", profiles.mscpe.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "bscse", profiles.bscse.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bs cse", profiles.bscse.provider_query);
    expanded = replaceDegreeTerm_(expanded, "mscse", profiles.mscse.provider_query);
    expanded = replaceDegreeTerm_(expanded, "ms cse", profiles.mscse.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "bsai", profiles.bsai.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bs ai", profiles.bsai.provider_query);
    expanded = replaceDegreeTerm_(expanded, "msai", profiles.msai.provider_query);
    expanded = replaceDegreeTerm_(expanded, "ms ai", profiles.msai.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "bscys", profiles.bscys.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bs cys", profiles.bscys.provider_query);
    expanded = replaceDegreeTerm_(expanded, "mscys", profiles.mscys.provider_query);
    expanded = replaceDegreeTerm_(expanded, "ms cys", profiles.mscys.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "bsit", profiles.bsit.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bs it", profiles.bsit.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "phdcse", profiles.phd_cse.provider_query);
    expanded = replaceDegreeTerm_(expanded, "phd cse", profiles.phd_cse.provider_query);
    expanded = replaceDegreeTerm_(expanded, "phd computer science and engineering", profiles.phd_cse.provider_query);
  
    expanded = replaceDegreeTerm_(expanded, "phdds", profiles.phd_big_data.provider_query);
    expanded = replaceDegreeTerm_(expanded, "phd data science", profiles.phd_big_data.provider_query);
    expanded = replaceDegreeTerm_(expanded, "phd big data analytics", profiles.phd_big_data.provider_query);
    expanded = replaceDegreeTerm_(expanded, "big data analytics phd", profiles.phd_big_data.provider_query);
  
    /*
     * Interdisciplinary double-majors (short code from the jobs.html degree
     * select, e.g. "bscsc python django" when skills text is appended — the
     * exact-label match above only fires when query_text is the bare code
     * with nothing else attached).
     */
    expanded = replaceDegreeTerm_(expanded, "bscsb", profiles.cs_business.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bscsc", profiles.cs_criminology.provider_query);
    expanded = replaceDegreeTerm_(expanded, "bscsiss", profiles.cs_social_sciences.provider_query);
  
    return expanded.replace(/\s+/g, " ").trim();
  }
  
  function normalizeDegreeLookupKey_(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\+/g, " and ")
      .replace(/\best\.?\b/g, "")
      .replace(/\bstarting\b/g, "")
      .replace(/\bfall\b/g, "")
      .replace(/\bspring\b/g, "")
      .replace(/\bsummer\b/g, "")
      .replace(/\bwinter\b/g, "")
      .replace(/\b20\d{2}\b/g, "")
      .replace(/[()]/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function replaceDegreeTerm_(text, term, replacement) {
    var escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var pattern = new RegExp("\\b" + escaped.replace(/\s+/g, "\\s+") + "\\b", "gi");
    return String(text || "").replace(pattern, replacement);
  }
  
  /* ============================================================
   * USAJOBS query normalization
   * ============================================================ */
  
  /**
   * Returns 1-2 short USAJOBS Keyword strings for a query. Must be called
   * with the SHORT original query text (e.g. "cs business"), not the fully
   * expanded provider_query — this is a profile-label lookup, so it never
   * matches anything if it's handed the already-expanded 20+ word string.
   *
   * Normally returns a single variant (profile.usajobs_query, or the
   * normalizeProgramQueryForProviders_ fallback for free-text queries that
   * don't match a known profile). For the BSCS interdisciplinary double-
   * majors, also returns profile.usajobs_query_or as a second variant — see
   * fetchUsaJobsJobs_, which queries USAJOBS once per variant and merges the
   * results, so "business OR computer science" is guaranteed by running two
   * independent short searches rather than trusting a single multi-word
   * Keyword string to behave as OR on USAJOBS's end.
   */
  function liveAdapterGetUsaJobsQueryVariants_(originalQueryText) {
    var q = String(originalQueryText || "").trim();
  
    if (!q) {
      return ["software engineer"];
    }
  
    var normalizedInput = normalizeDegreeLookupKey_(q);
    var profiles = getDegreeSearchProfiles_();
  
    for (var key in profiles) {
      if (!Object.prototype.hasOwnProperty.call(profiles, key)) {
        continue;
      }
  
      var profile = profiles[key];
  
      for (var i = 0; i < profile.labels.length; i++) {
        if (normalizeDegreeLookupKey_(profile.labels[i]) === normalizedInput) {
          var variants = [profile.usajobs_query || profile.provider_query];
  
          if (profile.usajobs_query_or) {
            variants.push(profile.usajobs_query_or);
          }
  
          return variants;
        }
      }
    }
  
    return [normalizeProgramQueryForProviders_(q)];
  }
  
  /* ============================================================
   * Alias lookup
   * ============================================================ */
  
  function getDegreeAliasesForToken_(token) {
    token = normalizeDegreeLookupKey_(token);
  
    var profiles = getDegreeSearchProfiles_();
  
    for (var key in profiles) {
      if (!Object.prototype.hasOwnProperty.call(profiles, key)) {
        continue;
      }
  
      var profile = profiles[key];
  
      if (normalizeDegreeLookupKey_(key) === token) {
        return profile.aliases || [];
      }
  
      for (var i = 0; i < profile.labels.length; i++) {
        if (normalizeDegreeLookupKey_(profile.labels[i]) === token) {
          return profile.aliases || [];
        }
      }
    }
  
    var genericAliases = {
      cs: profiles.bscs.aliases,
      cse: profiles.bscse.aliases,
      cpe: profiles.bscp.aliases,
      cys: profiles.bscys.aliases,
      cyber: profiles.bscys.aliases,
      cybersecurity: profiles.bscys.aliases,
      infosec: profiles.bscys.aliases,
      ai: profiles.bsai.aliases,
      ml: profiles.bsai.aliases,
      it: profiles.bsit.aliases,
      data: profiles.phd_big_data.aliases,
      analytics: profiles.phd_big_data.aliases,
      docker: [
        "docker",
        "kubernetes",
        "container",
        "containers",
        "devops",
        "platform",
        "cloud"
      ],
      developer: [
        "software engineer",
        "software developer",
        "developer"
      ],
      swe: [
        "software engineer",
        "software engineering",
        "software developer"
      ]
    };
  
    return genericAliases[token] || [];
  }
  
  function liveAdapterGetJobQueryAliases_(token) {
    return getDegreeAliasesForToken_(token);
  }
  
  function v2AliasesForToken_(token) {
    return getDegreeAliasesForToken_(token);
  }
  
  /**
   * Script properties, JSON responses, hashing.
   */
  
  function getProp_(key) {
    var p = PropertiesService.getScriptProperties().getProperty(key);
    return p != null ? String(p).trim() : '';
  }
  
  /** Shared by JobRanking and ProvidersLive (one global: works if JobRanking.gs is absent). */
  /**
   * Shares liveAdapterSimpleMatchScore_'s phrase-based approach — the old bare-
   * word split ("engineer", "systems", ...) let any "<Discipline> Engineer"
   * title score ~75% off generic engineering vocabulary alone, same bug as
   * that function had. Used by github_simplify's row builder (title only, no
   * description available from that feed).
   */
  function simpleMatchScore_(query, title) {
    var q = String(query || '').toLowerCase();
    var t = String(title || '').toLowerCase();
  
    if (!q || !t) {
      return 50;
    }
  
    var FLOOR = 10;
    var RANGE = 89;
  
    var knownPhrases = liveAdapterGetAllKnownJobPhrases_();
    var relevantPhrases = [];
  
    for (var i = 0; i < knownPhrases.length; i++) {
      if (q.indexOf(knownPhrases[i]) !== -1) {
        relevantPhrases.push(knownPhrases[i]);
      }
    }
  
    if (relevantPhrases.length) {
      var phraseHits = 0;
  
      for (var p = 0; p < relevantPhrases.length; p++) {
        if (t.indexOf(relevantPhrases[p]) !== -1) {
          phraseHits += 1;
        }
      }
  
      return Math.round(Math.min(99, FLOOR + (RANGE * phraseHits) / relevantPhrases.length));
    }
  
    var tokens = q
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 1;
      });
  
    if (!tokens.length) {
      return 50;
    }
  
    var hit = 0;
  
    for (var j = 0; j < tokens.length; j++) {
      if (t.indexOf(tokens[j]) !== -1) {
        hit++;
      }
    }
  
    return Math.round(Math.min(99, FLOOR + (RANGE * hit) / tokens.length));
  }
  
  function jsonOutClientError_(err) {
    var m = err && err.message ? String(err.message) : '';
    if (m === 'Unauthorized') return jsonOut({ error: 'Unauthorized' });
    if (m === 'Rate limit exceeded') return jsonOut({ error: 'Rate limit exceeded' });
    if (m === 'Bad request') return jsonOut({ error: 'Bad request' });
    Logger.log('[SEARCH] Unhandled error: ' + m);
    return jsonOut({ error: 'Internal error' });
  }
  
  function sha256Hex(text) {
    var digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      text,
      Utilities.Charset.UTF_8
    );
    var hex = '';
    for (var i = 0; i < digest.length; i++) {
      var b = (digest[i] + 256) % 256;
      hex += ('0' + b.toString(16)).slice(-2);
    }
    return hex;
  }
  
  /**
   * Apps Script cannot set arbitrary HTTP status codes on ContentService output
   * in a reliable way for clients; include error in body for 4xx-style cases.
   */
  function jsonOut(obj, statusCode) {
    var out = JSON.stringify(obj);
    if (statusCode && statusCode >= 400) {
      return ContentService.createTextOutput(out).setMimeType(
        ContentService.MimeType.JSON
      );
    }
    return ContentService.createTextOutput(out).setMimeType(
      ContentService.MimeType.JSON
    );
  }
  
  
  function v2NormalizeLiveProviderReq_(req) {
    var originalQuery = String(req.query_text || "").trim();
    var providerQuery = normalizeProgramQueryForProviders_(originalQuery);
  
    return {
      query_text: providerQuery,
      original_query_text: originalQuery,
      location_text: String(req.location_text || "").trim(),
      employment_type: String(req.employment_type || "").trim(),
      authorization: String(req.authorization || "").trim(),
      limit_per_provider: v2ToBoundedInt_(req.limit_per_provider, 8, 1, 50),
      min_pay: req.min_pay
    };
  }
  
  /**
   * API key gate, rate limit, request shape, and string sanitization.
   */
  
  function assertApiKey(body) {
    var expected = getProp_('WEBAPP_API_KEY');
    var hasKey =
      body &&
      body.api_key !== undefined &&
      body.api_key !== null &&
      String(body.api_key).length > 0;
    if (!expected) {
      if (hasKey) {
        throw new Error('Bad request');
      }
      return;
    }
    if (!body || body.api_key === undefined || body.api_key === null) {
      throw new Error('Unauthorized');
    }
    if (typeof body.api_key !== 'string') {
      throw new Error('Unauthorized');
    }
    var got = body.api_key.trim();
    if (!got.length || got.length > MAX_LEN.api_key) {
      throw new Error('Unauthorized');
    }
    if (got !== expected) {
      throw new Error('Unauthorized');
    }
  }
  
  function assertOnlyAllowedKeys_(obj, allowedList) {
    var allowed = {};
    for (var i = 0; i < allowedList.length; i++) {
      allowed[allowedList[i]] = true;
    }
    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; j++) {
      if (!allowed[keys[j]]) {
        throw new Error('Bad request');
      }
    }
  }
  
  function assertGetParamsAllowlisted_(params, allowlist) {
    params = params || {};
    allowlist = allowlist || {};
  
    for (var key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        if (!allowlist[key]) {
          Logger.log(
            "[SEARCH] Rejected GET param: " +
              JSON.stringify({
                rejected_key: key,
                allowed_keys: Object.keys(allowlist)
              })
          );
  
          throw new Error("Bad request");
        }
      }
    }
  }
  
  /**
   * Per-hour cap keyed by WEBAPP_API_KEY (or shared "anon" if no key configured).
   * Best-effort; no real client IP in Apps Script web apps.
   */
  function checkRateLimit_() {
    var propMax = getProp_('RATE_LIMIT_PER_HOUR');
    var max = propMax ? parseInt(propMax, 10) : 400;
    if (!isFinite(max) || max < 1) max = 400;
    var keyMaterial = getProp_('WEBAPP_API_KEY') || 'anon';
    var bucket = String(Math.floor(Date.now() / 3600000));
    var cacheKey = 'rl:' + sha256Hex(keyMaterial + '|' + bucket).slice(0, 32);
    var cache = CacheService.getScriptCache();
    var cur = cache.get(cacheKey);
    var n = cur ? parseInt(cur, 10) : 0;
    if (!isFinite(n)) n = 0;
    if (n >= max) {
      throw new Error('Rate limit exceeded');
    }
    cache.put(cacheKey, String(n + 1), 3600);
  }
  
  function hasMaliciousPattern_(s, opt) {
    opt = opt || {};
    var lower = s.toLowerCase();
    var patterns = [
      '<script',
      '</script',
      'javascript:',
      'data:text/html',
      'vbscript:',
      'onerror=',
      'onload=',
      'onfocus=',
      'onclick=',
      '<iframe',
      '<object',
      '<embed',
      'eval(',
      'expression(',
      '@import',
      'url(javascript',
      '{{',
      '${',
      ']]>',
      '<![CDATA['
    ];
    for (var i = 0; i < patterns.length; i++) {
      if (lower.indexOf(patterns[i]) !== -1) return true;
    }
    var maxSchemes = opt.allowExtraUrls ? 8 : 2;
    var schemeCount = (s.match(/:\/\//g) || []).length;
    if (schemeCount > maxSchemes) return true;
    return false;
  }
  
  function sanitizeTextField_(value, fieldName, options) {
    options = options || {};
    if (value === undefined || value === null || value === '') {
      return '';
    }
    if (typeof value !== 'string') {
      throw new Error('Bad request');
    }
    var s = value.trim();
    var max = MAX_LEN[fieldName];
    if (max == null) {
      max = 200;
    }
    if (s.length > max) {
      throw new Error('Bad request');
    }
    if (!options.allowMultiline && /[\r\n]/.test(s)) {
      throw new Error('Bad request');
    }
    if (options.allowMultiline) {
      var lines = s.split(/\r\n|\r|\n/);
      if (lines.length > 40) {
        throw new Error('Bad request');
      }
    }
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s)) {
      throw new Error('Bad request');
    }
    var patOpts = options.allowExtraUrls ? { allowExtraUrls: true } : {};
    if (hasMaliciousPattern_(s, patOpts)) {
      throw new Error('Bad request');
    }
    return s;
  }
  
  function validateJobSearchRequest(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return { ok: false, error: 'Bad request' };
    }
    try {
      var queryText = sanitizeTextField_(input.query_text, 'query_text', {});
      var locationText = sanitizeTextField_(input.location_text, 'location_text', {});
      if (!queryText) {
        return { ok: false, error: 'query_text is required' };
      }
      if (!locationText) {
        return { ok: false, error: 'location_text is required' };
      }
  
      var limit = normalizeLimit_(input.limit_per_provider);
      if (limit === null) {
        return { ok: false, error: 'limit_per_provider must be integer 1-20' };
      }
      var minPay = normalizeMinPay_(input.min_pay);
      if (input.min_pay !== undefined && input.min_pay !== null && input.min_pay !== '' && minPay === null) {
        return { ok: false, error: 'min_pay must be number' };
      }
  
      var employment =
        input.employment_type === undefined || input.employment_type === null || input.employment_type === ''
          ? ''
          : sanitizeTextField_(input.employment_type, 'employment_type', {});
      var remote =
        input.remote_mode === undefined || input.remote_mode === null || input.remote_mode === ''
          ? ''
          : sanitizeTextField_(input.remote_mode, 'remote_mode', {});
      var notes =
        input.notes === undefined || input.notes === null || input.notes === ''
          ? ''
          : sanitizeTextField_(input.notes, 'notes', { allowMultiline: true, allowExtraUrls: true });
      var authorization =
        input.authorization === undefined || input.authorization === null || input.authorization === ''
          ? ''
          : sanitizeTextField_(input.authorization, 'authorization', {});
  
      return {
        ok: true,
        value: {
          query_text: queryText,
          location_text: locationText,
          min_pay: minPay != null ? minPay : undefined,
          employment_type: employment || undefined,
          remote_mode: remote || undefined,
          notes: notes || undefined,
          authorization: authorization || undefined,
          limit_per_provider: limit != null ? limit : 8
        }
      };
    } catch (exc) {
      if (exc && exc.message === 'Bad request') {
        return { ok: false, error: 'Bad request' };
      }
      Logger.log('[VALIDATION] Unexpected error: ' + (exc && exc.message));
      throw exc;
    }
  }
  
  function normalizeMinPay_(v) {
    if (v === undefined || v === null || v === '') return null;
    var n = normalizeNumber_(v);
    if (n === null || Math.floor(n) !== n) return null;
    if (n < 0 || n > 10000000) return null;
    return n;
  }
  
  function normalizeNumber_(v) {
    if (v === undefined || v === null || v === '') return null;
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string' && v.trim()) {
      var n = Number(v);
      return isFinite(n) ? n : null;
    }
    return null;
  }
  
  function normalizeLimit_(v) {
    if (v === undefined || v === null || v === '') return 8;
    var n = normalizeNumber_(v);
    if (n === null || Math.floor(n) !== n) return null;
    if (n < 1 || n > MAX_LIMIT_PER_PROVIDER) return null;
    return n;
  }