import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  CornerDownLeft,
  Copy,
  Download,
  FolderGit2,
  Globe,
  Hash,
  Mail,
  MoonStar,
  Search,
  Terminal,
  X,
  type LucideIcon
} from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { automation, automationMore, navigation, profile, projects, socials, timeline } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { cn } from "@/lib/utils";
import { goTo, isApplePlatform, onPaletteOpen, openPalette } from "@/lib/palette";

type Group = "Sections" | "Projects" | "Actions" | "Elsewhere";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: Group;
  keywords: string;
  icon: LucideIcon;
  /** Return "keep" to leave the palette open after running (copy, theme). */
  run: () => void | "keep";
};

type Command = {
  name: string;
  about: string;
  /** Matches the whole query, so aliases and arguments can be accepted. */
  test: (query: string) => boolean;
  run: () => string[] | "keep";
};

const GROUP_ORDER: Group[] = ["Sections", "Projects", "Actions", "Elsewhere"];

const score = (item: Item, query: string) => {
  if (!query) return 1;
  const label = item.label.toLowerCase();
  if (label.startsWith(query)) return 4;
  const haystack = `${label} ${item.keywords.toLowerCase()}`;
  if (haystack.includes(query)) return 3;
  // Loose subsequence match so "gh" still finds "GitHub"; kept to short queries so it stays precise.
  if (query.length > 4) return 0;
  let i = 0;
  for (const char of haystack) {
    if (char === query[i]) i += 1;
    if (i === query.length) return 1;
  }
  return 0;
};

const download = (href: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = "";
  document.body.append(link);
  link.click();
  link.remove();
};

