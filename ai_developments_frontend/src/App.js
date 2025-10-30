import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import EmptyState from './components/EmptyState';
import DevCard from './components/DevCard';
import useRecentDevelopments from './hooks/useRecentDevelopments';

/**
 * PUBLIC_INTERFACE
 * App
 * Main application shell for "AI Developments - Last 48 Hours" using the Ocean Professional theme.
 * Integrates:
 * - useRecentDevelopments for data fetching, debounced search, refresh, and states
 * - Header with search, refresh, and optional theme toggle
 * - Loader, ErrorBanner, EmptyState, and DevCard list
 *
 * Behavior:
 * - Theme persisted per session via state; applied to document as data-theme attribute
 * - Search input updates query in hook, which is debounced internally
 * - Refresh button re-fetches data
 * - Semantic layout and accessible labels
 */
function App() {
  const {
    filteredItems,
    loading,
    error,
    lastUpdated,
    query,
    setQuery,
    refresh,
    mockActive,
  } = useRecentDevelopments();

  const [theme, setTheme] = useState('light');

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return '';
    const d = lastUpdated;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }, [lastUpdated]);

  return (
    <div className="App">
      <Header
        title="AI Developments - Last 48 Hours"
        subtitle="Curated updates across AI research, products, and community"
        onToggleTheme={toggleTheme}
        theme={theme}
        actions={
          <>
            {/* Search input (debounced via hook) */}
            <label htmlFor="search" className="sr-only" style={{ position: 'absolute', clip: 'rect(1px, 1px, 1px, 1px)' }}>
              Search developments
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search titles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search developments"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--op-border, #e5e7eb)',
                background: 'var(--op-surface, #ffffff)',
                color: 'var(--op-text, #111827)',
                minWidth: 220,
              }}
            />
            {/* Refresh button */}
            <button
              type="button"
              className="op-btn op-btn--primary"
              onClick={refresh}
              disabled={loading}
              style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              aria-label="Refresh developments"
              title="Refresh"
            >
              ⟳ Refresh
            </button>
          </>
        }
      />

      {/* Mock mode banner */}
      {mockActive ? (
        <div
          className="container"
          style={{ padding: '8px 20px 0' }}
          aria-live="polite"
        >
          <div
            className="op-card"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,1))',
              border: '1px solid var(--op-border, #e5e7eb)',
              borderRadius: 10,
              padding: 10,
              fontSize: 12,
              color: 'var(--op-text, #111827)',
            }}
          >
            <strong>Mock data mode is ON</strong> — using local dataset for demo/offline.
          </div>
        </div>
      ) : null}

      <main
        role="main"
        className="container"
        style={{
          padding: '20px',
          display: 'grid',
          gap: 16,
        }}
      >
        {/* Status Row */}
        <section aria-label="Status" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {loading ? <Loader label="Loading developments" /> : null}
          {!loading && lastUpdated ? (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--op-text-muted, #6b7280)' }}>
              Last updated: {lastUpdatedLabel}
            </p>
          ) : null}
        </section>

        {/* Error Banner */}
        {error ? (
          <ErrorBanner
            message={error}
            onRetry={refresh}
          />
        ) : null}

        {/* Results */}
        <section
          aria-label="AI developments list"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 12,
          }}
        >
          {!loading && !error && filteredItems.length === 0 ? (
            <EmptyState
              title="No developments found"
              description="Try a different search term or refresh to get the latest items."
              action={
                <button
                  type="button"
                  className="op-btn op-btn--primary"
                  onClick={refresh}
                  aria-label="Refresh"
                  style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                >
                  Refresh
                </button>
              }
            />
          ) : null}

          {!error && filteredItems.map((item) => (
            <DevCard key={item.id} item={item} />
          ))}
        </section>
      </main>

      {/* Optional footer */}
      <footer
        className="container"
        aria-label="Footer"
        style={{
          padding: '24px 20px 40px',
          color: 'var(--op-text-muted, #6b7280)',
          fontSize: 12,
        }}
      >
        <span>Ocean Professional theme • {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default App;
