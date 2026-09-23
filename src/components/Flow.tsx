import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { automation, automationMore, pipeline, type PipelineNode } from "@/data/portfolio";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type Box = { left: number; top: number; right: number; bottom: number; cx: number; cy: number };
type Link = { id: string; from: string; to: string; d: string };

const round = (value: number) => Math.round(value * 10) / 10;

const horizontalCurve = (a: Box, b: Box) => {
  const mid = a.right + (b.left - a.right) / 2;
  return `M${round(a.right)} ${round(a.cy)} C${round(mid)} ${round(a.cy)}, ${round(mid)} ${round(b.cy)}, ${round(b.left)} ${round(b.cy)}`;
};

const verticalCurve = (a: Box, b: Box) => {
  const mid = a.bottom + (b.top - a.bottom) / 2;
  return `M${round(a.cx)} ${round(a.bottom)} C${round(a.cx)} ${round(mid)}, ${round(b.cx)} ${round(mid)}, ${round(b.cx)} ${round(b.top)}`;
};

const sameLinks = (a: Link[], b: Link[]) => a.length === b.length && a.every((link, i) => link.id === b[i].id && link.d === b[i].d);

const running = automation.length + automationMore.length;

/** Points sampled along each link for the packet keyframes; plenty for these gentle curves. */
const PACKET_STEPS = 48;
/** Fraction of the trip over which a packet grows in at the start and shrinks away at the end. */
const PACKET_FADE = 0.08;

/**
 * A live schematic of what the automation reads from, what runs it and where the results land.
 * Nodes are plain buttons laid out with CSS; the connectors are measured from the DOM and drawn
 * in an SVG overlay, with packets riding each path on a compositor-friendly transform animation.
 */
