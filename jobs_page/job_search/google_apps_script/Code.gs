/**
 * Jobs API — Google Apps Script web app (mock job-search + cache; live = USAJOBS + Simplify JSON).
 *
 * This project is split across several .gs files (single global scope). See sibling files:
 *   Config, Util, Validation, JobRanking, UrlUtil, ProvidersMock, ProvidersLive.
 *
 * Deploy: Deploy > New deployment > Type: Web app
 *   Execute as: Me
 *   Who has access: Anyone (or your org, as needed)
 *
 * Secrets: Project Settings > Script properties (not in source).
 *   DEFAULT_PROVIDER_MODE  optional  "mock" | "live"  (default mock)
 *   WEBAPP_API_KEY         optional  if set, JSON body must include same "api_key"
 *   RATE_LIMIT_PER_HOUR    optional  max job-search requests per hour per key (default 400)
 *
 * CORS: Browser fetch() from another site (e.g. GitHub Pages) may be blocked.
 *   Use JSONP (GET + callback) from static pages. See README.md.
 */

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
        String(p[k] == null ? '' : p[k]).length +
        1;
    }
  }
  return n;
}

/**
 * JSONP: return callback(payload); as JavaScript when callback name is safe; else JSON.
 */
function jobSearchGetOutput_(out, callback) {
  var cb = callback == null ? '' : String(callback);
  // #region agent log
  var payload;
  try {
    payload = JSON.stringify(out);
  } catch (se) {
    Logger.log(
      'AGENT_06F350 ' +
        JSON.stringify({
          hypothesisId: 'H5',
          location: 'Code.gs:jobSearchGetOutput_',
          message: 'stringify failed',
          err: se && se.message
        })
    );
    throw se;
  }
  // #endregion
  if (cb && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(cb)) {
    return ContentService.createTextOutput(
      cb + '(' + payload + ');'
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOut(out);
}

function doGetJsonpError_(err, callback) {
  // #region agent log
  Logger.log(
    'AGENT_06F350 ' +
      JSON.stringify({
        hypothesisId: 'H0',
        location: 'Code.gs:doGetJsonpError_',
        errMessage: err && err.message,
        errName: err && err.name
      })
  );
  // #endregion
  var errBody = { error: 'Internal error' };
  var m = err && err.message ? String(err.message) : '';
  if (m === 'Unauthorized') errBody = { error: 'Unauthorized' };
  else if (m === 'Rate limit exceeded') errBody = { error: 'Rate limit exceeded' };
  else if (m === 'Bad request') errBody = { error: 'Bad request' };
  return jobSearchGetOutput_(errBody, callback);
}

function doGet(e) {
  e = e || { parameter: {} };
  var action = String(e.parameter.action || 'health').toLowerCase();
  var jsonpCallback = e.parameter.callback;
  try {
    if (action === 'health') {
      assertGetParamsAllowlisted_(e.parameter, { action: 1 });
      return jsonOut({ ok: true, service: 'jobs-api-gas' });
    }
    if (action === 'job-search') {
      assertGetParamsAllowlisted_(e.parameter, GET_JOB_SEARCH_PARAM_ALLOWLIST);
      if (getGetQueryStringLength_(e) > MAX_GET_QUERY_STRING_CHARS) {
        return jobSearchGetOutput_({ error: 'Bad request' }, jsonpCallback);
      }
      checkRateLimit_();
      var payload = {
        query_text: e.parameter.query_text || '',
        location_text: e.parameter.location_text || '',
        min_pay: e.parameter.min_pay ? Number(e.parameter.min_pay) : undefined,
        employment_type: e.parameter.employment_type || undefined,
        remote_mode: e.parameter.remote_mode || undefined,
        limit_per_provider: e.parameter.limit_per_provider
          ? Number(e.parameter.limit_per_provider)
          : undefined,
        notes: e.parameter.notes || undefined,
        authorization: e.parameter.authorization || undefined,
        api_key: e.parameter.api_key || undefined
      };
      assertApiKey(payload);
      var out = handleJobSearch(payload);
      return jobSearchGetOutput_(out, jsonpCallback);
    }
    return jsonOut({ error: 'Not found' }, 404);
  } catch (err) {
    // #region agent log
    Logger.log(
      'AGENT_06F350 ' +
        JSON.stringify({
          hypothesisId: 'H0',
          location: 'Code.gs:doGet:catch',
          action: action,
          errMessage: err && err.message,
          errName: err && err.name
        })
    );
    // #endregion
    if (
      action === 'job-search' &&
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
    var raw = (e.postData && e.postData.contents) || '{}';
    if (raw.length > MAX_POST_BODY_BYTES) {
      return jsonOut({ error: 'Bad request' });
    }
    var body = JSON.parse(raw);
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return jsonOut({ error: 'Bad request' });
    }
    if (Object.keys(body).length > MAX_JSON_KEYS) {
      return jsonOut({ error: 'Bad request' });
    }

    if (body.action === 'health') {
      assertOnlyAllowedKeys_(body, ['action']);
      if (String(body.action).toLowerCase() !== 'health') {
        return jsonOut({ error: 'Bad request' });
      }
      return jsonOut({ ok: true, service: 'jobs-api-gas' });
    }

    assertOnlyAllowedKeys_(body, JOB_SEARCH_KEYS);
    checkRateLimit_();
    assertApiKey(body);
    var out = handleJobSearch(body);
    return jsonOut(out);
  } catch (err) {
    // #region agent log
    Logger.log(
      'AGENT_06F350 ' +
        JSON.stringify({
          hypothesisId: 'H0',
          location: 'Code.gs:doPost:catch',
          errMessage: err && err.message,
          isSyntax: err instanceof SyntaxError
        })
    );
    // #endregion
    if (err instanceof SyntaxError) {
      return jsonOut({ error: 'Bad request' });
    }
    return jsonOutClientError_(err);
  }
}

function handleJobSearch(body) {
  var v = validateJobSearchRequest(body);
  if (!v.ok) {
    return { error: v.error };
  }
  var req = v.value;
  var requestId = Utilities.getUuid();
  var queryKey = 'query:' + sha256Hex(
    JSON.stringify({
      query_text: req.query_text.toLowerCase(),
      location_text: req.location_text.toLowerCase(),
      min_pay: req.min_pay != null ? req.min_pay : null,
      employment_type: req.employment_type != null ? req.employment_type : null,
      remote_mode: req.remote_mode != null ? req.remote_mode : null,
      notes: req.notes != null ? req.notes : null,
      authorization: req.authorization != null ? req.authorization : null,
      limit_per_provider: req.limit_per_provider != null ? req.limit_per_provider : 8
    })
  );

  var cache = CacheService.getScriptCache();
  var cachedRaw = cache.get(queryKey);
  if (cachedRaw) {
    var cached;
    var cacheUsable = false;
    try {
      cached = JSON.parse(cachedRaw);
      if (cached && Array.isArray(cached.results)) {
        cacheUsable = true;
      }
    } catch (pe) {
      // #region agent log
      Logger.log(
        'AGENT_06F350 ' +
          JSON.stringify({
            hypothesisId: 'H1',
            location: 'Code.gs:handleJobSearch:cache.parse',
            errMessage: pe && pe.message,
            note: 'falling through to live fetch'
          })
      );
      // #endregion
    }
    if (cacheUsable) {
      return {
        request_id: requestId,
        cache_hit: true,
        results: cached.results,
        provider_status: cached.provider_status || []
      };
    }
  }

  // #region agent log
  Logger.log(
    'AGENT_06F350 ' +
      JSON.stringify({
        hypothesisId: 'H2',
        location: 'Code.gs:handleJobSearch:preRunProviders',
        mode: normalizeProviderMode(getProp_('DEFAULT_PROVIDER_MODE'))
      })
  );
  // #endregion
  var mode = normalizeProviderMode(getProp_('DEFAULT_PROVIDER_MODE'));
  var providerOut = runProviders(req, mode);
  // #region agent log
  Logger.log(
    'AGENT_06F350 ' +
      JSON.stringify({
        hypothesisId: 'H2',
        location: 'Code.gs:handleJobSearch:postRunProviders',
        resultCount: providerOut.results && providerOut.results.length,
        providerCount:
          providerOut.provider_status && providerOut.provider_status.length
      })
  );
  // #endregion
  var ranked = rankAndCapResults(providerOut.results, req.limit_per_provider);
  // #region agent log
  Logger.log(
    'AGENT_06F350 ' +
      JSON.stringify({
        hypothesisId: 'H4',
        location: 'Code.gs:handleJobSearch:postRank',
        rankedCount: ranked && ranked.length
      })
  );
  // #endregion

  var payloadStr = JSON.stringify({
    results: ranked,
    provider_status: providerOut.provider_status
  });
  var maxV =
    typeof MAX_SCRIPT_CACHE_VALUE_BYTES === 'number'
      ? MAX_SCRIPT_CACHE_VALUE_BYTES
      : 100 * 1024;
  if (payloadStr.length > maxV) {
    // #region agent log
    Logger.log(
      'AGENT_06F350 ' +
        JSON.stringify({
          hypothesisId: 'H3',
          location: 'Code.gs:handleJobSearch:cache.put:skip',
          reason: 'payload too large',
          bytes: payloadStr.length,
          maxBytes: maxV
        })
    );
    // #endregion
  } else {
    try {
      cache.put(queryKey, payloadStr, QUERY_CACHE_TTL_SEC);
    } catch (ce) {
      // #region agent log
      Logger.log(
        'AGENT_06F350 ' +
          JSON.stringify({
            hypothesisId: 'H3',
            location: 'Code.gs:handleJobSearch:cache.put',
            errMessage: ce && ce.message,
            note: 'continuing without cache'
          })
      );
      // #endregion
    }
  }

  return {
    request_id: requestId,
    cache_hit: false,
    results: ranked,
    provider_status: providerOut.provider_status
  };
}
