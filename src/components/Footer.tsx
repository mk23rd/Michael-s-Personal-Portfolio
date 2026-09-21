import { ArrowUp, ArrowUpRight, FileText } from "lucide-react";
import { profile, socials } from "@/data/portfolio";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border pb-8 pt-16 md:pt-24">
      <div className="wrap">
        <p
          className="display select-none text-[clamp(2.75rem,11.5vw,11.5rem)] leading-[0.9] tracking-[-0.045em]"
          aria-hidden="true"
        >
          Michael Wagaye
        </p>

        <div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-3 md:items-start">
          <div className="text-sm text-muted-foreground">
            <p>{profile.role}</p>
            <p>
              {profile.employer} · {profile.city}, {profile.country}
            </p>
            <a href={`mailto:${profile.email}`} className="link-line mt-3 inline-block text-foreground">
              {profile.email}
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Social links">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-line group inline-flex items-center gap-1.5"
                  >
                    <Icon size={14} aria-hidden="true" />
                    {social.label}
                    <ArrowUpRight
                      size={14}
                      aria-hidden="true"
                      className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              );
            })}
            <li>
              <a href={profile.resume} className="link-line inline-flex items-center gap-1.5" download>
                <FileText size={14} aria-hidden="true" />
                CV (PDF)
              </a>
            </li>
          </ul>

          <div className="flex items-center justify-between gap-6 text-sm text-muted-foreground md:justify-end">
            <p>© {year} Michael Wagaye</p>
            <a href="#top" className="pill pill-ghost group">
              Back to top
              <ArrowUp
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