const CommandPalette = () => {
  const { theme, toggleTheme } = useTheme();
  const time = useLocalTime(profile.timeZone);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [response, setResponse] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef(0);

  const close = useCallback(() => setOpen(false), []);

  const items = useMemo<Item[]>(() => {
    const go = (hash: string) => () => {
      goTo(hash);
      returnFocusRef.current = null;
    };
    const sections: Item[] = navigation.map((entry) => ({
      id: `nav-${entry.href}`,
      label: entry.label,
      group: "Sections",
      keywords: `go jump section ${entry.href}`,
      icon: Hash,
      run: go(entry.href)
    }));
    const work: Item[] = projects.map((project) => ({
      id: `project-${project.id}`,
      label: project.title,
      hint: project.summary,
      group: "Projects",
      keywords: `${project.kind} ${project.year} ${project.stack.join(" ")} ${project.summary}`,
      icon: FolderGit2,
      run: go(`#${project.id}`)
    }));
    const actions: Item[] = [
      {
        id: "copy-email",
        label: "Copy email address",
        hint: profile.email,
        group: "Actions",
        keywords: "mail contact clipboard",
        icon: Copy,
        run: () => {
          void navigator.clipboard?.writeText(profile.email);
          setResponse([`Copied ${profile.email} to the clipboard.`]);
          return "keep";
        }
      },
      {
        id: "email",
        label: "Start an email",
        hint: "Opens your mail app",
        group: "Actions",
        keywords: "mailto write message hire",
        icon: Mail,
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        }
      },
      {
        id: "cv",
        label: "Download CV",
        hint: "Two-page PDF",
        group: "Actions",
        keywords: "resume pdf curriculum vitae",
        icon: Download,
        run: () => download(profile.resume)
      },
      {
        id: "theme",
        label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
        group: "Actions",
        keywords: "dark light mode appearance colour toggle",
        icon: MoonStar,
        run: () => {
          toggleTheme();
          setResponse([`Theme set to ${theme === "dark" ? "light" : "dark"}.`]);
          return "keep";
        }
      }
    ];
    const elsewhere: Item[] = socials.map((social) => ({
      id: `social-${social.label}`,
      label: `Open ${social.label}`,
      hint: `@${social.handle}`,
      group: "Elsewhere",
      keywords: `profile social link ${social.handle}`,
      icon: social.icon,
      run: () => {
        window.open(social.href, "_blank", "noreferrer");
      }
    }));
    const live = projects
      .filter((project) => project.live)
      .map<Item>((project) => ({
        id: `live-${project.id}`,
        label: `Open ${project.title} live`,
        hint: project.live!.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        group: "Elsewhere",
        keywords: "site deployed demo website",
        icon: Globe,
        run: () => {
          window.open(project.live, "_blank", "noreferrer");
        }
      }));
    return [...sections, ...work, ...actions, ...elsewhere, ...live];
  }, [theme, toggleTheme]);

  const commands = useMemo<Command[]>(() => {
    const started = new Date("2025-12-01T00:00:00+03:00");
    const running = automation.length + automationMore.length;
    const certs = timeline.filter((entry) => entry.kind === "Certification" && entry.org === "Amazon Web Services");
    const list: Command[] = [
      {
        name: "help",
        about: "List the commands",
        test: (q) => q === "help" || q === "?",
        run: () => list.map((command) => `${command.name.padEnd(12, " ")} ${command.about}`)
      },
      {
        name: "whoami",
        about: "Who is behind this site",
        test: (q) => q === "whoami",
        run: () => [
          `${profile.name} — ${profile.role} at ${profile.employer}, ${profile.city}.`,
          `${certs.filter((c) => !c.period.includes("progress")).length} AWS certifications, one more in progress.`,
          `${profile.status}.`
        ]
      },
      {
        name: "uptime",
        about: "How long the automations have been running",
        test: (q) => q === "uptime",
        run: () => {
          const days = Math.floor((Date.now() - started.getTime()) / 86_400_000);
          return [
            days >= 0 ? `up ${days} days at ${profile.employer}` : `${profile.employer} starts in ${-days} days`,
            `${running} automations running, 0 dashboards checked by hand.`,
            `${time} in ${profile.city} (UTC+3).`
          ];
        }
      },
      {
        name: "ls",
        about: "List the projects",
        test: (q) => q === "ls" || q.startsWith("ls "),
        run: () => projects.map((project) => `${project.year}  ${project.title.padEnd(20, " ")} ${project.summary}`)
      },
      {
        name: "cat cv",
        about: "Download the CV",
        test: (q) => q === "cat cv" || q === "cat resume",
        run: () => {
          download(profile.resume);
          return [`Downloading ${profile.resume.slice(1)}…`];
        }
      },
      {
        name: "sudo hire",
        about: "You know what this does",
        test: (q) => q.startsWith("sudo hire"),
        run: () => {
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setOpen(false);
            goTo("#contact");
            window.setTimeout(() => document.getElementById("contact-name")?.focus({ preventScroll: true }), 700);
          }, 900);
          return ["[sudo] password for recruiter: ••••••••", "Permission granted. Opening the contact form…"];
        }
      },
      {
        name: "clear",
        about: "Clear the screen",
        test: (q) => q === "clear" || q === "cls",
        run: () => {
          setQuery("");
          return "keep";
        }
      }
    ];
    return list;
  }, [time]);

  const normalized = query.trim().toLowerCase();
  const command = normalized ? commands.find((entry) => entry.test(normalized)) : undefined;

  const results = useMemo(() => {
    // Command mode shows the response alone; only `ls` borrows the list to show the projects.
    if (command) return command.name === "ls" ? items.filter((item) => item.group === "Projects") : [];
    return items
      .map((item, index) => ({ item, index, score: score(item, normalized) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((entry) => entry.item);
  }, [items, normalized, command]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({ group, entries: results.filter((item) => item.group === group) })).filter(
        (section) => section.entries.length > 0
      ),
    [results]
  );

  // Open from the hotkey or the nav button, remembering where focus came from.
  useEffect(() => {
    const show = () => {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    const off = onPaletteOpen(show);
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, [open]);

  // Lock and hide the page behind the dialog while it is open; restore focus afterwards.
  useEffect(() => {
    if (!open) return;
    const behind = Array.from(document.querySelectorAll<HTMLElement>("header, #main, footer, #site-menu"));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    behind.forEach((el) => el.setAttribute("inert", ""));
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      behind.forEach((el) => el.removeAttribute("inert"));
      returnFocusRef.current?.focus();
      setQuery("");
      setResponse(null);
      setActive(0);
    };
  }, [open]);

  useEffect(() => setActive(0), [normalized]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (item: Item) => {
    const outcome = item.run();
    if (outcome !== "keep") setOpen(false);
  };

  const runCommand = (entry: Command) => {
    const outcome = entry.run();
    setResponse(outcome === "keep" ? null : outcome);
  };

  const suggest = (sample: string) => {
    setQuery(sample);
    setResponse(null);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => (results.length ? (index + 1) % results.length : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
        break;
      case "Home":
        if (results.length) {
          event.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (results.length) {
          event.preventDefault();
          setActive(results.length - 1);
        }
        break;
      case "Enter":
        event.preventDefault();
        if (command) runCommand(command);
        else if (results[active]) run(results[active]);
        break;
      case "Tab": {
        // Keep focus inside the dialog, cycling through its controls in either direction.
        const root = event.currentTarget.querySelectorAll<HTMLElement>(
          ".palette input, .palette button:not([tabindex='-1'])"
        );
        const focusable = Array.from(root);
        if (!focusable.length) break;
        event.preventDefault();
        const current = focusable.indexOf(document.activeElement as HTMLElement);
        const step = event.shiftKey ? -1 : 1;
        focusable[(current + step + focusable.length) % focusable.length]?.focus();
        break;
      }
      default:
        break;
    }
  };

  if (!open) return null;

  const activeId = results[active] ? `palette-option-${results[active].id}` : undefined;
  const empty = results.length === 0 && !command;

  return (
    <div className="palette-root" onKeyDown={onKeyDown}>
      <div className="palette-backdrop" onClick={close} aria-hidden="true" />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="palette-head">
          <span className="palette-prompt" aria-hidden="true">
            <Terminal size={16} strokeWidth={1.75} />
          </span>
          <input
            ref={inputRef}
            className="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Jump to a section, open a project, or type a command…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setResponse(null);
            }}
          />
          <button type="button" className="palette-close" onClick={close} aria-label="Close command palette">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {(response || command) && (
          <div className="palette-response" role="status" aria-live="polite">
            <p className="palette-echo">
              <span aria-hidden="true">$ </span>
              {normalized || "…"}
            </p>
            {response ? (
              response.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)
            ) : (
              <p className="text-muted-foreground">
                Press <kbd className="kbd">↵</kbd> to run <span className="font-medium text-foreground">{command?.name}</span>
                {" · "}
                {command?.about}
              </p>
            )}
          </div>
        )}

        <ul ref={listRef} id="palette-list" className="palette-list" role="listbox" aria-label="Results">
          {grouped.map((section) => (
            <li key={section.group} role="presentation">
              <p className="palette-group" role="presentation">
                {section.group}
              </p>
              <ul role="group" aria-label={section.group}>
                {section.entries.map((item) => {
                  const index = results.indexOf(item);
                  const Icon = item.icon;
                  const selected = index === active;
                  return (
                    <li
                      key={item.id}
                      id={`palette-option-${item.id}`}
                      role="option"
                      aria-selected={selected}
                      data-index={index}
                      className={cn("palette-item", selected && "is-active")}
                      onMouseMove={() => setActive(index)}
                      onClick={() => run(item)}
                    >
                      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                        {item.hint && <span className="palette-hint"> {item.hint}</span>}
                      </span>
                      {selected && <CornerDownLeft size={14} aria-hidden="true" className="text-muted-foreground" />}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          {empty && (
            <li role="presentation" className="palette-empty">
              <Search size={16} strokeWidth={1.75} aria-hidden="true" />
              <p>
                Nothing matches “{query.trim()}”. Try <span className="font-medium text-foreground">whoami</span>,{" "}
                <span className="font-medium text-foreground">uptime</span> or{" "}
                <span className="font-medium text-foreground">help</span>, or{" "}
                <a
                  href={`mailto:${profile.email}?subject=${encodeURIComponent(query.trim())}`}
                  className="link-line text-foreground"
                  tabIndex={-1}
                  onClick={close}
                >
                  ask me directly
                </a>
                .
              </p>
            </li>
          )}
        </ul>

        <div className="palette-foot">
          <p>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> move <kbd className="kbd">↵</kbd> select <kbd className="kbd">esc</kbd> close
          </p>
          <p className="hidden sm:block">
            Try
            {["whoami", "uptime", "sudo hire michael"].map((sample) => (
              <button key={sample} type="button" className="palette-try" onClick={() => suggest(sample)}>
                {sample}
              </button>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

/** Nav affordance for the palette: shows the platform's shortcut on wide screens. */
export const PaletteTrigger = ({ className }: { className?: string }) => {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(isApplePlatform()), []);
  return (
    <button
      type="button"
      className={cn("palette-trigger", className)}
      onClick={openPalette}
      aria-label="Open command palette"
      title={`Command palette (${mac ? "⌘" : "Ctrl"} K)`}
    >
      <Terminal size={16} strokeWidth={1.75} aria-hidden="true" />
      <span className="palette-trigger-keys" aria-hidden="true">
        <kbd className="kbd">{mac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
};

export default CommandPalette;
