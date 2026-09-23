# Michael Wagaye — Portfolio

Personal site for Michael Wagaye, AI Automation Developer & Cloud Engineer at MMCY, Addis Ababa.

**Live:** https://mk23rdportfolio.netlify.app/

A single-page Vite + React + TypeScript site with a hand-rolled design system: white canvas, black ink, a tight grotesque display face, a fanned deck of project cards, a scrolling stack ticker, editorial two-column sections and a wall-to-wall wordmark in the footer. Light and dark themes, full keyboard support, and every animation respects `prefers-reduced-motion`.

The conceit is that the site runs like one of the automations it describes: a short boot log on first visit, a live status readout in the hero, a wired pipeline board you can trace by hovering, a `Ctrl`/`⌘ K` command palette with a few shell-style commands (`whoami`, `uptime`, `ls`, `cat cv`, `sudo hire`), and a quiet custom cursor for mouse users.

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 5, `@vitejs/plugin-react-swc` |
| UI | React 18, TypeScript 5, React Router 6 (`/` and a 404 route) |
| Styling | Tailwind CSS 3 for layout utilities; all components, tokens and motion live in `src/index.css` |
| Icons | `lucide-react` |
| Type | Bricolage Grotesque (display) + Instrument Sans (body), loaded from Google Fonts |
| Hosting | Netlify — static build, SPA redirect in `public/_redirects`, contact form handled by Netlify Forms |

Runtime dependencies are deliberately minimal: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`. No animation, component or form libraries.

## Project structure

```
index.html                  Meta tags, font preloads, anti-flash theme script, static Netlify form mirror
public/                     favicon, portrait, project artwork, og-image.png, résumé PDF, _redirects
src/
  data/portfolio.ts         Single source of truth for all content (profile, nav, projects, stack,
                            services, automation work, timeline, FAQ, socials)
  index.css                 Design tokens (light/dark), typography scale, component classes, motion system
  components/
    Navigation.tsx          Floating pill nav, sliding active indicator, palette trigger, burger → full-screen menu
    Hero.tsx                Word-by-word headline reveal, magnetic CTAs, live status readout
    StatusLine.tsx          Cycling status line with a left-to-right decode sweep
    Boot.tsx                First-visit boot log; any click, key or scroll skips it
    CommandPalette.tsx      Ctrl/⌘ K dialog: jump to sections and projects, actions, shell-style commands
    Cursor.tsx              Dot + lagging ring cursor for fine pointers; labels via data-cursor="…"
    CardDeck.tsx            Fanned, pointer-tilting project deck (stacks on small screens)
    StackStrip.tsx          Infinite marquee of tools
    Projects.tsx / ProjectCard.tsx / ProjectArtwork.tsx
    Automation.tsx          Automation & AI-enabled engineering work at MMCY
    Flow.tsx                Live pipeline board: sources → runner → destinations, hover/tap to trace a route
    Services.tsx            What I do, with icon wells
    Timeline.tsx            Experience / education / certifications with filter chips
    About.tsx               Portrait, rotating badge, facts list with live local time
    Faq.tsx                 Accessible accordion (button + region, aria-expanded, data-state)
    Contact.tsx             Netlify-backed form with inline validation and status messages
    Footer.tsx              Giant wordmark, socials, CV link, back-to-top
    SectionHeading.tsx, Magnetic.tsx, RotatingBadge.tsx, ThemeToggle.tsx
  hooks/
    use-reveal.ts           IntersectionObserver that adds .is-visible to every [data-reveal]
    use-active-section.ts   Tracks which section is in view for the nav indicator
    use-local-time.ts       Ticking clock for a given IANA time zone
    use-reduced-motion.ts   Live prefers-reduced-motion media query
    use-hash-target.ts      Scrolls a deep-linked #section into view once the page has mounted
  lib/
    boot.ts                 Boot state: runs once per tab session, never on deep links or reduced motion
    palette.ts              Tiny event bus so any component can open the palette
  context/theme-context.tsx Light/dark theme, persisted to localStorage, syncs with the OS
  pages/Index.tsx, NotFound.tsx
