import { useState } from "react";
import { Award, BriefcaseBusiness, GraduationCap, type LucideIcon } from "lucide-react";
import { timeline, type TimelineKind } from "@/data/portfolio";
import { vars } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

type Filter = TimelineKind | "All";

const FILTERS: Filter[] = ["All", "Work", "Education", "Certification"];

const KIND_ICON: Record<TimelineKind, LucideIcon> = {
  Work: BriefcaseBusiness,
  Education: GraduationCap,
  Certification: Award
};

const countFor = (filter: Filter) =>
  filter === "All" ? timeline.length : timeline.filter((entry) => entry.kind === filter).length;

const Timeline = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const entries = timeline
    .filter((entry) => filter === "All" || entry.kind === filter)
    .sort((a, b) => b.sortYear - a.sortYear);

  return (
    <section id="experience" className="section">
      <div className="wrap">
        <SectionHeading
          label="Experience and education"
          title="Where I've studied, worked and been tested."
          aside={
            <div className="flex flex-wrap gap-2 lg:mt-4" role="group" aria-label="Filter entries">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="chip"
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {option === "Certification" ? "Certifications" : option}
                  <span className="chip-count">{countFor(option)}</span>
                </button>
              ))}
            </div>
          }
        />

        {/* The list re-mounts per filter so entries can stagger back in; the wrapper keeps the scroll reveal. */}
        <div className="border-b border-border" data-reveal>
          <ol key={filter}>
            {entries.map((entry, index) => {
              const Icon = KIND_ICON[entry.kind];
              return (
                <li key={entry.title} className="entry enter" style={vars({ "--d": `${Math.min(index, 6) * 40}ms` })}>
                  <p className="label tabular-nums">{entry.period}</p>
                  <div>
                    <h3 className="text-lg font-medium leading-snug">{entry.title}</h3>
                    <p className="text-muted-foreground">{entry.org}</p>
                    <p className="mt-2 max-w-[60ch] text-muted-foreground">{entry.detail}</p>
                  </div>
                  <span className="tag gap-1.5 self-start md:self-baseline">
                    <Icon size={14} aria-hidden="true" />
                    {entry.kind}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
