import { useEffect } from "react";

/**
 * Scrolls to the element named by the URL hash once the page has rendered.
 *
 * The browser tries to scroll to `#section` while parsing the HTML, but the document is empty until
 * React mounts, so a shared link such as `/#work` would otherwise open at the top of the page. The jump
 * is instant: the visitor has not seen anything yet, so there is nothing to animate from.
 */
export function useHashTarget() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);
}
