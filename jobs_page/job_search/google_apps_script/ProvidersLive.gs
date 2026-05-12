/**
 * Live job search: USAJOBS + Simplify JSON (github_jobs.gs). Same JobRow for cards + ranking.
 */

function runProvidersLive_(req) {
  // #region agent log
  try {
    Logger.log(
      'AGENT_06F350 ' +
        JSON.stringify({
          hypothesisId: 'H2',
          location: 'ProvidersLive.gs:runProvidersLive_:entry',
          hasReq: !!req
        })
    );
  } catch (e) {}
  // #endregion
  var expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  var limit = req.limit_per_provider != null ? req.limit_per_provider : 8;
  var u = fetchUsaJobsJobs_(req, limit, expiry);
  var g = fetchSimplifyJsonForLiveSearch_(req, limit, expiry);
  var merged = u.results.concat(g.results);
  var allResults = dedupeAndRankJobs_(merged, req.query_text);
  return { results: allResults, provider_status: [u.status, g.status] };
}

function fetchUsaJobsJobs_(req, limit, expiry) {
  var authKey = getProp_('USAJOBS_API_KEY');
  var userAgent = getProp_('USAJOBS_USER_AGENT');
  if (!authKey || !userAgent) {
    return {
      results: [],
      status: { provider: 'usajobs', mode: 'live', success: false, error: 'Not configured' }
    };
  }
  var perPage = Math.min(Math.max(limit, 1), 25);
  var qUrl =
    'https://data.usajobs.gov/api/search?Keyword=' +
    encodeURIComponent(req.query_text) +
    '&LocationName=' +
    encodeURIComponent(req.location_text) +
    '&ResultsPerPage=' +
    encodeURIComponent(String(perPage));
  if (req.min_pay != null) {
    qUrl += '&RemunerationMinimumAmount=' + encodeURIComponent(String(req.min_pay));
  }
  try {
    var res = UrlFetchApp.fetch(qUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true,
      headers: {
        'User-Agent': userAgent,
        'Authorization-Key': authKey
      }
    });
    if (res.getResponseCode() !== 200) {
      return {
        results: [],
        status: {
          provider: 'usajobs',
          mode: 'live',
          success: false,
          error: 'HTTP ' + res.getResponseCode()
        }
      };
    }
    var data = JSON.parse(res.getContentText());
    var sr = data.SearchResult || {};
    var items = sr.SearchResultItems || [];
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var d = items[i].MatchedObjectDescriptor || {};
      var title = d.PositionTitle ? String(d.PositionTitle) : '';
      var loc = d.PositionLocationDisplay ? String(d.PositionLocationDisplay) : '';
      var apply = normalizeHttpsUrl_(d.PositionURI ? String(d.PositionURI) : '');
      if (!title || !apply) continue;
      var pay = '';
      rows.push({
        result_id: 'usajobs-' + String(d.PositionID || items[i].MatchedObjectId || Utilities.getUuid()),
        title: title,
        location: loc,
        pay: pay,
        apply_url: apply,
        provider: 'usajobs',
        match_score: simpleMatchScore_(req.query_text, title),
        expiry_at: expiry,
        source: 'Federal (USAJOBS)'
      });
    }
    return {
      results: rows,
      status: { provider: 'usajobs', mode: 'live', success: true }
    };
  } catch (err) {
    return {
      results: [],
      status: {
        provider: 'usajobs',
        mode: 'live',
        success: false,
        error: 'Request failed'
      }
    };
  }
}
