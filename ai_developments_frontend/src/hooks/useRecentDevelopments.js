import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchDevelopments as fetchService } from "../services/fetchDevelopments";

/**
 * PUBLIC_INTERFACE
 * useRecentDevelopments
 * React hook that encapsulates fetching and client-side management of AI developments
 * over the past 48 hours. It provides debounced query-based filtering, refresh capability,
 * and maintains loading/error/lastUpdated states.
 *
 * Exposed API:
 * {
 *   items,           // full fetched & processed list
 *   filteredItems,   // items filtered by current query
 *   loading,         // boolean loading state
 *   error,           // string | null
 *   lastUpdated,     // Date | null
 *   query,           // current search query string
 *   setQuery,        // setter for query
 *   refresh,         // function to re-fetch from the service
 *   mockActive,      // boolean - whether mock data is currently active
 * }
 */
export function useRecentDevelopments() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mockActive, setMockActive] = useState(false);

  // Keep a mounted ref to avoid setting state after unmount.
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debounce the query ~300ms
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Fetch function which can be called on mount and on demand
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items: svcItems, usedMock } = await fetchService("");
      if (!mountedRef.current) return;
      setItems(Array.isArray(svcItems) ? svcItems : []);
      setMockActive(Boolean(usedMock));
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      // eslint-disable-next-line no-console
      console.error("useRecentDevelopments.refresh error:", err);
      setError(err?.message || "Failed to load developments.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Compute filtered items using the debouncedQuery
  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return items;
    const q = debouncedQuery.toLowerCase();
    return items.filter((it) => (it.title || "").toLowerCase().includes(q));
  }, [items, debouncedQuery]);

  return {
    items,
    filteredItems,
    loading,
    error,
    lastUpdated,
    query,
    setQuery,
    refresh,
    mockActive,
  };
}

export default useRecentDevelopments;
