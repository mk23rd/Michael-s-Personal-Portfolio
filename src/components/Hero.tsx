import { Fragment } from "react";
import { ArrowDown, Download } from "lucide-react";
import { automation, automationMore, profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { vars } from "@/lib/utils";
import CardDeck from "./CardDeck";
import Magnetic from "./Magnetic";
import StatusLine from "./StatusLine";

const HEADLINE = ["From", "the", "cloud", "to", "the", "last", "pixel."];
// Index of the word after which the two-line composition breaks on wider screens.
const BREAK_AFTER = 2;

const Hero = () => {
  const time = useLocalTime(profile.timeZone);
  // The first line is the one assistive tech reads; the rest cycle through as a live readout.
  const status = [
    profile.status,
    `${time} in ${profile.city} · UTC+3`,
    `${automation.length + automationMore.length} automations in production at ${profile.employer}`,
    "AWS Solutions Architect – Associate"
  ];

  return (
    // `overflow-clip`, not `overflow-hidden`: the fanned deck cards hang past the fold on purpose, and a
    // hidden-overflow box is still a scroll container, so focusing/scrolling a card would shift the hero.
    <section id="top" className="relative overflow-clip pt-[calc(var(--header-height)+3.5rem)] md:pt-[calc(var(--header-height)+5rem)]">
      <div className="wrap flex flex-col items-center text-center">
        <p
          className="rise flex items-center gap-2.5 font-mono text-[0.8125rem] text-muted-foreground"
          style={vars({ "--d": "0ms" })}
        >
          <span className="dot" aria-hidden="true" />
          <StatusLine lines={status} className="whitespace-nowrap" />
        </p>

        <h1 className="display h1 mt-6 max-w-[15ch] sm:max-w-[13ch]">
          {HEADLINE.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="clip">
                <span className="rise" style={vars({ "--d": `${60 + index * 55}ms` })}>
                  {word}
                </span>
              </span>
              {/* The space stays so the text reads "cloud to" wherever the line break is hidden. */}
              {index === BREAK_AFTER && <br className="hidden sm:inline" />}
              {index < HEADLINE.length - 1 && " "}
            </Fragment>
          ))}
        </h1>

        <p className="lede rise mt-7 max-w-[40rem]" style={vars({ "--d": "420ms" })}>
          {profile.name} is an AI automation developer and AWS cloud engineer at {profile.employer}, in{" "}
          {profile.city}. Python and PowerShell for the automation, AWS and Microsoft 365 underneath, React on
          top, and an eye for how it all looks when it ships.
        </p>

        <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" style={vars({ "--d": "520ms" })}>
          <Magnetic>
            <a href="#work" className="pill pill-solid group">
              See selected work
              <ArrowDown
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:translate-y-0.5"
              />
            </a>
          </Magnetic>
          <Magnetic>
            <a href={profile.resume} className="pill pill-ghost group" download>
              <Download
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
              />
              Download CV
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="wrap mt-10 md:mt-14">
        <CardDeck />
      </div>
    </section>
  );
};

export default Hero;
