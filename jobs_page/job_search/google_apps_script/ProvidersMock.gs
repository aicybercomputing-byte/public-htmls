/**
 * Mock/demo job rows and provider mode routing.
 */

function normalizeProviderMode(mode) {
  return String(mode || '').toLowerCase() === 'live' ? 'live' : 'mock';
}

function runProviders(req, mode) {
  if (mode === 'live') {
    return runProvidersLive_(req);
  }
  var expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  var location = req.location_text;
  var titleBase = req.query_text;
  var rows = [
    {
      result_id: Utilities.getUuid(),
      title: titleBase + ' Analyst',
      location: location,
      pay: '$78,000 - $96,000',
      apply_url: buildSafeApplyUrl_('linkedin.com', titleBase, location),
      provider: 'mock_linkedin',
      match_score: 87,
      expiry_at: expiry,
      source: 'Demonstration (not live listings)'
    },
    {
      result_id: Utilities.getUuid(),
      title: titleBase + ' Engineer',
      location: location,
      pay: '$92,000 - $118,000',
      apply_url: buildSafeApplyUrl_('indeed.com', titleBase, location),
      provider: 'mock_indeed',
      match_score: 91,
      expiry_at: expiry,
      source: 'Demonstration (not live listings)'
    },
    {
      result_id: Utilities.getUuid(),
      title: 'Junior ' + titleBase + ' Specialist',
      location: location,
      pay: '$66,000 - $82,000',
      apply_url: buildSafeApplyUrl_('ziprecruiter.com', titleBase, location),
      provider: 'mock_ziprecruiter',
      match_score: 82,
      expiry_at: expiry,
      source: 'Demonstration (not live listings)'
    }
  ];
  return {
    results: rows,
    provider_status: [
      { provider: 'mock_linkedin', mode: mode, success: true },
      { provider: 'mock_indeed', mode: mode, success: true },
      { provider: 'mock_ziprecruiter', mode: mode, success: true }
    ]
  };
}

function buildSafeApplyUrl_(host, query, location) {
  var allowed = { 'linkedin.com': 1, 'indeed.com': 1, 'ziprecruiter.com': 1 };
  var h = String(host).toLowerCase();
  if (!allowed[h]) h = 'linkedin.com';
  return (
    'https://' +
    h +
    '/jobs/search?q=' +
    encodeURIComponent(query) +
    '&l=' +
    encodeURIComponent(location)
  );
}
