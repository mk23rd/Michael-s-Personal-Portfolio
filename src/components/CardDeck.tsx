import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/portfolio";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { whenBooted } from "@/lib/boot";
import { cn, vars } from "@/lib/utils";
import ProjectArtwork from "./ProjectArtwork";

// Fan order, centre card last so the capstone sits on top of the pile.
const ORDER = ["synth", "translator", "lawata", "prolog", "fewes"];
const deck = ORDER.map((id) => projects.find((p) => p.id === id)!);

/**
 * Five project cards fanned like a hand of playing cards. They stack on load,
 * spread out once the headline has landed, and tilt toward a fine pointer.
 */
const CardDeck = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let id = 0;
    // Waits for the boot log (if there is one) so the fan-out follows the headline, not the overlay.
    const unsubscribe = whenBooted(() => {
      id = window.setTimeout(() => setStacked(false), reducedMotion ? 0 : 450);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(id);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const stage = el.closest("section") ?? el;
    let frame = 0;
    let mx = 0;
    let my = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      mx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      my = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div ref={ref} className={cn("deck", stacked && "is-stacked")}>
      <ul className="deck-stage" aria-label="Selected projects">
        {deck.map((project, index) => {
          const i = index - 2;
          // Cards further from the centre sit lower in the pile, so the capstone is on top.
          return (
            <li key={project.id} className="contents">
              <a
                href={`#${project.id}`}
                className={cn("deck-card", i < 0 && "is-left")}
                style={vars({
                  "--i": i,
                  "--z": 3 - Math.abs(i),
                  "--card-brand": project.brand,
                  "--card-ink": project.ink
                })}
                data-cursor="View"
              >
                {/* The hover pop lives on this inner body; the link itself never moves, so the
                    pointer cannot land outside a card that is straightening up beneath it. */}
                <div className="deck-card-body">
                  <div className={cn("flex h-full flex-col p-4 sm:p-5", i > 0 && "items-end text-right")}>
                    <p className="text-[0.7rem] opacity-80 sm:text-xs">{project.kind}</p>
                    <p
                      className="display mt-1 text-lg leading-[1.05] sm:text-xl"
                      style={i !== 0 ? { maxWidth: "calc(var(--fan-x) - 1.1rem)" } : undefined}
                    >
                      {project.title}
                    </p>
                    {/* Part of the link's name for assistive tech, so the visible text still matches it. */}
                    <span className="sr-only">: {project.summary}</span>
                  </div>
                  <ProjectArtwork project={project} variant="deck" loading="eager" />
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CardDeck;
