/** Tiny event bus so any component can open the command palette without prop drilling. */
const EVENT = "palette:open";

export const openPalette = () => window.dispatchEvent(new Event(EVENT));

export const onPaletteOpen = (handler: () => void) => {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};

export const isApplePlatform = () =>
  typeof navigator !== "undefined" && /Mac|iP(hone|ad|od)/i.test(navigator.userAgent);

/** Smoothly scroll to an in-page anchor, update the URL and move focus to the target. */
export const goTo = (hash: string) => {
  const id = hash.replace(/^#/, "");
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  // The palette that calls this is still open, and the page behind it still `inert`, until React
  // commits the close; an inert element silently refuses focus, so the move waits for the next
  // task. A timer rather than a frame keeps it ordered before any follow-up focus a caller
  // schedules (`sudo hire` hands focus to the form 700ms later).
  window.setTimeout(() => target.focus({ preventScroll: true }), 0);
};
