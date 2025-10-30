import React from "react";

/**
 * PUBLIC_INTERFACE
 * DevCard
 * Card component for an AI development item with accessible structure.
 *
 * Props:
 * - item: {
 *     id: string,
 *     title: string,
 *     url: string,
 *     source?: string,
 *     publishedAt?: string,
 *     relativeTime?: string,
 *     summary?: string
 *   } (required)
 * - onOpen?: (url: string) => void - optional click handler (defaults to window.open)
 */
export default function DevCard({ item, onOpen }) {
  const handleOpen = (e) => {
    e.preventDefault();
    if (onOpen) return onOpen(item.url);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className="op-card dev-card"
      aria-labelledby={`dev-title-${item.id}`}
      style={{
        background: "var(--op-surface, #ffffff)",
        border: "1px solid var(--op-border, #e5e7eb)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        transition: "box-shadow .2s ease, transform .2s ease",
      }}
    >
      <div className="dev-card__header" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div
          className="dev-card__accent"
          aria-hidden="true"
          style={{
            width: 6,
            height: 28,
            borderRadius: 8,
            background: "var(--op-primary, #2563EB)",
            opacity: 0.8,
            marginTop: 2,
          }}
        />
        <div className="dev-card__content" style={{ flex: 1, minWidth: 0 }}>
          <h2
            id={`dev-title-${item.id}`}
            className="dev-card__title"
            style={{
              fontSize: 16,
              lineHeight: 1.35,
              margin: "0 0 6px 0",
              color: "var(--op-text, #111827)",
            }}
          >
            <a
              href={item.url}
              onClick={handleOpen}
              className="dev-card__link"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.title}
            </a>
          </h2>
          <p
            className="dev-card__meta"
            style={{ margin: 0, fontSize: 13, color: "var(--op-text-muted, #6b7280)" }}
          >
            <span>{item.source || "Source"}</span>
            {item.relativeTime ? (
              <>
                <span aria-hidden="true"> • </span>
                <time dateTime={item.publishedAt || ""} aria-label={`Published ${item.relativeTime}`}>
                  {item.relativeTime}
                </time>
              </>
            ) : null}
          </p>
          {item.summary ? (
            <p
              className="dev-card__summary"
              style={{
                margin: "10px 0 0 0",
                fontSize: 14,
                color: "var(--op-text, #111827)",
              }}
            >
              {item.summary}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
