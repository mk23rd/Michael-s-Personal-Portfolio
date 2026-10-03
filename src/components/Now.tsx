import { now, profile } from "@/data/portfolio";
import { useEthiopianDate } from "@/hooks/use-ethiopian-date";
import { useLocalTime } from "@/hooks/use-local-time";
import { ETHIOPIAN_MONTHS, formatEthiopian } from "@/lib/ethiopian-calendar";
import { vars } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

const updated = new Date(`${now.updated}T12:00:00+03:00`);
const updatedLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(updated);

/** A /now page in miniature: a ruled notebook page of current focus, beside a tear-off leaf of the Ethiopian calendar. */
const Now = () => {
  const today = useEthiopianDate(profile.timeZone);
  const time = useLocalTime(profile.timeZone);
  const month = ETHIOPIAN_MONTHS[today.month - 1];
  const gregorian = new Intl.DateTimeFormat("en-GB", {
    timeZone: profile.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());

  return (
    <section id="now" className="section" aria-labelledby="now-title">
      <div className="wrap">
        <SectionHeading
          label="Now"
          title={<span id="now-title">What I'm up to at the moment.</span>}
          intro="Not a pitch, just a page from the notebook. If you're reading this months from now, some of it has probably moved on."
          aside={
            <span>
              Updated <time dateTime={now.updated}>{updatedLabel}</time>
            </span>
          }
        />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="notebook lg:col-span-8" data-reveal>
            <span className="tape" aria-hidden="true" />
            <dl>
              {now.entries.map((entry) => (
                <div key={entry.term} className="notebook-row">
                  <dt>{entry.term}</dt>
                  <dd>{entry.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="leaf lg:col-span-4" data-reveal style={vars({ "--reveal-delay": "120ms" })}>
            <div className="leaf-head">
              <span lang="am">{month.am}</span>
              <span>{month.en}</span>
            </div>
            <p className="leaf-day" aria-hidden="true">
              {today.day}
            </p>
            <p className="leaf-year">
              <span className="sr-only">{formatEthiopian(today)}</span>
              <span aria-hidden="true">{today.year} E.C.</span>
            </p>
            <figcaption className="leaf-foot">
              <span>{gregorian} in the Gregorian calendar</span>
              <span className="tabular-nums">
                {time} in {profile.city}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Now;
