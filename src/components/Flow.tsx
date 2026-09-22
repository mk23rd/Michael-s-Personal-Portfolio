import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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

const running = automation.length + automationMore.length;

/**
 * A live schematic of what the automation reads from, what runs it and where the results land.
 * Nodes are plain buttons laid out with CSS; the connectors are measured from the DOM and drawn
 * in an SVG overlay, with packets riding each path via CSS motion paths.
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
    setLinks(next);
    setSize({ width: origin.width, height: origin.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => observer.disconnect();
  }, [measure]);

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
              className={cn("flow-link", active && (lit.paths.has(link.id) ? "is-lit" : "is-dim"))}
            />
          ))}
        </svg>

        {!reduced &&
          links.map((link, index) => (
            <span
              key={link.id}
              className={cn("flow-packet", active && !lit.paths.has(link.id) && "is-dim")}
              style={{
                offsetPath: `path("${link.d}")`,
                animationDuration: `${3.2 + (index % 4) * 0.45}s`,
                animationDelay: `-${(index * 0.7) % 3.2}s`
              }}
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
