import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Loader2, Mail, MapPin, Phone, Send, type LucideIcon } from "lucide-react";
import { profile, socials } from "@/data/portfolio";
import { cn } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

type Channel = { term: string; value: string; href?: string; icon: LucideIcon };

const Contact = () => {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Netlify Forms picks up the POST as long as the field names match the static form in index.html.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new URLSearchParams();
    new FormData(form).forEach((value, key) => body.append(key, String(value)));
    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });
      if (!response.ok) throw new Error(`Form endpoint responded with ${response.status}`);
      form.reset();
      setStatus({ kind: "sent" });
    } catch (error) {
      console.error("Form submission failed", error);
      setStatus({
        kind: "error",
        message: `The form didn't go through. Email me directly at ${profile.email} instead.`
      });
    }
  };

  const channels: Channel[] = [
    { term: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail },
    { term: "Phone", value: profile.phone, href: profile.phoneHref, icon: Phone },
    { term: "Location", value: `${profile.city}, ${profile.country}`, icon: MapPin }
  ];

  return (
    <section id="contact" className="section">
      <div className="wrap">
        <div>
          <p className="label" data-reveal>
            Contact
          </p>
          <h2 className="display h2 mt-4 max-w-[18ch]" data-reveal="mask">
            Have a project or a role in mind? Let's talk.
          </h2>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5" data-reveal>
            <p className="lede">
              I read everything that comes in and reply within a day. If a form feels like too much, any of
              these work just as well.
            </p>

            <dl className="mt-8 border-t border-border">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.term}
                    className="grid gap-1 border-b border-border py-4 sm:grid-cols-[7rem_1fr] sm:gap-6"
                  >
                    <dt className="label inline-flex items-center gap-2">
                      <Icon size={14} aria-hidden="true" />
                      {channel.term}
                    </dt>
                    <dd>
                      {channel.href ? (
                        <a href={channel.href} className="link-line">
                          {channel.value}
                        </a>
                      ) : (
                        channel.value
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Elsewhere">
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
                      <Icon size={16} aria-hidden="true" />
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
            </ul>
          </div>

          <form
            name="contact"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 lg:col-span-7"
            data-reveal
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden">
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="field"
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="field"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={6}
                className="field resize-y"
                placeholder="A few lines about the role or the project"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="pill pill-solid group"
                disabled={status.kind === "sending"}
                aria-busy={status.kind === "sending"}
              >
                {status.kind === "sending" ? (
                  <>
                    <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                    Sending…
                  </>
                ) : status.kind === "sent" ? (
                  <>
                    <Check size={16} aria-hidden="true" />
                    Sent
                  </>
                ) : (
                  <>
                    Send message
                    <Send
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
              <p
                role="status"
                aria-live="polite"
                className={cn("text-sm", status.kind === "error" ? "text-destructive" : "text-muted-foreground")}
              >
                {status.kind === "sent" && "Thanks, it's on its way. I'll reply within a day."}
                {status.kind === "error" && status.message}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
