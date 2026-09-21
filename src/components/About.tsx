import {
  BadgeCheck,
  Briefcase,
  Crosshair,
  GraduationCap,
  Handshake,
  MapPin,
  type LucideIcon
} from "lucide-react";
import { profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { vars } from "@/lib/utils";
import RotatingBadge from "./RotatingBadge";

type Fact = { term: string; detail: string; extra?: string; icon: LucideIcon };

const About = () => {
  const time = useLocalTime(profile.timeZone);

  const facts: Fact[] = [
    { term: "Currently", detail: `${profile.role} at ${profile.employer}`, icon: Briefcase },
    { term: "Based in", detail: `${profile.city}, ${profile.country}`, extra: `${time} local`, icon: MapPin },
    { term: "Focus", detail: "IT automation, AI-assisted operations, AWS and Microsoft 365", icon: Crosshair },
    { term: "Education", detail: "BSc Computer Science, HiLCoE, 2025", icon: GraduationCap },
    { term: "Certified", detail: "AWS Solutions Architect – Associate; Professional in progress", icon: BadgeCheck },
    { term: "Status", detail: `${profile.status}, remote or in ${profile.city}`, icon: Handshake }
  ];

  return (
    <section id="about" className="section">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
        <figure className="relative lg:col-span-5 lg:self-start" data-reveal="scale">
          <div className="group aspect-[4/5] w-full overflow-hidden rounded-3xl">
            <img
              src={profile.portrait}
              alt="Michael Wagaye in a dark suit, photographed outdoors"
              width={1200}
              height={1600}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            />
          </div>
          <RotatingBadge
            text="Open to work · Addis Ababa · UTC+3 · "
            className="-bottom-5 -right-3 sm:-right-5 lg:-right-8"
          />
        </figure>

        <div className="lg:col-span-7 lg:pt-2">
          <p className="label" data-reveal>
            About
          </p>
          <h2 className="display h2 mt-4" data-reveal="mask">
            I like the parts of software that have to keep running.
          </h2>
          <div className="mt-8 flex flex-col gap-5 text-muted-foreground" data-reveal style={vars({ "--reveal-delay": "80ms" })}>
            <p className="text-lg text-foreground">
              I'm an AI automation developer and cloud engineer at {profile.employer} in {profile.city}: a computer
              science graduate from HiLCoE with two AWS certifications and a habit of asking how a system fails
              before asking how it scales.
            </p>
            <p>
              My days are spent turning operational problems into software that runs unattended: Python and
              PowerShell pipelines, Power Automate flows, Microsoft Graph integrations and monitoring across
              Zabbix, Wazuh and Graylog, all owned from the first requirements conversation to production
              support. Before that I built full-stack web apps and trained young developers at YeMuyaWeg, which
              taught me to explain a system as carefully as I build it.
            </p>
            <p>
              I bring a consulting mindset to engineering: discovery first, then a design people can argue with,
              then documentation and hand-over so the work outlives me.
            </p>
          </div>

          <dl className="mt-10 border-t border-border" data-reveal style={vars({ "--reveal-delay": "140ms" })}>
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div key={fact.term} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="label flex items-center gap-2">
                    <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                    {fact.term}
                  </dt>
                  <dd className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span>{fact.detail}</span>
                    {fact.extra && (
                      <span className="label tabular-nums" aria-live="off">
                        {fact.extra}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default About;
