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
