import { ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type RotatingBadgeProps = {
  text: string;
  className?: string;
};

// Circumference of the r=37 path below, so the text is spaced evenly around the ring.
const RING_LENGTH = 232.5;

/** A slowly turning ring of text around an arrow; decorative, so hidden from assistive tech. */
const RotatingBadge = ({ text, className }: RotatingBadgeProps) => (
  <div className={cn("badge-spin", className)} aria-hidden="true">
    <svg className="ring" viewBox="0 0 100 100">
      <defs>
        <path id="badge-ring-path" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
      </defs>
      <text>
        <textPath href="#badge-ring-path" textLength={RING_LENGTH} lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
    </svg>
    <ArrowDownRight size={22} strokeWidth={1.75} />
  </div>
);

export default RotatingBadge;
