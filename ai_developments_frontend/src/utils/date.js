//
// Date utilities for handling relative time and window filtering
//

/**
 * PUBLIC_INTERFACE
 * nowMinusHours
 * Returns a Date object representing the current time minus the specified number of hours.
 * @param {number} hours - Number of hours to subtract from now.
 * @returns {Date}
 */
export function nowMinusHours(hours) {
  const ms = Date.now() - (Number(hours) || 0) * 60 * 60 * 1000;
  return new Date(ms);
}

/**
 * PUBLIC_INTERFACE
 * toUnixSeconds
 * Converts a Date or date-like input to a unix timestamp (in seconds).
 * @param {Date | number | string} date - A Date object or value parseable by Date constructor.
 * @returns {number} Unix timestamp in seconds.
 */
export function toUnixSeconds(date) {
  const d = date instanceof Date ? date : new Date(date);
  return Math.floor(d.getTime() / 1000);
}

/**
 * PUBLIC_INTERFACE
 * formatRelativeTime
 * Produces a compact relative time string such as "3m ago", "2h ago", or "1d ago".
 * - < 60 seconds => "now"
 * - < 60 minutes => "Xm ago"
 * - < 24 hours => "Xh ago"
 * - otherwise => "Xd ago"
 * @param {Date | number | string} isoOrDate - Date instance, ISO string, or ms/unix value.
 * @returns {string}
 */
export function formatRelativeTime(isoOrDate) {
  const date =
    isoOrDate instanceof Date
      ? isoOrDate
      : typeof isoOrDate === 'number'
        ? // assume seconds if looks like 10-digit, else milliseconds
          (String(isoOrDate).length <= 10 ? new Date(isoOrDate * 1000) : new Date(isoOrDate))
        : new Date(isoOrDate);

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'now';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * PUBLIC_INTERFACE
 * isWithinLastHours
 * Determines if a given timestamp falls within the last N hours.
 * Accepts ISO string, Date, unix seconds, or milliseconds.
 * @param {Date | number | string} isoOrUnix - Input time representation
 * @param {number} hours - Window in hours
 * @returns {boolean}
 */
export function isWithinLastHours(isoOrUnix, hours) {
  const windowStart = nowMinusHours(hours).getTime(); // ms
  let tsMs;

  if (isoOrUnix instanceof Date) {
    tsMs = isoOrUnix.getTime();
  } else if (typeof isoOrUnix === 'number') {
    // infer seconds vs ms
    tsMs = String(isoOrUnix).length <= 10 ? isoOrUnix * 1000 : isoOrUnix;
  } else {
    tsMs = new Date(isoOrUnix).getTime();
  }

  if (Number.isNaN(tsMs)) return false;
  return tsMs >= windowStart;
}

export default {
  nowMinusHours,
  toUnixSeconds,
  formatRelativeTime,
  isWithinLastHours,
};
