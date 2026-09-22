import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const FINE_POINTER = "(pointer: fine) and (hover: hover)";
const FIELDS = "input, textarea, select, [contenteditable]";
const INTERACTIVE = "a, button, [role='button'], label, summary";

/**
 * A quiet custom cursor for mouse users: a dot that tracks the pointer and a ring that lags behind
 * it, growing over anything clickable and turning into a label where a hint is useful. Everything
 * is driven through refs and a single animation frame, so it never re-renders on move. Touch and
 * reduced-motion visitors keep the native cursor.
 */
const Cursor = () => {
  const reduced = useReducedMotion();
  const [fine, setFine] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER);
    const update = () => setFine(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const enabled = fine && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!enabled || !root || !dot || !ring || !label) return;

    document.documentElement.classList.add("has-cursor");
    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let shown = false;
    let frame = 0;

    const tick = () => {
      // Ease the ring toward the pointer; the dot is already there.
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!shown) {
        shown = true;
        ringX = x;
        ringY = y;
        root.classList.add("is-shown");
      }
      const target = event.target instanceof Element ? event.target : null;
      const field = target?.closest(FIELDS);
      const hint = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest(INTERACTIVE);
      root.classList.toggle("is-field", Boolean(field));
      root.classList.toggle("is-label", Boolean(hint) && !field);
      root.classList.toggle("is-link", Boolean(interactive) && !hint && !field);
      label.textContent = hint?.dataset.cursor ?? "";
    };

    const hide = () => root.classList.remove("is-shown");
    const show = () => {
      if (shown) root.classList.add("is-shown");
    };
    const down = () => root.classList.add("is-down");
    const up = () => root.classList.remove("is-down");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);
    window.addEventListener("blur", hide);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener("mouseenter", show);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-cursor");
      root.className = "cursor";
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <span ref={dotRef} className="cursor-dot" />
      <span ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </span>
    </div>
  );
};

export default Cursor;
