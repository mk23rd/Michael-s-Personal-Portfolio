import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/theme-context";
import { automation, automationMore, profile, projects, timeline } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { finishBoot, isBooting, LOG_MS } from "@/lib/boot";
import { vars } from "@/lib/utils";

const WIPE_MS = 700;
const certs = timeline.filter(
  (entry) => entry.kind === "Certification" && entry.org === "Amazon Web Services" && entry.period !== "In progress"
).length;

/**
 * First-visit boot log. Purely decorative (hidden from assistive tech), over in about two seconds,
 * and any click or key skips it.
 */
const Boot = () => {
  const [phase, setPhase] = useState<"log" | "wipe" | "gone">(() => (isBooting() ? "log" : "gone"));
  const { theme } = useTheme();
  const time = useLocalTime(profile.timeZone);
  const skipped = useRef(false);

  useEffect(() => {
    if (phase === "wipe") {
      const id = window.setTimeout(() => setPhase("gone"), WIPE_MS);
      return () => window.clearTimeout(id);
    }
    if (phase !== "log") return;

    const leave = (skip: boolean) => {
      skipped.current = skip;
      finishBoot(skip);
      setPhase("wipe");
    };
    const timer = window.setTimeout(() => leave(false), LOG_MS);
    const skip = () => {
      window.clearTimeout(timer);
      leave(true);
    };

    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [phase]);

  if (phase === "gone") return null;

  const host = profile.city.toLowerCase().replace(/\s+/g, "-");
  const lines = [
    `${profile.name.split(" ")[0].toLowerCase()}@${host}:~$ run portfolio`,
    `${projects.length} projects · ${automation.length + automationMore.length} automations · ${certs} aws certs`,
    `${time} in ${profile.city.toLowerCase()} · ${theme} theme`,
    "ready."
  ];

  return (
    <div className={`boot${phase === "wipe" ? " is-done" : ""}${skipped.current ? " is-skipped" : ""}`} aria-hidden="true">
      <span className="boot-bar" />
      <div className="boot-log">
        {lines.map((line, index) => (
          <span key={line} className="boot-line" style={vars({ "--d": `${index * 280}ms` })}>
            {line}
          </span>
        ))}
      </div>
      <p className="boot-hint">
        <span className="sm:hidden">tap to skip</span>
        <span className="hidden sm:inline">click to skip</span>
      </p>
    </div>
  );
};

export default Boot;
