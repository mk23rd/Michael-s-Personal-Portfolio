import { type ReactNode, useEffect, useState } from "react";

/**
 * Mounts the sections below the fold one at a time after the first paint, each in its own task, so
 * the hero is on screen sooner and no single task has to build and lay out the whole page.
 *
 * Arriving mid-page (a hash link, a reload or back/forward, where the browser restores the scroll
 * position) mounts everything at once so the target is there to scroll to.
 */

const arrivesMidPage = () => {
  if (typeof window === "undefined") return false;
  if (window.location.hash) return true;
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type === "reload" || entry?.type === "back_forward";
};

let released = arrivesMidPage() ? Infinity : 0;
let scheduled = false;
const waiting = new Set<() => void>();

const releaseNext = () => {
  scheduled = false;
  released += 1;
  waiting.forEach((notify) => notify());
};

/** Lets the next step in once the browser has had a chance to paint what is already there. */
const schedule = () => {
  if (scheduled) return;
  scheduled = true;
  // Safari has no requestIdleCallback; a frame plus a task gets the paint in first there too.
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(releaseNext, { timeout: 100 });
  else window.requestAnimationFrame(() => window.setTimeout(releaseNext, 0));
};

type DeferredProps = {
  /** Position in the mounting order, from 1; steps sharing a number mount together. */
  step: number;
  /** Rough height to hold while unmounted, keeping the scrollbar steady as the page fills in. */
  placeholder?: string;
  children: ReactNode;
};

const Deferred = ({ step, placeholder = "100vh", children }: DeferredProps) => {
  const [ready, setReady] = useState(released >= step);

  useEffect(() => {
    if (ready) {
      // This step has landed; queue the next one.
      if (released === step) schedule();
      return;
    }
    const notify = () => {
      if (released >= step) setReady(true);
    };
    waiting.add(notify);
    // The first step sets the chain going; later ones wait for their predecessor to land.
    if (released === step - 1) schedule();
    return () => {
      waiting.delete(notify);
    };
  }, [ready, step]);

  return ready ? <>{children}</> : <div aria-hidden="true" style={{ minHeight: placeholder }} />;
};

export default Deferred;
