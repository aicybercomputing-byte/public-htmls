/**
 * Manual test: run from the Apps Script editor (select function → Run).
 * View output: View → Logs, or Executions → click the run → Logs.
 *
 * Exercises the same live path as the web app: USAJOBS + Simplify (GitHub JSON),
 * then dedupeAndRankJobs_ + rankAndCapResults.
 *
 * Script properties: USAJOBS_API_KEY, USAJOBS_USER_AGENT (USAJOBS only; Simplify is public).
 */

function debugLogLiveSearch() {
  var req = {
    query_text: 'cybersecurity',
    location_text: 'Florida',
    limit_per_provider: 5
  };
  var expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  var limit = req.limit_per_provider != null ? req.limit_per_provider : 8;

  Logger.log(
    'debug live providers | query=%s location=%s limit=%s',
    req.query_text,
    req.location_text,
    limit
  );

  var u = fetchUsaJobsJobs_(req, limit, expiry);
  Logger.log('USAJOBS status: %s', JSON.stringify(u.status));
  debugLogJobRows_('USAJOBS', u.results, 15);

  var g = fetchSimplifyJsonForLiveSearch_(req, limit, expiry);
  Logger.log('Simplify (GitHub JSON) status: %s', JSON.stringify(g.status));
  debugLogJobRows_('Simplify (github_simplify)', g.results, 15);

  var merged = dedupeAndRankJobs_(u.results.concat(g.results), req.query_text);
  Logger.log('provider_status (same as runProvidersLive_): %s', JSON.stringify([u.status, g.status]));
  debugLogJobRows_('Merged + deduped (dedupeAndRankJobs_)', merged, 20);

  var capped = rankAndCapResults(merged, limit);
  debugLogJobRows_('After rankAndCap (API-shaped list)', capped, 25);
}

/** @deprecated use debugLogLiveSearch — name kept for old editor shortcuts */
function debugLogUsaJobsSearch() {
  debugLogLiveSearch();
}

function debugLogJobRows_(label, results, maxShown) {
  maxShown = maxShown != null ? maxShown : 15;
  Logger.log('--- %s (n=%s) ---', label, results.length);
  var max = Math.min(results.length, maxShown);
  for (var i = 0; i < max; i++) {
    var r = results[i];
    Logger.log(
      '[%s] %s | %s | %s | %s',
      i + 1,
      r.provider || '(no provider)',
      r.title,
      r.location || '(no location)',
      r.apply_url || '(no url)'
    );
  }
  if (results.length > max) {
    Logger.log('... %s more not shown', results.length - max);
  }
}
