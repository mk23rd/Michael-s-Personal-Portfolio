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
 */
export function useReveal() {
  useEffect(() => {
    const pending = new Set(Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")));
    if (pending.size === 0) return;

    const reveal = (el: Element) => {
      el.classList.add("is-visible");
      pending.delete(el as HTMLElement);
    };

    if (!("IntersectionObserver" in window)) {
      pending.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: `0px 0px -${Math.round((1 - TRIGGER_LINE) * 100)}% 0px`, threshold: 0.05 }
    );
    pending.forEach((el) => observer.observe(el));

    let frame = 0;
    const sweep = () => {
      frame = 0;
      const line = window.innerHeight * TRIGGER_LINE;
      // Collect first, then mutate, so the class changes don't force layout mid-loop.
      const passed = Array.from(pending).filter((el) => el.getBoundingClientRect().top < line);
      passed.forEach((el) => {
        reveal(el);
        observer.unobserve(el);
      });
      if (pending.size === 0) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Covers loading mid-page (hash link, restored scroll position): anything already
    // above the viewport is switched on while off-screen instead of animating in later.
    frame = requestAnimationFrame(sweep);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
