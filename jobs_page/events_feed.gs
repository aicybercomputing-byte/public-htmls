/**
 * Aggregates Bellini Modern Campus RSS + Bulls Connect iCal feeds into one JSON payload
 * for the careers page events tab.
 *
 * Standalone deployment: pair with `CalendarWebApp.gs` — see `calendar_webapp/README.md`.
 * Or wire from another `doGet`: `if (action === 'events') return handleEventsDoGet_(e);`
 *
 * Script properties (optional):
 *   EVENT_RSS_URL     — defaults to Bellini calendar RSS below
 *   EVENT_ICS_URLS    — newline- or comma-separated iCal URLs (overrides built-in list)
 *   WEBAPP_API_KEY    — if set, require matching api_key query param (same as job search)
 */

var EVENT_CACHE_TTL_SEC = 900;//
var EVENT_CAL_NAMESPACE = 'https://moderncampus.com/Data/cal/';

var EVENT_RSS_DEFAULT =
  'https://api.calendar.moderncampus.net/pubcalendar/03614054-50cb-4e9d-82e6-3565ba147743/rss?category=c0644e48-3ab7-417a-ba2e-721c91fdc0c4&url=' +
  encodeURIComponent('https://www.usf.edu/ai-cybersecurity-computing/calendar/') +
  '&hash=true';

var EVENT_ICS_DEFAULT = [
  'https://bullsconnect.usf.edu/ical/usf/ical_club_57730.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_71655.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58058.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58068.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58136.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58449.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58513.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58740.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_58746.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_71529.ics',
  'https://bullsconnect.usf.edu/ical/usf/ical_club_61992.ics'
];

function getEventsProp_(key) {
  var p = PropertiesService.getScriptProperties().getProperty(key);
  return p != null ? String(p).trim() : '';
}

function getEventFeedUrls_() {
  var rss = getEventsProp_('EVENT_RSS_URL') || EVENT_RSS_DEFAULT;
  var rawList = getEventsProp_('EVENT_ICS_URLS');
  var ics = EVENT_ICS_DEFAULT.slice();
  if (rawList) {
    ics = rawList
      .split(/[\r\n,]+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s.length > 0;
      });
  }
  //Logger.log({ rss: rss, ics: ics });
  return { rss: rss, ics: ics };
}

/**
 * Called from Code.gs doGet when action === 'events'.
 * GET params: action=events, optional api_key, optional callback for JSONP.
 */
function handleEventsDoGet_(e) {
  e = e || { parameter: {} };
  try {
    eventsAssertApiKeyParam_(e.parameter);
    if (typeof checkRateLimit_ === 'function') {
      checkRateLimit_();
    }

    var cache = CacheService.getScriptCache();
    var ck = 'career-events:v2';
    var cached = cache.get(ck);
    if (cached) {
      return eventsFinishResponse_(e.parameter, JSON.parse(cached));
    }

    var urls = getEventFeedUrls_();
    Logger.log(urls);
    var merged = [];
    var fetchErrors = [];

    try {
      merged = merged.concat(fetchAndParseRssEvents_(urls.rss));
    } catch (err) {
      fetchErrors.push({
        url: urls.rss,
        error: err && err.message ? String(err.message) : 'RSS failed'
      });
    }

    for (var i = 0; i < urls.ics.length; i++) {
      var u = urls.ics[i];
      try {
        merged = merged.concat(fetchAndParseIcsEvents_(u));
      } catch (err2) {
        fetchErrors.push({
          url: u,
          error: err2 && err2.message ? String(err2.message) : 'iCal failed'
        });
      }
    }

    merged = dedupeEvents_(merged);
    merged.sort(function (a, b) {
      return String(a.start_iso).localeCompare(String(b.start_iso));
    });

    var now = Date.now();
    merged = merged.filter(function (ev) {
      var t = Date.parse(ev.end_iso || ev.start_iso);
      return !isNaN(t) && t >= now - 86400000;
    });

    if (merged.length > 120) {
      merged = merged.slice(0, 120);
    }

    var payload = { ok: true, events: merged, fetch_errors: fetchErrors };
    cache.put(ck, JSON.stringify(payload), EVENT_CACHE_TTL_SEC);
    return eventsFinishResponse_(e.parameter, payload);
  } catch (err) {
    var msg = err && err.message ? String(err.message) : 'Internal error';
    if (msg === 'Unauthorized') {
      return eventsFinishResponse_(e.parameter, { error: 'Unauthorized' });
    }
    return eventsFinishResponse_(e.parameter, { error: 'events_failed', detail: msg });
  }
}

