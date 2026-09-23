import type { CSSProperties } from "react";
import { stack } from "@/data/portfolio";
import { marks } from "@/data/marks";

/** Brand mark in the current colour; multi-tone logos keep their layers as opacities. */
const Mark = ({ name }: { name: string }) => {
  const mark = marks[name];
  if (!mark) return null;
  return (
    <svg className="mark" viewBox={mark.viewBox} aria-hidden="true" focusable="false">
      {mark.paths.map((p, i) =>
        p.stroke ? (
          <path key={i} d={p.d} fill="none" stroke="currentColor" strokeWidth={p.stroke} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path key={i} d={p.d} fill="currentColor" fillRule={p.evenOdd ? "evenodd" : undefined} opacity={p.opacity} />
        )
      )}
    </svg>
  );
};

const Track = ({ hidden = false }: { hidden?: boolean }) => (
  <ul className="ticker-track items-center" aria-hidden={hidden || undefined}>
    {stack.map((item) => (
      <li key={item} className="display flex items-center gap-12 text-2xl md:text-4xl">
        <span className="lockup" style={{ "--tint": marks[item]?.tint } as CSSProperties}>
          <Mark name={item} />
          {item}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
      </li>
    ))}
  </ul>
);

/**
 * A slow ticker of the tools in daily use, each as a logo-and-name lockup in ink; pauses on hover, where
 * a mark takes its brand colour. Lays flat under reduced motion.
 */
const StackStrip = () => (
  <section className="border-y border-border py-8 md:py-10" aria-label="Technologies I work with">
    <div className="ticker">
      <Track />
      <Track hidden />
    </div>
  </section>
);

export default StackStrip;
