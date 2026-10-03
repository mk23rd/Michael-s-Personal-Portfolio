import { useEffect, useState, type ReactNode } from "react";
import { profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { vars } from "@/lib/utils";

/** Addis Ababa keeps East Africa Time all year: UTC+3, no daylight saving. */
const ADDIS_OFFSET = 180;
const DAY = 1440;
/** My working day in Addis, and a typical one for whoever is reading, in minutes after midnight. */
const MY_DAY: [number, number] = [9 * 60, 18 * 60];
const YOUR_DAY: [number, number] = [9 * 60, 17 * 60];

type Span = [number, number];

const mod = (n: number) => ((n % DAY) + DAY) % DAY;

/** A span that may cross midnight, split into at most two pieces inside [0, DAY]. */
const spans = (start: number, length: number): Span[] => {
  const s = mod(start);
  const e = s + length;
  return e <= DAY ? [[s, e]] : [[s, DAY], [0, e - DAY]];
};

const intersect = (a: Span[], b: Span[]) =>
  a.flatMap(([s1, e1]) => b.map(([s2, e2]): Span => [Math.max(s1, s2), Math.min(e1, e2)])).filter(([s, e]) => e > s);

const hhmm = (m: number) => {
  const t = mod(Math.round(m));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const duration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && plural(h, "hour"), m && plural(m, "minute")].filter(Boolean).join(" ");
};

const replyHint = (addisHour: number) => {
  if (addisHour >= 22 || addisHour < 7) return "Right now I'm probably asleep; expect a reply in the Addis morning.";
  if (addisHour < 18) return "It's the working day here, so you'll likely hear back today.";
  return "It's evening here; you'll have a reply by tomorrow morning at the latest.";
};

const pct = (m: number) => `${(m / DAY) * 100}%`;
const Band = ({ span, className }: { span: Span; className: string }) => (
  <span className={className} style={vars({ "--x": pct(span[0]), "--w": pct(span[1] - span[0]) })} />
);

/**
 * In Contact: my working day and the visitor's drawn on one 24-hour ruler in the visitor's own time,
 * with a "now" line, and a sentence that says the same thing for everyone who can't see the ruler.
 */
const TimeNote = () => {
  const addisTime = useLocalTime(profile.timeZone);
  // Read the visitor's clock after mount so a prerendered copy never bakes in the build machine's zone.
  const [visitor, setVisitor] = useState<{ offset: number; minutes: number } | null>(null);
  useEffect(() => {
    const d = new Date();
    setVisitor({ offset: -d.getTimezoneOffset(), minutes: d.getHours() * 60 + d.getMinutes() });
  }, [addisTime]);

  if (!visitor) return null;

  // How far Addis is ahead of the visitor; everything below is drawn in the visitor's local time.
  const gap = ADDIS_OFFSET - visitor.offset;
  const mine = spans(MY_DAY[0] - gap, MY_DAY[1] - MY_DAY[0]);
  const yours = spans(YOUR_DAY[0], YOUR_DAY[1] - YOUR_DAY[0]);
  const shared = intersect(mine, yours);
  const sharedMinutes = shared.reduce((sum, [s, e]) => sum + e - s, 0);
  const longest = [...shared].sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];
  const addisHour = Number(addisTime.slice(0, 2));

  const relation = gap === 0 ? "the same as you" : `${duration(Math.abs(gap))} ${gap > 0 ? "ahead of" : "behind"} you`;
  const gapLabel = gap === 0 ? "same time" : `${duration(Math.abs(gap))} ${gap > 0 ? "behind" : "ahead"}`;

  let summary: ReactNode;
  if (gap === 0) {
    summary = (
      <>
        You're on Addis time too, so our working days line up exactly. <span lang="am">ሰላም</span>, neighbour.
      </>
    );
  } else if (longest) {
    summary = (
      <>
        Our working days overlap by <strong>{duration(sharedMinutes)}</strong>: your {hhmm(longest[0])}–
        {hhmm(longest[1])} is my {hhmm(longest[0] + gap)}–{hhmm(longest[1] + gap)}.
      </>
    );
  } else {
    summary = (
      <>
        Our working days don't overlap: my {hhmm(MY_DAY[0])}–{hhmm(MY_DAY[1])} is your {hhmm(MY_DAY[0] - gap)}–
        {hhmm(MY_DAY[1] - gap)}, so I'll pick your message up first thing.
      </>
    );
  }

  return (
    <figure className="tz">
      <div className="tz-clocks" aria-hidden="true">
        <p>
          <span className="tz-label">{profile.city}</span>
          <strong className="tz-time">{addisTime}</strong>
        </p>
        <p>
          <span className="tz-label">You · {gapLabel}</span>
          <strong className="tz-time">{hhmm(visitor.minutes)}</strong>
        </p>
      </div>

      <div className="tz-ruler" aria-hidden="true">
        <span className="tz-name">Me</span>
        <span className="tz-track">
          {mine.map((s) => (
            <Band key={s[0]} span={s} className="tz-band tz-band-me" />
          ))}
        </span>
        <span className="tz-name">You</span>
        <span className="tz-track">
          {yours.map((s) => (
            <Band key={s[0]} span={s} className="tz-band tz-band-you" />
          ))}
        </span>
        <span className="tz-overlay">
          {shared.map((s) => (
            <Band key={s[0]} span={s} className="tz-shared" />
          ))}
          <span className="tz-now" style={vars({ "--x": pct(visitor.minutes) })} />
        </span>
        <span className="tz-ticks">
          {[0, 6, 12, 18, 24].map((h) => (
            <span key={h} style={vars({ "--x": pct(h * 60) })}>
              {String(h).padStart(2, "0")}
            </span>
          ))}
        </span>
      </div>

      <figcaption className="tz-note" data-testid="time-note">
        <span className="sr-only">{`It's ${addisTime} in ${profile.city}, ${relation}. `}</span>
        {summary} {replyHint(addisHour)}
      </figcaption>
    </figure>
  );
};

export default TimeNote;
