/**
 * Provider service to fetch AI developments over the past 48 hours.
 * Supports:
 * - HN (Hacker News Algolia) [default, no key required]
 * - NEWSAPI (requires REACT_APP_NEWSAPI_KEY)
 * - GNEWS (requires REACT_APP_GNEWS_KEY)
 *
 * PUBLIC_INTERFACE
 * export async function fetchDevelopments(queryText = '')
 * Returns a list of DevelopmentItem and a metadata flag:
 * {
 *   items: DevelopmentItem[],
 *   usedMock: boolean
 * }
 *
 * DevelopmentItem:
 * {
 *   id: string,
 *   title: string,
 *   url: string,
 *   source: string,         // hostname or provider
 *   publishedAt: string,    // ISO timestamp
 *   relativeTime: string,   // e.g. "3h ago"
 *   summary?: string,
 *   tags?: string[]
 * }
 */

import { nowMinusHours, isWithinLastHours, formatRelativeTime } from '../utils/date';
import staticMock from '../data/mockDevelopments.json';

/**
 * Extract hostname from a URL for display as source.
 * @param {string} url
 * @returns {string}
 */
function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Build the common AI query keywords for providers.
 * @returns {string}
 */
function buildAiQuery() {
  return 'AI OR LLM OR GPT OR OpenAI OR Anthropic OR Claude OR Llama OR Gemini OR Stable Diffusion OR Cohere';
}

/**
 * Parse URL flags for mock usage:
 * - ?mock=1 | ?mock=true
 * - #mock (any hash exactly "mock" or containing "mock")
 * Falls back to a global window.__USE_MOCK if set by index.js.
 */
function urlMockEnabled() {
  try {
    const searchParams = new URLSearchParams(window.location.search || '');
    const mockParam = searchParams.get('mock');
    const hasQueryMock = mockParam && ['1', 'true', 'on', 'yes'].includes(String(mockParam).toLowerCase());
    const hasHashMock = (window.location.hash || '').toLowerCase().includes('mock');
    const globalFlag = Boolean(window.__USE_MOCK);
    return Boolean(hasQueryMock || hasHashMock || globalFlag);
  } catch {
    return Boolean(window && window.__USE_MOCK);
  }
}

/**
 * Small mock dataset builder. Uses static JSON as base and ensures fields.
 * If the static data timestamps drift out of 48h window, callers can bypass filter when forced mock is true.
 */
function buildMockData() {
  // Normalize static mock to ensure fields are present and correct types
  return (staticMock || []).map((m, idx) => ({
    id: m.id || `mock-${idx}`,
    title: m.title || 'AI development',
    url: m.url || 'https://example.com',
    source: m.source || (m.url ? getDomain(m.url) : 'mock'),
    publishedAt: m.publishedAt || new Date().toISOString(),
    summary: m.summary || '',
    tags: Array.isArray(m.tags) ? m.tags : undefined,
  }));
}

/**
 * Normalize Hacker News Algolia response to DevelopmentItem.
 * @param {any[]} hits
 * @returns {Array}
 */
function normalizeFromHN(hits = []) {
  return hits
    .map((h) => {
      const url = h.url || (h.story_url || '');
      const title = h.title || h.story_title || '';
      const publishedMs = (h.created_at_i ? h.created_at_i * 1000 : (h.created_at ? new Date(h.created_at).getTime() : Date.now()));
      const publishedAt = new Date(publishedMs).toISOString();
      return {
        id: String(h.objectID || `${publishedMs}-${title}`),
        title,
        url,
        source: getDomain(url) || 'news.ycombinator.com',
        publishedAt,
      };
    })
    .filter((x) => x.title && x.url);
}

/**
 * Normalize NewsAPI response to DevelopmentItem.
 * @param {any[]} articles
 * @returns {Array}
 */
function normalizeFromNewsAPI(articles = []) {
  return articles
    .map((a, idx) => {
      const url = a.url || '';
      const title = a.title || '';
      const publishedAt = a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString();
      return {
        id: a.url || String(idx),
        title,
        url,
        source: getDomain(url) || (a.source && a.source.name) || 'newsapi',
        publishedAt,
        summary: a.description || '',
      };
    })
    .filter((x) => x.title && x.url);
}

/**
 * Normalize GNews response to DevelopmentItem.
 * @param {any[]} articles
 * @returns {Array}
 */
function normalizeFromGNews(articles = []) {
  return articles
    .map((a, idx) => {
      const url = a.url || '';
      const title = a.title || '';
      const publishedAt = a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString();
      return {
        id: a.url || String(idx),
        title,
        url,
        source: getDomain(url) || (a.source && a.source.name) || 'gnews',
        publishedAt,
        summary: a.description || '',
      };
    })
    .filter((x) => x.title && x.url);
}

/**
 * Deduplicate array of DevelopmentItem by URL.
 * Keeps the first occurrence encountered (assuming earlier entries are more relevant).
 * @param {Array} items
 * @returns {Array}
 */
