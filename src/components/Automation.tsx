import { automation, automationMore, profile } from "@/data/portfolio";
import { vars } from "@/lib/utils";
import Flow from "./Flow";
import SectionHeading from "./SectionHeading";

const Automation = () => (
  <section id="automation" className="section">
    <div className="wrap">
      <SectionHeading
        label="Automation and AI-enabled engineering"
        aside={`${profile.employer} · 2025 – present`}
        title="Automation that runs an IT operation, end to end."
        intro={`At ${profile.employer} I own automation from requirements and design through implementation, monitoring and production support. A selection of what is running today, built with Python, PowerShell, Power Automate and the Microsoft Graph.`}
      />

      <Flow />

      <div className="mt-16 flex items-end justify-between gap-6 lg:mt-20" data-reveal>
        <p className="label">A selection of what is running</p>
        <p className="label hidden sm:block">{automation.length} of {automation.length + automationMore.length}</p>
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {automation.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={item.title} data-reveal style={vars({ "--reveal-delay": `${(index % 3) * 80}ms` })}>
              <article className="auto-card">
                <span className="icon-well" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 text-lg font-medium leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.tools.join(" · ")}</p>
                <p className="mt-4 text-muted-foreground">{item.body}</p>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 grid gap-3 lg:grid-cols-12 lg:gap-16" data-reveal>
        <p className="label lg:col-span-3">Also running</p>
        <p className="text-muted-foreground lg:col-span-9">
          {automationMore.join(", ")}, alongside a Selenium suite that drives internal web apps and a Python bot
          that assembles Excel reports.
        </p>
      </div>
    </div>
  </section>
);

export default Automation;