function eventsAssertApiKeyParam_(param) {
  var expected = getEventsProp_('WEBAPP_API_KEY');
  var got = param.api_key ? String(param.api_key).trim() : '';
  if (!expected) {
    if (got) throw new Error('Bad request');
    return;
  }
  if (!got || got !== expected) throw new Error('Unauthorized');
}

function eventsFinishResponse_(parameter, payload) {
  var callback = parameter.callback;
  var body = JSON.stringify(payload);
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(String(callback))) {
    return ContentService.createTextOutput(callback + '(' + body + ');').setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function fetchAndParseRssEvents_(url) {
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    validateHttpsCertificates: true,
    headers: { 'User-Agent': 'BelliniCareersCalendar/1 (Google Apps Script)' }
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('HTTP ' + res.getResponseCode());
  }
  var xmlText = res.getContentText();
  if (xmlText.charCodeAt(0) === 0xfeff) {
    xmlText = xmlText.slice(1);
  }
  return parseModerncampusRss_(xmlText);
}

function fetchAndParseIcsEvents_(url) {
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    validateHttpsCertificates: true,
    headers: { 'User-Agent': 'BelliniCareersCalendar/1 (Google Apps Script)' }
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('HTTP ' + res.getResponseCode());
  }
  return parseIcsCalendar_(res.getContentText(), shortOrgLabel_(url));
}

function shortOrgLabel_(url) {
  var m = /ical_club_(\d+)/.exec(url);
  return m ? 'Org calendar ' + m[1] : 'Student org';
}

function parseModerncampusRss_(xmlText) {
  var doc = XmlService.parse(xmlText);
  var root = doc.getRootElement();
  var channel = root.getChild('channel');
  if (!channel) {
    throw new Error('RSS missing channel');
  }
  var nsCal = XmlService.getNamespace('cal', EVENT_CAL_NAMESPACE);
  var items = channel.getChildren('item');
  var out = [];
  var tzLabEl = channel.getChild('timezoneLabel', nsCal);
  var tzDisplay = tzLabEl ? tzLabEl.getText().trim() : 'ET';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var titleEl = item.getChild('title');
    var title = titleEl ? stripHtml_(titleEl.getText()) : '';
    var linkEl = item.getChild('link');
    var link = linkEl ? linkEl.getText().trim() : '';
    var startEl = item.getChild('start', nsCal);
    var endEl = item.getChild('end', nsCal);
    var locBuilding = item.getChild('location', nsCal);
    var locRoom = item.getChild('locationRoom', nsCal);
    var startIso = startEl ? isoFromModerncampusInstant_(startEl.getText()) : '';
    var endIso = endEl ? isoFromModerncampusInstant_(endEl.getText()) : '';
    var locParts = [];
    if (locBuilding && locBuilding.getText()) locParts.push(locBuilding.getText().trim());
    if (locRoom && locRoom.getText()) locParts.push(locRoom.getText().trim());
    var location = locParts.join(' — ');
    if (!title || !startIso) continue;

    var classified = classifyEvent_(title, '');
    out.push({
      id: 'rss-' + hash32_(title + '|' + startIso),
      title: title,
      start_iso: startIso,
      end_iso: endIso || startIso,
      location: location,
      link: link,
      source: 'Bellini calendar (RSS)',
      ev_type: classified.type,
      badge_label: classified.label,
      meta_line: buildMetaLine_(startIso, endIso, location, tzDisplay)
    });
  }
  return out;
}

