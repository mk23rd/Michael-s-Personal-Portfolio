import { useRef, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type MagneticProps = {
  children: ReactNode;
  /** How far the control follows the pointer, as a fraction of the distance from its centre. */
  strength?: number;
  className?: string;
};

/** Lets a control lean toward a mouse pointer and spring back. Inert for touch and reduced motion. */
const Magnetic = ({ children, strength = 0.3, className }: MagneticProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || reducedMotion || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <span ref={ref} className={cn("magnet", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
};

export default Magnetic;
