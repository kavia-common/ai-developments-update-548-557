import React from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorBanner
 * Prominent, accessible error banner.
 *
 * Props:
 * - message: string (required)
 * - onRetry?: () => void - optional retry handler to show an action button
 */
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className="op-banner op-banner--error"
      role="alert"
      aria-live="assertive"
      style={{
        border: "1px solid var(--op-error-border, #fecaca)",
        background:
          "linear-gradient(0deg, var(--op-error-bg, #fff1f2), var(--op-error-bg, #fff1f2))",
        color: "var(--op-error-text, #991b1b)",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 18 }}>⚠️</span>
      <p style={{ margin: 0, flex: 1, fontSize: 14 }}>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="op-btn op-btn--primary"
          onClick={onRetry}
          aria-label="Retry"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--op-primary, #2563EB)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
