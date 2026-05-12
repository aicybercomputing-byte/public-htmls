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

function rankAndCapResults(results, limitPerProvider) {
  limitPerProvider = limitPerProvider || 8;
  var byProv = {};
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var p = r.provider;
    if (!byProv[p]) byProv[p] = [];
    byProv[p].push(r);
  }
  var providers = Object.keys(byProv);
  for (var j = 0; j < providers.length; j++) {
    byProv[providers[j]].sort(function (a, b) {
      return b.match_score - a.match_score;
    });
  }
  var capped = [];
  for (var k = 0; k < providers.length; k++) {
    capped.push([providers[k], byProv[providers[k]].slice(0, limitPerProvider)]);
  }
  var interleaved = [];
  var idx = 0;
  var remaining = true;
  while (remaining) {
    remaining = false;
    for (var m = 0; m < capped.length; m++) {
      var list = capped[m][1];
      if (idx < list.length) {
        interleaved.push(list[idx]);
        remaining = true;
      }
    }
    idx++;
  }
  return interleaved;
}
