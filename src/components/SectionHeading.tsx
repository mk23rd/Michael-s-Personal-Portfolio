import type { ReactNode } from "react";
import { cn, vars } from "@/lib/utils";

type SectionHeadingProps = {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

/** Editorial section header: quiet label on the left, statement on the right. */
const SectionHeading = ({ label, title, intro, aside, className }: SectionHeadingProps) => (
  <div className={cn("split mb-12 md:mb-16", className)}>
    <div className="flex flex-wrap items-start justify-between gap-4 lg:block" data-reveal>
      <p className="label">{label}</p>
      {aside && <div className="label lg:mt-2">{aside}</div>}
    </div>
    <div>
      <h2 className="display h2" data-reveal>
        {title}
      </h2>
      {intro && (
        <p className="lede measure mt-6" data-reveal style={vars({ "--reveal-delay": "80ms" })}>
          {intro}
        </p>
      )}
    </div>
  </div>
);

export default SectionHeading;
