/**
 * Shared limits and allowlists for job-search requests.
 * Loaded with other .gs files into one Apps Script project (single global scope).
 */

var QUERY_CACHE_TTL_SEC = 6 * 60 * 60; // Script cache max 21600
/** CacheService.put value limit is ~100KB; larger payloads must not be stored or put throws. */
var MAX_SCRIPT_CACHE_VALUE_BYTES = 100 * 1024;
var MAX_LIMIT_PER_PROVIDER = 20;
var MAX_POST_BODY_BYTES = 32768;
/** Reject GET job-search when query string exceeds this (URL + proxy limits; JSONP uses long query strings). */
var MAX_GET_QUERY_STRING_CHARS = 7168;
var MAX_JSON_KEYS = 24;

/** Job-search: only these keys allowed (strict). Matches jobs_page fetch body + api_key + min_pay. */
var JOB_SEARCH_KEYS = [
  'query_text',
  'location_text',
  'min_pay',
  'employment_type',
  'remote_mode',
  'limit_per_provider',
  'notes',
  'authorization',
  'api_key'
];

var MAX_LEN = {
  query_text: 512,
  location_text: 200,
  employment_type: 120,
  remote_mode: 80,
  notes: 2000,
  authorization: 120,
  api_key: 512
};

var GET_JOB_SEARCH_PARAM_ALLOWLIST = {
  action: 1,
  query_text: 1,
  location_text: 1,
  min_pay: 1,
  employment_type: 1,
  remote_mode: 1,
  limit_per_provider: 1,
  notes: 1,
  authorization: 1,
  api_key: 1,
  callback: 1
};
