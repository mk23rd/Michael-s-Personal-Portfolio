import { services } from "@/data/portfolio";
import { vars } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

const Services = () => (
  <section id="services" className="section">
    <div className="wrap">
      <SectionHeading
        label="What I do"
        title="The work I'm good at, and the tools I reach for."
      />

      <ul className="border-b border-border">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <li key={service.title} className="row" data-reveal style={vars({ "--reveal-delay": `${index * 60}ms` })}>
              <div className="flex items-start gap-4">
                <span className="icon-well" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="display h3 pt-2">{service.title}</h3>
              </div>
              <p className="text-muted-foreground md:pt-2">{service.body}</p>
              <ul className="flex flex-wrap gap-2 md:justify-end md:pt-2" aria-label="Tools">
                {service.tools.map((tool) => (
                  <li key={tool} className="tag">
                    {tool}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default Services;
