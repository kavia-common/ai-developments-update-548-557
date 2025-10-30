import React, { useMemo } from "react";

/**
 * PUBLIC_INTERFACE
 * Health
 * Lightweight, client-only health check page for quick diagnostics.
 * Renders instantly with status, timestamp, and simple JSON-at-a-glance.
 */
export default function Health() {
  const now = useMemo(() => new Date(), []);
  const iso = now.toISOString();

  const appName =
    process.env.REACT_APP_APP_NAME ||
    "AI Developments - Last 48 Hours (Frontend)";

  const provider =
    process.env.REACT_APP_DATA_PROVIDER
      ? String(process.env.REACT_APP_DATA_PROVIDER).toUpperCase()
      : "HN";

  const status = {
    status: "ok",
    time: iso,
    provider: provider || "unknown",
    version: process.env.REACT_APP_VERSION || "0.1.0",
  };

  return (
    <div
      className="container"
      style={{
        padding: "24px 20px",
        display: "grid",
        gap: 12,
        color: "var(--op-text, #111827)",
      }}
    >
      <section
        className="op-card"
        style={{
          background: "var(--op-surface, #ffffff)",
          border: "1px solid var(--op-border, #e5e7eb)",
          borderRadius: 12,
          padding: 16,
          boxShadow: "var(--op-shadow-sm, 0 1px 2px rgba(0,0,0,0.04))",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700 }}>
          Health Check
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--op-success, #10B981)",
              display: "inline-block",
            }}
          />
          <strong>Status:</strong>
          <span
            style={{
              color: "var(--op-success, #10B981)",
              fontWeight: 700,
            }}
          >
            OK
          </span>
        </div>

        <p style={{ margin: "4px 0", fontSize: 14 }}>
          App: <strong>{appName}</strong>
        </p>
        <p style={{ margin: "4px 0", fontSize: 14 }}>
          Time:{" "}
          <time dateTime={iso} title={iso}>
            {now.toLocaleString()}
          </time>
        </p>
        <p style={{ margin: "4px 0", fontSize: 14 }}>
          Version: <code>{status.version}</code>
        </p>

        <div
          className="op-card"
          style={{
            marginTop: 12,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,1))",
            border: "1px solid var(--op-border, #e5e7eb)",
            borderRadius: 10,
            padding: 12,
            overflowX: "auto",
          }}
        >
          <pre
            aria-label="Health JSON"
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}
