import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { navigation, profile } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn, vars } from "@/lib/utils";
import { PaletteTrigger } from "./CommandPalette";
import ThemeToggle from "./ThemeToggle";

type Indicator = { x: number; width: number; visible: boolean };

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState<Indicator>({ x: 0, width: 0, visible: false });
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sectionIds = useMemo(() => navigation.map((item) => item.href.slice(1)), []);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Measure the current link so the highlight can glide to it rather than jump.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const link = list.querySelector<HTMLElement>("a[aria-current='true']");
      if (!link) {
        setIndicator((state) => ({ ...state, visible: false }));
        return;
      }
      setIndicator({ x: link.offsetLeft, width: link.offsetWidth, visible: true });
    };
    update();
    document.fonts?.ready.then(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active]);

  // Lock the page behind the overlay, close on Escape, and hand focus back and forth.
  // `inert` keeps Tab and screen readers inside the menu while it is open.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    const behind = Array.from(document.querySelectorAll<HTMLElement>("#main, footer"));
    document.body.style.overflow = "hidden";
    behind.forEach((el) => el.setAttribute("inert", ""));
    firstLinkRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  // If the viewport grows past the mobile breakpoint while the menu is open, close it.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link pill pill-solid">
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-3 z-50">
        <div className="wrap">
          <nav className={cn("nav-shell", (scrolled || open) && "is-scrolled")} aria-label="Primary">
            <a href="#top" className="font-medium tracking-tight" onClick={() => setOpen(false)}>
              {profile.name}
            </a>

            <div ref={listRef} className="relative hidden lg:block">
              <span
                className={cn("nav-indicator", indicator.visible && "is-visible")}
                style={{ width: indicator.width, transform: `translateX(${indicator.x}px)` }}
                aria-hidden="true"
              />
              <ul className="flex items-center gap-1">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="nav-link"
                      aria-current={active === item.href.slice(1) ? "true" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-1">
              <PaletteTrigger />
              <ThemeToggle />
              <a href="#contact" className="pill pill-solid group hidden sm:inline-flex">
                Start a conversation
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                />
              </a>
              <button
                ref={toggleRef}
                type="button"
                className="icon-button lg:hidden"
                aria-expanded={open}
                aria-controls="site-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
              >
                <span className={cn("burger", open && "is-open")} aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div id="site-menu" className={cn("menu-overlay lg:hidden", open && "is-open")} aria-hidden={!open}>
        <ul className="flex flex-col">
          {navigation.map((item, index) => (
            <li key={item.href} className="border-t border-border first:border-t-0">
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={item.href}
                className={cn("menu-link", open && "rise")}
                style={vars({ "--d": `${80 + index * 50}ms` })}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                {item.label}
                <ArrowUpRight size={28} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-4 pt-8">
          <a href="#contact" className="pill pill-solid w-full" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
            Start a conversation
          </a>
          <a href={`mailto:${profile.email}`} className="label" tabIndex={open ? 0 : -1}>
            {profile.email}
          </a>
        </div>
      </div>
    </>
  );
};

export default Navigation;