const Flow = () => {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const origin = root.getBoundingClientRect();
    const box = (id: string): Box | null => {
      const el = root.querySelector<HTMLElement>(`[data-node="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: r.left - origin.left,
        top: r.top - origin.top,
        right: r.right - origin.left,
        bottom: r.bottom - origin.top,
        cx: r.left - origin.left + r.width / 2,
        cy: r.top - origin.top + r.height / 2
      };
    };
    const core = box("core");
    const sources = box("sources");
    const outputs = box("outputs");
    if (!core || !sources || !outputs) return;

    const next: Link[] = [];
    // Side by side, every node gets its own curve; stacked, a single spine joins the three groups.
    if (core.left >= sources.right - 1) {
      pipeline.sources.forEach((node) => {
        const b = box(node.id);
        if (b) next.push({ id: `${node.id}-core`, from: node.id, to: "core", d: horizontalCurve(b, core) });
      });
      pipeline.outputs.forEach((node) => {
        const b = box(node.id);
        if (b) next.push({ id: `core-${node.id}`, from: "core", to: node.id, d: horizontalCurve(core, b) });
      });
    } else {
      next.push({ id: "sources-core", from: "sources", to: "core", d: verticalCurve(sources, core) });
      next.push({ id: "core-outputs", from: "core", to: "outputs", d: verticalCurve(core, outputs) });
    }
    // Same geometry, same state: no re-render (and no restarted packets) for a no-op resize.
    setLinks((current) => (sameLinks(current, next) ? current : next));
    setSize((current) => (current.width === origin.width && current.height === origin.height ? current : { width: origin.width, height: origin.height }));
  }, []);

  // Measured from ResizeObserver callbacks only: they run after layout, so the reads are free, whereas
  // measuring in an effect right after mount would force the browser to lay the page out early.
  // Watching the nodes as well as the board catches font swaps that move a node without resizing the board.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    root.querySelectorAll<HTMLElement>("[data-node]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [measure]);

  // Each packet follows its link on a transform-only animation sampled from the path, which stays on the
  // compositor. Scale stands in for the fade so `.is-dim` can still control opacity separately.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || links.length === 0) return;
    const animations: Animation[] = [];
    root.querySelectorAll<HTMLElement>(".flow-packet").forEach((packet, index) => {
      const path = root.querySelector<SVGPathElement>(`path[data-link="${packet.dataset.link}"]`);
      if (!path || typeof packet.animate !== "function") return;
      const length = path.getTotalLength();
      const keyframes = Array.from({ length: PACKET_STEPS + 1 }, (_, step) => {
        const t = step / PACKET_STEPS;
        const point = path.getPointAtLength(length * t);
        const scale = Math.min(1, t / PACKET_FADE, (1 - t) / PACKET_FADE);
        return { transform: `translate(${round(point.x)}px, ${round(point.y)}px) scale(${round(scale)})` };
      });
      const duration = (3.2 + (index % 4) * 0.45) * 1000;
      animations.push(
        packet.animate(keyframes, { duration, delay: -((index * 0.7) % 3.2) * 1000, iterations: Infinity, easing: "linear" })
      );
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [links, reduced]);

  // Which nodes and links light up for the active node.
  const lit = useMemo(() => {
    const nodes = new Set<string>();
    const paths = new Set<string>();
    if (!active) return { nodes, paths };
    const source = pipeline.sources.find((node) => node.id === active);
    const output = pipeline.outputs.find((node) => node.id === active);
    if (active === "core") {
      [...pipeline.sources, ...pipeline.outputs].forEach((node) => nodes.add(node.id));
      links.forEach((link) => paths.add(link.id));
    } else if (source) {
      source.to?.forEach((id) => {
        nodes.add(id);
        paths.add(`core-${id}`);
      });
      paths.add(`${source.id}-core`);
    } else if (output) {
      pipeline.sources
        .filter((node) => node.to?.includes(output.id))
        .forEach((node) => {
          nodes.add(node.id);
          paths.add(`${node.id}-core`);
        });
      paths.add(`core-${output.id}`);
    }
    nodes.add(active);
    nodes.add("core");
    paths.add("sources-core");
    paths.add("core-outputs");
    return { nodes, paths };
  }, [active, links]);

  const activeNode: PipelineNode | undefined =
    active === "core"
      ? pipeline.core
      : [...pipeline.sources, ...pipeline.outputs].find((node) => node.id === active);

  const nodeProps = (id: string) => ({
    "data-node": id,
    "data-cursor": "Trace",
    className: cn("flow-node", active && (lit.nodes.has(id) ? "is-lit" : "is-dim"), pinned === id && "is-pinned"),
    onPointerEnter: () => setHovered(id),
    onPointerLeave: () => setHovered(null),
    onFocus: () => setHovered(id),
    onBlur: () => setHovered(null),
    onClick: () => setPinned((current) => (current === id ? null : id)),
    "aria-pressed": pinned === id
  });
  const coreProps = nodeProps("core");

  return (
    <div className="flow-shell" data-reveal="fade">
      <div className="flow-head">
        <p className="label flex items-center gap-2.5">
          <span className="dot" aria-hidden="true" />
          Running now
        </p>
        <p className="label">
          {running} automations · {pipeline.sources.length} sources · {pipeline.outputs.length} destinations
        </p>
      </div>

      <div ref={rootRef} className={cn("flow", reduced && "is-static")}>
        <svg
          className="flow-lines"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
          aria-hidden="true"
          focusable="false"
        >
          {links.map((link) => (
            <path
              key={link.id}
              d={link.d}
              data-link={link.id}
              className={cn("flow-link", active && (lit.paths.has(link.id) ? "is-lit" : "is-dim"))}
            />
          ))}
        </svg>

        {!reduced &&
          links.map((link) => (
            <span
              key={link.id}
              className={cn("flow-packet", active && !lit.paths.has(link.id) && "is-dim")}
              data-link={link.id}
              aria-hidden="true"
            />
          ))}

        <div className="flow-col">
          <p className="flow-col-title">Reads from</p>
          <ul className="flow-list" data-node="sources" aria-label="Systems the automation reads from">
            {pipeline.sources.map((node) => (
              <li key={node.id}>
                <button type="button" {...nodeProps(node.id)}>
                  <span className="flow-node-label">{node.label}</span>
                  <span className="flow-node-sub">{node.sub}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flow-col flow-col-core">
          <p className="flow-col-title">Runs</p>
          <button type="button" {...coreProps} className={cn(coreProps.className, "flow-core")}>
            <span className="flow-core-lines" aria-hidden="true">
              <span>$ python inventory.py --reconcile</span>
              <span>$ pwsh ./Backup-Config.ps1 -All</span>
              <span>
                $ flow run alerts-to-teams<i className="flow-caret" />
              </span>
            </span>
            <span className="flow-node-label">{pipeline.core.label}</span>
            <span className="flow-node-sub">{pipeline.core.sub}</span>
          </button>
        </div>

        <div className="flow-col">
          <p className="flow-col-title">Delivers to</p>
          <ul className="flow-list" data-node="outputs" aria-label="Where the results are delivered">
            {pipeline.outputs.map((node) => (
              <li key={node.id}>
                <button type="button" {...nodeProps(node.id)}>
                  <span className="flow-node-label">{node.label}</span>
                  <span className="flow-node-sub">{node.sub}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="flow-caption" aria-live="polite">
        {activeNode ? (
          <>
            <span className="font-medium text-foreground">{activeNode.label}.</span> {activeNode.note}
          </>
        ) : (
          <>
            Hover or tap a node to trace its route. Everything on this board runs on a schedule, unattended
            <span className="hidden sm:inline">, with least-privilege access and a paper trail in SharePoint</span>.
          </>
        )}
      </p>
    </div>
  );
};

export default Flow;
