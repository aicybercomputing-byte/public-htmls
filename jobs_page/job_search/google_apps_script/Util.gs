/**
 * Script properties, JSON responses, hashing.
 */

function getProp_(key) {
  var p = PropertiesService.getScriptProperties().getProperty(key);
  return p != null ? String(p).trim() : '';
}

/** Shared by JobRanking and ProvidersLive (one global: works if JobRanking.gs is absent). */
function simpleMatchScore_(query, title) {
  var q = String(query || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(function (w) {
      return w.length > 1;
    });
  var t = String(title || '').toLowerCase();
  if (!q.length || !t) return 50;
  var hit = 0;
  for (var i = 0; i < q.length; i++) {
    if (t.indexOf(q[i]) !== -1) hit++;
  }
  return Math.min(99, Math.round(50 + (50 * hit) / q.length));
}

function jsonOutClientError_(err) {
  var m = err && err.message ? String(err.message) : '';
  if (m === 'Unauthorized') return jsonOut({ error: 'Unauthorized' });
  if (m === 'Rate limit exceeded') return jsonOut({ error: 'Rate limit exceeded' });
  if (m === 'Bad request') return jsonOut({ error: 'Bad request' });
  // #region agent log
  Logger.log(
    'AGENT_06F350 ' +
      JSON.stringify({
        hypothesisId: 'H0',
        location: 'Util.gs:jsonOutClientError_',
        errMessage: m,
        errName: err && err.name
      })
  );
  // #endregion
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
