/**
 * Standalone calendar web app — deploy **alone** with `EventsFeed.gs` in a separate Apps Script project.
 * See `calendar_webapp/README.md`. JSONP-safe (`eventsFinishResponse_`).
 *
 * Optional: call `routeCalendarActions_(e)` from a larger `doGet` if merging into another project.
 */

function doGet(e) {
  return routeCalendarActions_(e);
}

function routeCalendarActions_(e) {
  e = e || { parameter: {} };
  var action = String(e.parameter.action || 'health').toLowerCase();
  try {
    if (action === 'health') {
      return eventsFinishResponse_(e.parameter, {
        ok: true,
        service: 'bellini-calendar-feed'
      });
    }
    if (action === 'events') {
      //Logger.log(handleEventsDoGet_(e).getContent())
      return handleEventsDoGet_(e);
    }
    return eventsFinishResponse_(e.parameter, { error: 'Not found' });
  } catch (err) {
    return eventsFinishResponse_(e.parameter, {
      error: 'Internal error',
      detail: String(err && err.message ? err.message : err)
    });
  }
}
