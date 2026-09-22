import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const GLYPHS = "-_/\\|<>[]{}=+*#%:;";
const DECODE_MS = 620;
const HOLD_MS = 4200;

/** Sweeps from the old string to the new one, left to right, through a short burst of noise. */
function useDecode(target: string, enabled: boolean): string {
  const [text, setText] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    previous.current = target;
    if (!enabled || from === target) return;

    const length = Math.max(from.length, target.length);
    const start = performance.now();
    let frame = 0;
    let ticks = 0;
    let noise = "";

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DECODE_MS);
      // Refresh the noise every other frame so it reads as a flicker, not a blur.
      if (ticks++ % 2 === 0) {
        noise = Array.from({ length }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");
      }
      let out = "";
      for (let i = 0; i < length; i++) {
        const resolveAt = 0.25 + (0.75 * i) / Math.max(1, length - 1);
        const scrambleAt = resolveAt - 0.3;
        const next = target[i] ?? "";
        if (t >= resolveAt) out += next;
        else if (t >= scrambleAt) out += next === " " || from[i] === " " ? " " : noise[i];
        else out += from[i] ?? " ";
      }
      setText(out);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return enabled ? text : target;
}

type Props = { lines: string[]; className?: string };

/**
 * One line of live status that cycles through a few facts. The first line is what assistive tech
 * reads; the cycling text is presentational. Reduced motion pins it to the first line.
 */
const StatusLine = ({ lines, className }: Props) => {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const cycling = !reduced && lines.length > 1;

  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % lines.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [cycling, lines.length]);

  const text = useDecode(lines[cycling ? index : 0], cycling);

  return (
    <>
      <span className="sr-only">{lines[0]}</span>
      <span aria-hidden="true" className={className}>
        {text}
      </span>
    </>
  );
};

export default StatusLine;
