/**
 * One popup per visit. The Clara and newsletter popups take turns: the first time any of them asks, one is
 * picked for this browser session (weighted, skipping any the reader recently dismissed or no longer needs) and only
 * that one may show. The pick is kept in sessionStorage, so it holds across pages of the same visit.
 */

export type PopupName = "clara" | "newsletter";

// Share of visits each popup gets when all are eligible. Tune here.
const WEIGHTS: Record<PopupName, number> = { clara: 50, newsletter: 50 };

const TURN_KEY = "thewiderlens-popup-turn";
const DAY = 24 * 3600 * 1000;

function recently(key: string, days: number): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null && Date.now() - Number(raw) < days * DAY;
  } catch {
    return false;
  }
}

/** Mirrors each popup's own "don't show again" rules. */
function eligible(name: PopupName): boolean {
  switch (name) {
    case "clara":
      return !recently("thewiderlens-clara-popup-dismissed", 14);
    case "newsletter":
      try {
        if (localStorage.getItem("thewiderlens-newsletter-subscribed") === "1") return false;
      } catch {
        /* ignore */
      }
      if (window.location.pathname.startsWith("/newsletter")) return false;
      return !recently("thewiderlens-newsletter-popup-dismissed", 14);
  }
}

function pick(): PopupName | "none" {
  const names = (Object.keys(WEIGHTS) as PopupName[]).filter(eligible);
  const total = names.reduce((sum, n) => sum + WEIGHTS[n], 0);
  if (total === 0) return "none";
  let r = Math.random() * total;
  for (const n of names) {
    r -= WEIGHTS[n];
    if (r < 0) return n;
  }
  return names[names.length - 1];
}

/** True if this popup is the one allowed to show during this visit. */
export function isMyTurn(name: PopupName): boolean {
  try {
    let turn = sessionStorage.getItem(TURN_KEY);
    if (!turn) {
      turn = pick();
      sessionStorage.setItem(TURN_KEY, turn);
    }
    return turn === name;
  } catch {
    return name === "newsletter"; // storage unavailable: fall back to the original single popup
  }
}