function dedupeByUrl(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = (item.url || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * Filter items within the last `hours` hours.
 * @param {Array} items
 * @param {number} hours
 * @returns {Array}
 */
function filterWithinHours(items, hours) {
  return items.filter((it) => isWithinLastHours(it.publishedAt, hours));
}

/**
 * Apply case-insensitive title filter.
 * @param {Array} items
 * @param {string} query
 * @returns {Array}
 */
function applyTitleFilter(items, query) {
  if (!query) return items;
  const q = String(query).trim().toLowerCase();
  if (!q) return items;
  return items.filter((it) => (it.title || '').toLowerCase().includes(q));
}

/**
 * Attach relative time string.
 * @param {Array} items
 * @returns {Array}
 */
function addRelativeTime(items) {
  return items.map((it) => ({
    ...it,
    relativeTime: formatRelativeTime(it.publishedAt),
  }));
}

/**
 * Fetch data from the selected provider and normalize.
 * @param {string} provider
 * @returns {Promise<Array>}
 */
async function fetchFromProvider(provider) {
  const HOURS = 48;
  const query = buildAiQuery();

  if (provider === 'HN') {
    const params = new URLSearchParams({
      tags: 'story',
      query,
      restrictSearchableAttributes: 'title',
      hitsPerPage: '50'
    });
    const url = `https://hn.algolia.com/api/v1/search_by_date?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HN fetch failed: ${res.status}`);
    const data = await res.json();
    const normalized = normalizeFromHN(data.hits || []);
    const filtered = normalized.filter((n) => {
      const created = new Date(n.publishedAt).getTime();
      return created >= nowMinusHours(HOURS).getTime();
    });
    return filtered;
  }

  if (provider === 'NEWSAPI') {
    const key = process.env.REACT_APP_NEWSAPI_KEY;
    if (!key) throw new Error('Missing REACT_APP_NEWSAPI_KEY for NEWSAPI provider');

    const fromIso = nowMinusHours(HOURS).toISOString();
    const endpoint = 'https://newsapi.org/v2/everything';
    const params = new URLSearchParams({
      q: `(${query})`,
      sortBy: 'publishedAt',
      pageSize: '50',
      from: fromIso,
      language: 'en',
    });
    const res = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`NewsAPI fetch failed: ${res.status}`);
    const data = await res.json();
    const normalized = normalizeFromNewsAPI(data.articles || []);
    return normalized;
  }

  if (provider === 'GNEWS') {
    const key = process.env.REACT_APP_GNEWS_KEY;
    if (!key) throw new Error('Missing REACT_APP_GNEWS_KEY for GNEWS provider');

    const fromIso = nowMinusHours(HOURS).toISOString();
    const endpoint = 'https://gnews.io/api/v4/search';
    const params = new URLSearchParams({
      q: query,
      max: '50',
      from: fromIso,
      sortBy: 'publishedAt',
      token: key,
      lang: 'en',
    });
    const res = await fetch(`${endpoint}?${params.toString()}`);
    if (!res.ok) throw new Error(`GNews fetch failed: ${res.status}`);
    const data = await res.json();
    const normalized = normalizeFromGNews(data.articles || []);
    return normalized;
  }

  // Fallback to HN if unknown provider
  return fetchFromProvider('HN');
}

/**
 * PUBLIC_INTERFACE
 * fetchDevelopments
 * Fetch AI developments with robust mock handling.
 * Behavior:
 * - Mock is active if any of the following is true:
 *   - process.env.REACT_APP_USE_MOCK === 'true'
 *   - URL contains ?mock=1 or ?mock=true
 *   - URL hash contains #mock
 *   - window.__USE_MOCK is truthy (set at startup in index.js)
 * - When mock is forced (via URL/hash/global), bypass 48h filter if dataset is older.
 * - When provider fetch errors or returns 0 items, automatically fall back to mock.
 * Returns: { items: DevelopmentItem[], usedMock: boolean }
 */
// PUBLIC_INTERFACE
export async function fetchDevelopments(queryText = '') {
  const HOURS = 48;
  const provider = (process.env.REACT_APP_DATA_PROVIDER || 'HN').toUpperCase();

  const envMock = (process.env.REACT_APP_USE_MOCK || 'false').toLowerCase() === 'true';
  const forceMock = urlMockEnabled();
  const mockOn = envMock || forceMock;

  const runPipeline = (items) => {
    const deduped = dedupeByUrl(items);
    const filtered = applyTitleFilter(deduped, queryText);
    const sorted = filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return addRelativeTime(sorted);
  };

  // Helper to prepare mock respecting/bypassing date filter
  const prepareMock = () => {
    const mock = buildMockData();
    const within = filterWithinHours(mock, HOURS);
    const hasWithin = within.length > 0;
    const base = (forceMock && !hasWithin) ? mock : within;
    return runPipeline(base);
  };

  try {
    if (mockOn) {
      return { items: prepareMock(), usedMock: true };
    }

    // Live path
    const items = await fetchFromProvider(provider);
    let processed = items;

    // If provider returns empty, fallback to mock automatically
    if (!Array.isArray(processed) || processed.length === 0) {
      return { items: prepareMock(), usedMock: true };
    }

    // Enforce 48h after fetch
    processed = filterWithinHours(processed, HOURS);

    // If nothing remains after 48h filter, fallback to mock
    if (!processed.length) {
      return { items: prepareMock(), usedMock: true };
    }

    return { items: runPipeline(processed), usedMock: false };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('fetchDevelopments error:', err);
    return { items: prepareMock(), usedMock: true };
  }
}

export default {
  fetchDevelopments,
};
