import React from "react";

/**
 * PUBLIC_INTERFACE
 * Loader
 * Accessible loading indicator with subtle Ocean Professional styling.
 *
 * Props:
 * - label?: string - text announced by screen readers (default "Loading")
 * - size?: number - visual size of spinner in px (default 18)
 */
export default function Loader({ label = "Loading", size = 18 }) {
  const s = size;
  return (
    <div
      className="op-loader"
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
    >
      <span
        className="op-loader__spinner"
        aria-hidden="true"
        style={{
          width: s,
          height: s,
          borderRadius: "50%",
          border: "2px solid var(--op-border, #e5e7eb)",
          borderTopColor: "var(--op-primary, #2563EB)",
          animation: "op-spin 0.9s linear infinite",
          display: "inline-block",
        }}
      />
      <span className="op-loader__label" style={{ fontSize: 14, color: "var(--op-text-muted, #6b7280)" }}>
        {label}
      </span>
      <style>{`
        @keyframes op-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
