import React from "react";

/**
 * PUBLIC_INTERFACE
 * EmptyState
 * Friendly empty state for when there is no data to display.
 *
 * Props:
 * - title?: string - headline for the empty state
 * - description?: string - helpful text
 * - action?: React.ReactNode - optional call-to-action button or control
 */
export default function EmptyState({
  title = "No results",
  description = "Try adjusting your search or refresh to see the latest items.",
  action = null,
}) {
  return (
    <section
      className="op-empty-state"
      aria-live="polite"
      style={{
        background: "var(--op-surface, #ffffff)",
        border: "1px dashed var(--op-border, #e5e7eb)",
        borderRadius: 12,
        padding: 24,
        textAlign: "center",
        color: "var(--op-text, #111827)",
      }}
    >
      <div
        className="op-empty-state__icon"
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          margin: "0 auto 8px auto",
          background:
            "linear-gradient(135deg, var(--op-primary-10, rgba(37,99,235,0.1)), var(--op-surface, #fff))",
          border: "1px solid var(--op-border, #e5e7eb)",
          display: "grid",
          placeItems: "center",
          fontSize: 22,
        }}
      >
        🔎
      </div>
      <h3 className="op-empty-state__title" style={{ margin: "8px 0 4px", fontSize: 16, fontWeight: 700 }}>
        {title}
      </h3>
      <p className="op-empty-state__description" style={{ margin: 0, fontSize: 14, color: "var(--op-text-muted, #6b7280)" }}>
        {description}
      </p>
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </section>
  );
}
