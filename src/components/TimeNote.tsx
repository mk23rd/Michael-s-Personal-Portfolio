import { useEffect, useState } from "react";
import { profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";

/** Addis Ababa keeps East Africa Time all year: UTC+3, no daylight saving. */
const ADDIS_OFFSET_MINUTES = 180;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const describeGap = (minutes: number) => {
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const rest = abs % 60;
  const amount = [hours && plural(hours, "hour"), rest && plural(rest, "minute")].filter(Boolean).join(" ");
  return `${amount} ${minutes > 0 ? "ahead of" : "behind"} you`;
};

const replyHint = (hour: number) => {
  if (hour >= 22 || hour < 7) return "I'm probably asleep, so expect a reply in the Addis morning.";
  if (hour < 18) return "It's the working day here, so you'll likely hear back today.";
  return "It's evening here; you'll have a reply by tomorrow morning at the latest.";
};

/** Tells the visitor what time it is in Addis relative to them, and when a reply is likely. */
const TimeNote = () => {
  const time = useLocalTime(profile.timeZone);
  // Read the visitor's offset after mount so a prerendered copy never bakes in the build machine's zone.
  const [visitorOffset, setVisitorOffset] = useState<number | null>(null);
  useEffect(() => setVisitorOffset(-new Date().getTimezoneOffset()), [time]);

  if (visitorOffset === null) return null;
  const gap = ADDIS_OFFSET_MINUTES - visitorOffset;
  const hour = Number(time.slice(0, 2));

  return (
    <p className="time-note" data-testid="time-note">
      <span className="dot" aria-hidden="true" />
      <span>
        It's <strong className="tabular-nums">{time}</strong> in {profile.city}
        {gap === 0 ? (
          <>
            , the same as where you are. <span lang="am">ሰላም</span>, neighbour.
          </>
        ) : (
          <>, {describeGap(gap)}.</>
        )}{" "}
        {replyHint(hour)}
      </span>
    </p>
  );
};

export default TimeNote;