function isoFromModerncampusInstant_(s) {
  s = String(s || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    try {
      var d = new Date(s);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch (e) {}
  }
  return '';
}

function stripHtml_(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseIcsCalendar_(icsText, sourceLabel) {
  var unfolded = unfoldIcsLines_(icsText);
  var text = unfolded.join('\n');
  var events = [];
  var re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  var m;
  while ((m = re.exec(text)) !== null) {
    var block = m[1];
    var dtstart = extractIcsProp_(block, 'DTSTART');
    var dtend = extractIcsProp_(block, 'DTEND');
    var summary = extractIcsProp_(block, 'SUMMARY');
    var location = extractIcsProp_(block, 'LOCATION');
    var url = extractIcsProp_(block, 'URL') || '';

    var title = stripHtml_(summary.replace(/\\,/g, ',').replace(/\\n/g, ' '));
    if (!title) continue;

    var startIso = parseIcsDtLineToIso_(dtstart);
    var endIso = dtend ? parseIcsDtLineToIso_(dtend) : '';
    if (!startIso) continue;
    if (!endIso) endIso = startIso;

    var classified = classifyEvent_(title, '');
    events.push({
      id: 'ics-' + hash32_(title + '|' + startIso + '|' + sourceLabel),
      title: title,
      start_iso: startIso,
      end_iso: endIso,
      location: stripHtml_(location.replace(/\\,/g, ',').replace(/\\n/g, ' ')),
      link: url,
      source: sourceLabel,
      ev_type: classified.type,
      badge_label: classified.label,
      meta_line: buildMetaLine_(startIso, endIso, location ? stripHtml_(location) : '', 'local')
    });
  }
  return events;
}

function unfoldIcsLines_(text) {
  var lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.length === 0) continue;
    var ch = line.charAt(0);
    if ((ch === ' ' || ch === '\t') && out.length) {
      out[out.length - 1] += line.substring(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function extractIcsProp_(block, propName) {
  var re = new RegExp('^' + propName + '(?:[^:\\\\r\\n]*?):([^\\r\\n]*)', 'mi');
  var m = re.exec(block);
  return m ? m[1].trim() : '';
}

function parseIcsDtLineToIso_(rawLine) {
  if (!rawLine) return '';
  var line = String(rawLine);
  var idx = line.lastIndexOf(':');
  if (idx === -1) return '';
  var val = line.substring(idx + 1).trim();

  if (/^\d{8}$/.test(val)) {
    var y0 = parseInt(val.slice(0, 4), 10);
    var mo0 = parseInt(val.slice(4, 6), 10);
    var d0 = parseInt(val.slice(6, 8), 10);
    return new Date(Date.UTC(y0, mo0 - 1, d0, 12, 0, 0)).toISOString();
  }

  if (/^\d{8}T\d{6}Z$/.test(val)) {
    return parseCompactUtc_(val);
  }

  /** Floating local time — interpreted in the script timezone (set project to America/New_York for USF). */
  if (/^\d{8}T\d{6}$/.test(val)) {
    var y = parseInt(val.slice(0, 4), 10);
    var mo = parseInt(val.slice(4, 6), 10) - 1;
    var d = parseInt(val.slice(6, 8), 10);
    var hh = parseInt(val.slice(9, 11), 10);
    var mm = parseInt(val.slice(11, 13), 10);
    var ss = parseInt(val.slice(13, 15) || '0', 10);
    return new Date(y, mo, d, hh, mm, ss).toISOString();
  }

  return '';
}

function parseCompactUtc_(utcVal) {
  var v = utcVal.replace(/Z$/i, '');
  var y = parseInt(v.slice(0, 4), 10);
  var mo = parseInt(v.slice(4, 6), 10);
  var d = parseInt(v.slice(6, 8), 10);
  var hh = parseInt(v.slice(9, 11), 10);
  var mm = parseInt(v.slice(11, 13), 10);
  var ss = parseInt(v.slice(13, 15) || '0', 10);
  return new Date(Date.UTC(y, mo - 1, d, hh, mm, ss)).toISOString();
}

function classifyEvent_(title, haystack) {
  var s = (title + ' ' + haystack).toLowerCase();
  if (/\bcareer\s+fair\b|\bfair\b|\bcareerfair\b/.test(s) && s.indexOf('fair') !== -1)
    return { type: 'fair', label: 'Career fair' };
  if (/\bnetwork/.test(s)) return { type: 'net', label: 'Networking' };
  if (/\bresume\b|\binterview\b|\blinkedin\b|\bprep\b/.test(s))
    return { type: 'resume', label: 'Resume / interview' };
  if (/\binfo\s*session\b|\binformation\s+session\b|\binfo\b/.test(s))
    return { type: 'info', label: 'Info session' };
  if (/\btalk\b|\bcompany\b|\bemployer\b|\bpresentation\b/.test(s))
    return { type: 'talk', label: 'Company talk' };
  return { type: 'info', label: 'Event' };
}

function dedupeEvents_(arr) {
  var seen = {};
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var ev = arr[i];
    var k = String(ev.title || '')
      .toLowerCase()
      .trim()
      .slice(0, 200) +
      '|' +
      String(ev.start_iso || '');
    var h = hash32_(k);
    if (seen[h]) continue;
    seen[h] = true;
    out.push(ev);
  }
  return out;
}

function hash32_(str) {
  var h = 5381;
  var s = String(str);
  for (var i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}

function buildMetaLine_(startIso, endIso, location, tzHint) {
  var fmt = 'h:mm a';
  try {
    var sd = new Date(startIso);
    var ed = endIso ? new Date(endIso) : sd;
    var tStr =
      Utilities.formatDate(sd, 'America/New_York', fmt) +
      '-' +
      Utilities.formatDate(ed, 'America/New_York', fmt) +
      ' ' +
      (tzHint === 'local' ? 'ET' : String(tzHint || 'ET'));
    var loc = location ? String(location) : '';
    var parts = [tStr];
    if (loc) parts.push(loc);
    return parts.join(' - ');
  } catch (e) {
    return location || '';
  }
}
