/**
 * A short "boot" moment on the first visit of a session, on desktop-sized screens: a few lines of log,
 * then the page comes up. The hero's entrance is held back by `--boot` (read by `.rise`) so it lands as
 * the overlay wipes away.
 */

/** How long the log is on screen before the wipe starts. */
export const LOG_MS = 1250;
/** Delay applied to the hero choreography, so it begins while the overlay is still leaving. */
export const BOOT_MS = LOG_MS + 150;

const SEEN_KEY = "boot-seen";
const listeners = new Set<() => void>();
let booting = false;

const seen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage may be unavailable in private modes; the boot simply plays again next time.
  }
};

/** Phones skip the boot: on a small screen over a slow connection the wait costs more than the moment is worth. */
export const BOOT_MIN_WIDTH = "(min-width: 48rem)";

/**
 * True only once per tab session on a desktop-sized screen; never for reduced-motion visitors or deep
 * links to a section.
 */
export const shouldBoot = () =>
  typeof window !== "undefined" &&
  !seen() &&
  !window.location.hash &&
  window.matchMedia(BOOT_MIN_WIDTH).matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Call before the first render so the hero's delays are in place for the very first frame. */
export const primeBoot = () => {
  if (!shouldBoot()) return;
  booting = true;
  markSeen();
  document.documentElement.classList.add("is-booting");
  document.documentElement.style.setProperty("--boot", `${BOOT_MS}ms`);
};

export const isBooting = () => booting;

/** Runs `callback` once the boot is over, or straight away when there is no boot. */
export const whenBooted = (callback: () => void) => {
  if (!booting) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

/**
 * Ends the boot. `skipped` collapses the hero delay so the page comes up right now instead of at the
 * scheduled moment.
 */
export const finishBoot = (skipped = false) => {
  if (!booting) return;
  booting = false;
  const root = document.documentElement;
  root.classList.remove("is-booting");
  if (skipped) root.style.setProperty("--boot", "0ms");
  // Once the hero has finished rising, the delay is no longer needed; other `.rise` users (the menu)
  // should not inherit it.
  window.setTimeout(() => root.style.removeProperty("--boot"), skipped ? 1600 : 2000);
  listeners.forEach((listener) => listener());
  listeners.clear();
};
