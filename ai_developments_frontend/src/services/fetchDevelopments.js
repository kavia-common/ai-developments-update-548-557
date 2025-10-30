/**
 * Provider service to fetch AI developments over the past 48 hours.
 * Supports:
 * - HN (Hacker News Algolia) [default, no key required]
 * - NEWSAPI (requires REACT_APP_NEWSAPI_KEY)
 * - GNEWS (requires REACT_APP_GNEWS_KEY)
 *
 * PUBLIC_INTERFACE
 * export async function fetchDevelopments(queryText = '')
 * Returns a list of DevelopmentItem:
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
 * Small mock dataset with recent timestamps relative to now.
 * These will be used when REACT_APP_USE_MOCK is true or as a fallback on error.
 */
function buildMockData() {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
  const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'mock-1',
      title: 'OpenAI updates GPT model latency for faster responses',
      url: 'https://openai.com/blog/gpt-latency-improvements',
      source: 'openai.com',
      publishedAt: twoHoursAgo,
      summary: 'OpenAI announces infrastructure and model tweaks that significantly improve response latency.',
      tags: ['OpenAI', 'GPT', 'Latency'],
    },
    {
      id: 'mock-2',
      title: 'Anthropic releases Claude update focusing on safety',
      url: 'https://www.anthropic.com/news/claude-safety-update',
      source: 'anthropic.com',
      publishedAt: sixHoursAgo,
      summary: 'Claude receives new guardrails and safety improvements to reduce harmful outputs.',
      tags: ['Anthropic', 'Claude', 'Safety'],
    },
    {
      id: 'mock-3',
      title: 'Meta Llama research shares new pretraining techniques',
      url: 'https://ai.meta.com/blog/llama-pretraining-techniques',
      source: 'ai.meta.com',
      publishedAt: twentyHoursAgo,
      summary: 'Meta AI shares advances in pretraining methods for Llama-based models.',
      tags: ['Meta', 'Llama', 'Research'],
    },
  ];
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
    const endpoint = 'https://hn.algolia.com/api/v1/search';
    const params = new URLSearchParams({
      tags: 'story',
      query,
      restrictSearchableAttributes: 'title',
      hitsPerPage: '50',
      // Sorting by created_at_i desc can be achieved by using "search_by_date",
      // but we can sort client-side as well. We'll use search_by_date for recency.
    });
    // Prefer the 'search_by_date' endpoint for latest
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
      headers: {
        Authorization: `Bearer ${key}`,
      },
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

// PUBLIC_INTERFACE
export async function fetchDevelopments(queryText = '') {
  /**
   * Fetch AI developments from the selected provider, with mock fallback.
   * - Select provider based on REACT_APP_DATA_PROVIDER: HN | NEWSAPI | GNEWS (default HN)
   * - If REACT_APP_USE_MOCK === 'true', return mock data filtered to 48h
   * - Deduplicate by URL
   * - Filter to last 48h and apply optional query filter (title contains queryText)
   * - Sort by publishedAt desc
   * - Compute relativeTime
   *
   * @param {string} queryText - Optional filter term (case-insensitive) applied to item titles
   * @returns {Promise<Array>} Array of DevelopmentItem
   */
  const HOURS = 48;
  const provider = (process.env.REACT_APP_DATA_PROVIDER || 'HN').toUpperCase();
  const useMock = (process.env.REACT_APP_USE_MOCK || 'false').toLowerCase() === 'true';

  try {
    // Mock path
    if (useMock) {
      const mock = buildMockData();
      const within = filterWithinHours(mock, HOURS);
      const filtered = applyTitleFilter(within, queryText);
      const sorted = filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      return addRelativeTime(sorted);
    }

    // Provider fetch
    const items = await fetchFromProvider(provider);

    // Normalize downstream pipeline
    const deduped = dedupeByUrl(items);
    const within = filterWithinHours(deduped, HOURS);
    const filtered = applyTitleFilter(within, queryText);
    const sorted = filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return addRelativeTime(sorted);
  } catch (err) {
    // Robust error handling with mock fallback
    // eslint-disable-next-line no-console
    console.error('fetchDevelopments error:', err);
    const mock = buildMockData();
    const within = filterWithinHours(mock, HOURS);
    const filtered = applyTitleFilter(within, queryText);
    const sorted = filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return addRelativeTime(sorted);
  }
}

export default {
  fetchDevelopments,
};