e2e/                        Playwright end-to-end suite (see Tests)
playwright.config.ts        Browser projects, ports and the web server the suite runs against
.github/workflows/ci.yml    Typecheck, lint, build, then the e2e suite on five browser projects
```

## Editing content

Everything shown on the page comes from `src/data/portfolio.ts`. Update the profile, add a project, reorder the nav, change a timeline entry or rewrite a FAQ answer there — no component changes needed. Replace `public/michael-wagaye-resume.pdf` to update the downloadable CV.

Design tokens (colours, radii, type scale, spacing, motion durations) live at the top of `src/index.css` as CSS custom properties, with a `.dark` override block.

## Scripts

```sh
npm install
npm run dev        # Vite dev server on http://localhost:8080
npm run typecheck  # tsc --noEmit against tsconfig.app.json
npm run lint       # ESLint (typescript-eslint, react-hooks, react-refresh)
npm run build      # Production build to dist/
npm run preview    # Serve dist/ locally

npm test               # Playwright end-to-end suite, all five browser projects
npm run test:ui        # Same, in Playwright's UI mode
npm run test:headed    # Chromium only, with a visible browser
npm run test:report    # Open the HTML report from the last run
npm run typecheck:e2e  # tsc --noEmit against e2e/tsconfig.json
```

## Tests

End-to-end tests live in `e2e/` and run with [Playwright](https://playwright.dev/). They cover the front page and the 404 route, the desktop nav and the mobile menu, theme detection and persistence, the command palette and its shell commands, the contact form (Netlify payload, native validation, email fallback), the sections (project cards and deep links, timeline filters, FAQ accordion, pipeline board) and the motion system (boot log, scroll reveals, reduced motion, custom cursor).

```sh
npx playwright install                               # once, downloads the browsers
npm test                                             # every project, against the Vite dev server
npm test -- --project=chromium -g "command palette"  # narrow it down
```

Five projects: `chromium`, `firefox`, `webkit`, plus `mobile-chrome` (Pixel 7) and `mobile-safari` (iPhone 14). The suite starts its own server on port 4319 (`E2E_PORT` overrides it) so it never picks up a stray `npm run dev`. `prefers-reduced-motion` is emulated everywhere except `e2e/motion.spec.ts`, which opts back in to test the animations themselves; the boot-log tests drive Playwright's fake clock so they don't depend on real timing.

CI (`.github/workflows/ci.yml`) runs typecheck, lint and build once, then runs the suite against `vite preview` of that build in a five-way matrix, one job per browser project, with the HTML report of each attached as an artifact.

## Contact form

The form posts to Netlify Forms (`name="contact"`, hidden `form-name` field, `bot-field` honeypot). `index.html` contains a static mirror of the form so Netlify's build-time scanner registers it. Submissions appear under **Forms** in the Netlify dashboard; enable email notifications there if you want them forwarded.

## Accessibility & motion

- Semantic landmarks, a skip link, one `h1`, labelled controls and `aria-current` on the active nav item.
- The mobile menu and the command palette trap focus, close on Escape, mark the page behind them `inert` and return focus to their trigger. The palette is a `combobox` + `listbox` with `aria-activedescendant`.
- The FAQ accordion, timeline filters, theme toggle and pipeline board are fully keyboard-operable (nodes are buttons; focusing one traces its route, pressing it pins it).
- The boot log and the cursor are `aria-hidden`; the hero status line exposes only the plain availability text to assistive tech.
- Scroll reveals, the marquee, the deck tilt, magnetic buttons, the rotating badge, the boot log, the status decode, the pipeline packets and the custom cursor are all disabled under `prefers-reduced-motion`. Touch devices keep the native cursor.
- Colours meet WCAG AA contrast in both themes.

## License

MIT — see [LICENSE](LICENSE).
