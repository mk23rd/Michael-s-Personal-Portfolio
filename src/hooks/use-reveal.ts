import { useEffect } from "react";

/** Elements reveal once their top edge passes this fraction of the viewport height. */
const TRIGGER_LINE = 0.9;

/**
 * Adds `.is-visible` to every `[data-reveal]` element once it enters the viewport.
 * Elements are observed once; the class is never removed so content doesn't blink
 * when scrolling back up.
 *
 * An IntersectionObserver does the precise triggering, but it only reports *changes*
 * in intersection: a fast scroll (scrollbar drag, nav jump, trackpad flick on a slow
 * machine) can carry an element from below the viewport to above it between two frames,
 * so it never intersects and would stay at opacity 0 forever. A frame-throttled scroll
 * sweep therefore also reveals anything whose top has already passed the trigger line.
 *
 * Sections below the fold mount after the first paint (see Deferred), so a MutationObserver
 * picks up their elements as they arrive instead of relying on one scan at mount.
 */
export function useReveal() {
  useEffect(() => {
    const pending = new Set<HTMLElement>();
    const reveal = (el: Element) => {
      el.classList.add("is-visible");
      pending.delete(el as HTMLElement);
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  reveal(entry.target);
                  observer?.unobserve(entry.target);
                }
              });
            },
            { rootMargin: `0px 0px -${Math.round((1 - TRIGGER_LINE) * 100)}% 0px`, threshold: 0.05 }
          )
        : null;

    let frame = 0;
    const sweep = () => {
      frame = 0;
      const line = window.innerHeight * TRIGGER_LINE;
      // Collect first, then mutate, so the class changes don't force layout mid-loop.
      const passed = Array.from(pending).filter((el) => el.getBoundingClientRect().top < line);
      passed.forEach((el) => {
        reveal(el);
        observer?.unobserve(el);
      });
    };
    const onScroll = () => {
      if (pending.size && !frame) frame = requestAnimationFrame(sweep);
    };

    const track = (root: ParentNode) => {
      const found = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
      if (root instanceof HTMLElement && root.matches("[data-reveal]")) found.unshift(root);
      const fresh = found.filter((el) => !el.classList.contains("is-visible") && !pending.has(el));
      if (fresh.length === 0) return;
      if (!observer) {
        fresh.forEach(reveal);
        return;
      }
      fresh.forEach((el) => {
        pending.add(el);
        observer.observe(el);
      });
      // Covers loading mid-page (hash link, restored scroll position): anything already
      // above the viewport is switched on while off-screen instead of animating in later.
      onScroll();
    };

    track(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) track(node);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
