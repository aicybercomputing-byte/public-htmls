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

function assertGetParamsAllowlisted_(param, allowMap) {
  for (var k in param) {
    if (Object.prototype.hasOwnProperty.call(param, k) && !allowMap[k]) {
      throw new Error('Bad request');
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
    // #region agent log
    Logger.log(
      'AGENT_06F350 ' +
        JSON.stringify({
          hypothesisId: 'H6',
          location: 'Validation.gs:validateJobSearchRequest',
          errMessage: exc && exc.message
        })
    );
    // #endregion
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
