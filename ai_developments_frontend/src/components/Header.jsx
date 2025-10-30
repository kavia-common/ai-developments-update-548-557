import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Header
 * Accessible application header with title, optional subtitle, and action area.
 * Includes classNames compatible with the "Ocean Professional" theme tokens.
 *
 * Props:
 * - title: string (required) - main heading
 * - subtitle?: string - optional sub-heading description
 * - onToggleTheme?: () => void - optional handler for theme toggle control
 * - theme?: 'light' | 'dark' - current theme to label toggle accessibly
 * - actions?: React.ReactNode - optional right-aligned custom actions (search, refresh, etc.)
 */
export default function Header({ title, subtitle, onToggleTheme, theme = "light", actions = null }) {
  return (
    <header
      className="op-header container"
      role="banner"
      aria-label="Application header"
      style={{
        background: "var(--op-surface, #ffffff)",
        borderBottom: "1px solid var(--op-border, #e5e7eb)",
      }}
    >
      <div className="op-header__inner" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
        <div className="op-header__brand" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="op-brand__mark"
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--op-primary-10, rgba(37,99,235,0.1)), var(--op-surface, #fff))",
              border: "1px solid var(--op-border, #e5e7eb)",
              display: "inline-block",
            }}
          />
          <div className="op-header__titles">
            <h1
              className="op-header__title"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "var(--op-text, #111827)",
              }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className="op-header__subtitle"
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--op-text-muted, #6b7280)",
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="op-header__spacer" style={{ flex: 1 }} />

        <nav
          className="op-header__actions"
          aria-label="Header actions"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {/* Health link - subtle ghost style */}
          <Link
            to="/health"
            className="op-btn op-btn--ghost"
            aria-label="Open Health Check page"
            title="Health"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--op-border, #e5e7eb)",
              background: "var(--op-surface, #ffffff)",
              color: "var(--op-text, #111827)",
              textDecoration: "none",
            }}
          >
            Health
          </Link>
          {actions}
          {onToggleTheme ? (
            <button
              type="button"
              className="op-btn op-btn--ghost"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--op-border, #e5e7eb)",
                background: "var(--op-surface, #ffffff)",
                color: "var(--op-text, #111827)",
                cursor: "pointer",
                transition: "background .2s ease, transform .1s ease",
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "translateY(1px)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
              <span className="sr-only" style={{ position: "absolute", clip: "rect(1px, 1px, 1px, 1px)" }}>
                Toggle theme
              </span>
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
