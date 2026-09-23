// Headless-browser smoke suite for the built site.
//
//   npm run build && npm run test:smoke                # serves dist/ with `vite preview`, tests it
//   node scripts/smoke.mjs --base https://example.com  # tests a deployed copy instead
//   node scripts/smoke.mjs --only accessibility,boot   # runs a subset of the sections
//
// Needs a Chromium-based browser: set PUPPETEER_EXECUTABLE_PATH, or let the script find
// Edge/Chrome in its usual place. Screenshots land in test-results/smoke.
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createRequire } from "node:module";
import puppeteer from "puppeteer-core";
import { findBrowser } from "./browser.mjs";

const { values: args } = parseArgs({
  options: {
    base: { type: "string" },
    only: { type: "string" },
    out: { type: "string", default: "test-results/smoke" },
    port: { type: "string", default: "4173" }
  }
});
const OUT = path.resolve(args.out);
fs.mkdirSync(OUT, { recursive: true });

const problems = [];
const note = (msg) => console.log("  " + msg);
const fail = (msg) => {
  problems.push(msg);
  console.log("  FAIL " + msg);
  if (process.env.GITHUB_ACTIONS) console.log(`::error::${msg}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });

let BASE = "";

async function startPreview(port) {
  if (!fs.existsSync(path.resolve("dist/index.html"))) throw new Error("dist/ is missing; run `npm run build` first");
  const { preview } = await import("vite");
  const server = await preview({ logLevel: "silent", preview: { port, strictPort: true, host: "127.0.0.1" } });
  return { url: server.resolvedUrls.local[0].replace(/\/$/, ""), close: () => server.close() };
}

async function newPage(browser, width, height, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: !!opts.touch, hasTouch: !!opts.touch });
  if (opts.reducedMotion) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  // Netlify injects its deploy-preview drawer into previews: a fixed div with an inline style attribute and a
  // same-origin /.netlify/scripts/cdp loader that inline-styles and frames app.netlify.com. The CSP blocks all
  // of that, so strip the injection from each document as it arrives and a preview tests like production.
  const cdp = await page.createCDPSession();
  await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*", resourceType: "Document", requestStage: "Response" }] });
  cdp.on("Fetch.requestPaused", async ({ requestId, responseStatusCode: status = 0, responseHeaders = [] }) => {
    try {
      const isHtml = responseHeaders.some((h) => /^content-type$/i.test(h.name) && /text\/html/i.test(h.value));
      if ((status >= 300 && status < 400) || !isHtml) return await cdp.send("Fetch.continueRequest", { requestId });
      const { body, base64Encoded } = await cdp.send("Fetch.getResponseBody", { requestId });
      const html = base64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
      const clean = html.replace(/<div data-netlify-deploy-id[\s\S]*?<\/div>/, "");
      if (clean === html) return await cdp.send("Fetch.continueRequest", { requestId });
      await cdp.send("Fetch.fulfillRequest", {
        requestId,
        responseCode: status,
        responseHeaders: responseHeaders.filter((h) => !/^content-(length|encoding)$/i.test(h.name)),
        body: Buffer.from(clean, "utf8").toString("base64")
      });
    } catch {
      // The page has already moved on; nothing to answer.
    }
  });
  // The boot overlay swallows early clicks, so most checks pretend it has already run this session.
  if (!opts.boot) await page.evaluateOnNewDocument(() => sessionStorage.setItem("boot-seen", "1"));
  // Collect Content-Security-Policy violations; they are reported when the page is closed.
  await page.evaluateOnNewDocument(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI || e.sourceFile || "inline"}`);
    });
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error" && msg.type() !== "warning") return;
    const text = msg.text();
    if (/404: no route matches|Failed to load resource: .* 404/.test(text) && /does-not-exist/.test(page.url())) return;
    fail(`console.${msg.type()}: ${text}`);
  });
  page.on("pageerror", (err) => fail(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => {
    if (req.method() === "HEAD") return;
    fail(`requestfailed: ${req.url()} ${req.failure()?.errorText}`);
  });
  page.on("response", (res) => {
    const url = res.url();
    if (url.startsWith(BASE) && res.status() >= 400 && !/does-not-exist/.test(url)) fail(`HTTP ${res.status()} for ${url}`);
  });
  const close = page.close.bind(page);
  page.close = async (...rest) => {
    const violations = await page.evaluate(() => window.__csp || []).catch(() => []);
    if (violations.length) fail(`CSP violations on ${page.url()}: ${[...new Set(violations)].join("; ")}`);
    return close(...rest);
  };
  return page;
}

async function openHome(page, theme = "light") {
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.evaluate((t) => localStorage.setItem("theme", t), theme);
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  // The sections below the fold mount one at a time after the first paint; the footer is the last of them.
  await page.waitForSelector("footer", { timeout: 10000 });
  // Programmatic scrollIntoView + smooth scrolling makes element positions stale mid-flight.
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 200));
    window.scrollTo(0, 0);
  });
  await sleep(1200);
}

async function securityHeaders(browser) {
  console.log("Security headers and fonts");
  const page = await newPage(browser, 1440, 900);
  const res = await page.goto(BASE + "/", { waitUntil: "load" });
  const headers = res.headers();
  const expected = {
    "content-security-policy": /^default-src 'self'; script-src 'self'; style-src 'self'/,
    "x-content-type-options": /^nosniff$/,
    "x-frame-options": /^DENY$/,
    "referrer-policy": /^strict-origin-when-cross-origin$/,
    "permissions-policy": /camera=\(\)/
  };
  for (const [name, re] of Object.entries(expected)) {
    if (!re.test(headers[name] || "")) fail(`header ${name}: ${headers[name] ?? "(missing)"}`);
  }
  if (/immutable/.test(headers["cache-control"] || "")) fail("index.html must not be cached as immutable");
  const cssUrl = await page.$eval("link[rel=stylesheet]", (l) => l.href);
  const css = await page.goto(cssUrl);
  if (!/immutable/.test(css.headers()["cache-control"] || "")) fail(`asset cache-control: ${css.headers()["cache-control"]}`);

  // Nothing may leave the origin, and both self-hosted fonts must actually load.
  const foreign = new Set();
  page.on("request", (req) => {
    if (!req.url().startsWith(BASE)) foreign.add(req.url());
  });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, ""));
  });
  for (const family of ["Bricolage Grotesque", "Instrument Sans"]) {
    if (!fonts.includes(family)) fail(`font "${family}" not loaded (loaded: ${fonts.join(", ")})`);
  }
  if (foreign.size) fail(`third-party requests: ${[...foreign].join(", ")}`);

  // Every icon the page declares must exist, as must /favicon.ico, which browsers fetch on their own.
  const icons = await page.$$eval("link[rel='icon'], link[rel='apple-touch-icon']", (links) => links.map((l) => l.href));
  for (const url of new Set([...icons, BASE + "/favicon.ico"])) {
    const icon = await page.evaluate(async (u) => {
      const r = await fetch(u);
      return { status: r.status, type: r.headers.get("content-type") || "" };
    }, url);
    if (icon.status !== 200 || !/^image\//.test(icon.type)) fail(`icon ${url}: ${icon.status} ${icon.type}`);
  }
  note(`${Object.keys(expected).length} headers ok, assets immutable, fonts loaded, ${icons.length} icons served, no third-party requests`);
  await page.close();
}

async function fullPageShots(browser) {
  console.log("Full-page screenshots");
  const viewports = [
    ["desktop", 1440, 900],
    ["tablet", 768, 1024],
    ["mobile", 390, 844]
  ];
  for (const theme of ["light", "dark"]) {
    for (const [name, w, h] of viewports) {
      const page = await newPage(browser, w, h);
      await openHome(page, theme);
      await scrollThrough(page);
      const hidden = await page.$$eval("[data-reveal]:not(.is-visible)", (els) => els.length);
      if (hidden) fail(`${theme}/${name}: ${hidden} [data-reveal] elements never became visible`);
      await shot(page, `${theme}-${name}-fold`);
      if (name !== "tablet") {
        for (const id of ["work", "automation", "services", "experience", "about", "faq", "contact"]) {
          await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
          await sleep(900);
          await shot(page, `${theme}-${name}-${id}`);
        }
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(600);
        await shot(page, `${theme}-${name}-footer`);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) fail(`${theme}/${name}: horizontal overflow of ${overflow}px`);
      note(`${theme}/${name} captured`);
      await page.close();
    }
  }
}

async function accessibility(browser) {
  console.log("Accessibility (axe-core)");
  const require = createRequire(import.meta.url);
  const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  for (const [theme, w, h] of [["light", 1440, 900], ["dark", 1440, 900], ["light", 390, 844]]) {
    const page = await newPage(browser, w, h);
    await openHome(page, theme);
    await scrollThrough(page);
    // Evaluating through the devtools protocol is not subject to the page's CSP.
    await page.evaluate(axeSource);
    const results = await page.evaluate(() =>
      window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] } })
    );
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const minor = results.violations.filter((v) => v.impact !== "serious" && v.impact !== "critical");
    for (const v of serious) {
      const targets = v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ");
      fail(`axe ${theme}/${w}: [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes: ${targets})`);
    }
    for (const v of minor) note(`axe ${theme}/${w}: [${v.impact}] ${v.id} on ${v.nodes.length} node(s)`);
    note(`axe ${theme}/${w}: ${results.passes.length} rules passed, ${results.violations.length} violation(s)`);
    await page.close();
  }
}

async function interactions(browser) {
  console.log("Interactions (desktop)");
  const page = await newPage(browser, 1440, 900);
  await openHome(page);

  const title = await page.title();
  if (!/Michael Wagaye/.test(title)) fail(`unexpected title: ${title}`);

  // Nav links and deck cards resolve to sections
  const hrefs = await page.$$eval("nav[aria-label='Primary'] a[href^='#']", (as) => as.map((a) => a.getAttribute("href")));
  for (const href of hrefs) {
    if (!(await page.evaluate((id) => !!document.getElementById(id), href.slice(1)))) fail(`nav link ${href} has no target section`);
  }
  note(`nav links ok: ${hrefs.join(" ")}`);
  const deckLinks = await page.$$eval(".deck-card", (as) => as.map((a) => a.getAttribute("href")));
  for (const href of deckLinks) {
    if (!(await page.evaluate((id) => !!document.getElementById(id), href.slice(1)))) fail(`deck card ${href} has no target`);
  }
  const projectCards = await page.$$eval("#work article.work", (as) => as.length);
  if (deckLinks.length < 3 || deckLinks.length !== projectCards) fail(`deck has ${deckLinks.length} cards for ${projectCards} projects`);
  const unstacked = await page
    .waitForFunction(() => !document.querySelector(".deck").classList.contains("is-stacked"), { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (!unstacked) fail("deck still stacked after load");
  await page.hover(".deck-card[href='#lawata']");
  await sleep(800);
  await shot(page, "ix-deck-hover");

  // Nav click scrolls and updates the active state
  await page.click("nav[aria-label='Primary'] a[href='#work']");
  await sleep(1200);
  if ((await page.evaluate(() => window.scrollY)) < 200) fail("clicking Work did not scroll");
  const current = await page.$eval("nav[aria-label='Primary'] a[aria-current='true']", (a) => a.textContent).catch(() => null);
  if (current !== "Work") fail(`active nav after scrolling to Work is ${current}`);
  note(`active nav: ${current}`);
  await page.hover("#lawata");
  await sleep(900);
  await shot(page, "ix-work-hover");

  // Tool strip: one brand mark per stack item, all drawn and on a shared cap height; hovering a lockup pauses the
  // marquee and shows the brand colour.
  await page.evaluate(() => document.querySelector(".ticker").scrollIntoView({ block: "center" }));
  await sleep(400);
  const strip = await page.$$eval(".ticker-track:not([aria-hidden]) li", (items) =>
    items.map((li) => {
      const mark = li.querySelector("svg.mark");
      const box = mark?.getBBox();
      const height = mark?.getBoundingClientRect().height;
      return { name: li.textContent.trim(), drawn: !!box && box.width > 0 && box.height > 0, height: Math.round(height ?? 0) };
    })
  );
  const heights = new Set(strip.map((s) => s.height));
  if (strip.length < 10) fail(`tool strip has only ${strip.length} items`);
  strip.filter((s) => !s.drawn).forEach((s) => fail(`tool strip mark for "${s.name}" is empty`));
  if (heights.size !== 1) fail(`tool strip marks are not the same height: ${[...heights].join(", ")}px`);
  const ticker = await page.$(".ticker");
  const tickerBox = await ticker.boundingBox();
  await page.mouse.move(tickerBox.x + 8, tickerBox.y + tickerBox.height / 2);
  await sleep(300);
  // The marquee has moved on since load, so pick whichever lockup is fully on screen now that it is paused.
  let lockup = null;
  let lockupBox = null;
  for (const candidate of await page.$$(".ticker .lockup")) {
    const box = await candidate.boundingBox();
    if (box && box.x > 0 && box.x + box.width < 1440) {
      lockup = candidate;
      lockupBox = box;
      break;
    }
  }
  if (!lockup) {
    fail("no tool strip lockup is fully on screen");
  } else {
    await page.mouse.move(lockupBox.x + lockupBox.width / 2, lockupBox.y + lockupBox.height / 2);
    await sleep(400);
    const hovered = await lockup.evaluate((el) => {
      // A mark without a brand tint falls back to the text colour, so the probe does too.
      const probe = document.createElement("span");
      probe.style.color = el.style.getPropertyValue("--tint");
      document.body.append(probe);
      const tint = getComputedStyle(probe).color;
      probe.remove();
      return {
        name: el.textContent.trim(),
        tint,
        mark: getComputedStyle(el.querySelector(".mark")).color,
        text: getComputedStyle(el).color,
        body: getComputedStyle(document.body).color,
        playState: getComputedStyle(el.closest(".ticker-track")).animationPlayState
      };
    });
    if (hovered.mark !== hovered.tint) fail(`hovered "${hovered.name}" mark is ${hovered.mark}, expected tint ${hovered.tint}`);
    if (hovered.text !== hovered.body) fail(`hovered "${hovered.name}" text is ${hovered.text}, expected ${hovered.body}`);
    if (hovered.playState !== "paused") fail(`tool strip keeps moving while hovered (${hovered.playState})`);
    await shot(page, "ix-strip-hover");
    note(`tool strip: ${strip.length} marks drawn at ${[...heights][0]}px; hover tints "${hovered.name}" and pauses`);
  }
  await page.mouse.move(0, 0);

  // Responsive images: every candidate resolves and the browser picks a modern format
  const pictures = await page.$$eval("picture img", (imgs) =>
    imgs.map((img) => ({
      alt: img.alt || "(decorative)",
      current: img.currentSrc,
      candidates: [...img.parentElement.querySelectorAll("source")]
        .flatMap((s) => s.srcset.split(","))
        .concat(img.getAttribute("src"))
        .map((c) => c.trim().split(/\s+/)[0])
    }))
  );
  if (pictures.length < 4) fail(`expected at least 4 <picture> images, found ${pictures.length}`);
  for (const p of pictures) {
    await page.evaluate((alt) => [...document.querySelectorAll("picture img")].find((i) => (i.alt || "(decorative)") === alt)?.scrollIntoView({ block: "center" }), p.alt);
  }
  await sleep(600);
  const chosen = await page.$$eval("picture img", (imgs) => imgs.map((img) => [img.alt || "(decorative)", img.currentSrc, img.naturalWidth]));
  for (const [alt, current, natural] of chosen) {
    if (!/\.(avif|webp)(\?|$)/.test(current)) fail(`"${alt}" rendered from ${current}, expected avif/webp`);
    if (!natural) fail(`"${alt}" did not load`);
  }
  const candidates = new Set(pictures.flatMap((p) => p.candidates));
  const missing = await page.evaluate(async (urls) => {
    const out = [];
    for (const u of urls) {
      const status = (await fetch(u, { method: "HEAD" })).status;
      if (status !== 200) out.push(`${u} -> ${status}`);
    }
    return out;
  }, [...candidates]);
  missing.forEach((m) => fail(`image candidate ${m}`));
  note(`${pictures.length} pictures ok, ${candidates.size} candidates resolve, avif/webp chosen`);

  // Theme toggle
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.click("nav[aria-label='Primary'] button[aria-label*='theme']");
  await sleep(300);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  const stored = await page.evaluate(() => localStorage.getItem("theme"));
  const metaDark = await page.$eval("meta[name='theme-color']", (m) => m.content);
  if (!isDark || stored !== "dark" || metaDark !== "#0f0f0f") fail(`theme toggle failed (dark=${isDark}, stored=${stored}, theme-color=${metaDark})`);
  note("theme toggle ok");
  await page.click("nav[aria-label='Primary'] button[aria-label*='theme']");

  // A first visit opens in light mode even when the OS prefers dark; only the toggle's choice is remembered.
  const fresh = await newPage(browser, 1440, 900);
  await fresh.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
  await fresh.evaluateOnNewDocument(() => localStorage.removeItem("theme"));
  await fresh.goto(BASE + "/", { waitUntil: "networkidle0" });
  const first = await fresh.evaluate(() => ({
    light: document.documentElement.classList.contains("light"),
    dark: document.documentElement.classList.contains("dark"),
    scheme: document.documentElement.style.colorScheme,
    meta: document.querySelector("meta[name='theme-color']").content
  }));
  if (!first.light || first.dark || first.scheme !== "light" || first.meta !== "#ffffff") fail(`first visit is not light: ${JSON.stringify(first)}`);
  note("first visit opens light under a dark OS preference");
  await fresh.close();

  // Timeline filters
  await page.evaluate(() => document.getElementById("experience").scrollIntoView());
  await sleep(600);
  const allCount = await page.$$eval("#experience .entry", (l) => l.length);
  await page.click("#experience button.chip:nth-child(2)");
  await sleep(200);
  const workCount = await page.$$eval("#experience .entry", (l) => l.length);
  const pressed = await page.$eval("#experience button.chip:nth-child(2)", (b) => b.getAttribute("aria-pressed"));
  if (!(allCount > workCount && workCount >= 1 && pressed === "true")) fail(`timeline filter (all=${allCount}, work=${workCount}, pressed=${pressed})`);
  await page.click("#experience button.chip:nth-child(1)");
  await sleep(200);
  const backCount = await page.$$eval("#experience .entry", (l) => l.length);
  if (backCount !== allCount) fail("timeline filter did not restore all entries");
  await sleep(900);
  const invisibleEntries = await page.$$eval("#experience .entry", (els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
  if (invisibleEntries) fail(`${invisibleEntries} timeline entries invisible after filtering`);
  note(`timeline filters ok (${allCount} -> ${workCount} -> ${backCount})`);

  // FAQ accordion
  await page.evaluate(() => document.getElementById("faq").scrollIntoView());
  await sleep(600);
  const triggers = await page.$$("#faq .faq-trigger");
  const firstOpen = await triggers[0].evaluate((b) => b.getAttribute("aria-expanded"));
  await triggers[1].click();
  await sleep(500);
  const states = await page.$$eval("#faq .faq-trigger", (bs) => bs.map((b) => b.getAttribute("aria-expanded")));
  if (!(firstOpen === "true" && states[0] === "false" && states[1] === "true")) fail(`faq states: ${states.join(",")}`);
  const panelVisible = await page.$$eval("#faq .faq-panel", (ps) => ps.map((p) => p.getBoundingClientRect().height > 20));
  if (!(panelVisible[1] && !panelVisible[0])) fail(`faq panel heights: ${panelVisible.join(",")}`);
  const closedHidden = await page.$eval("#faq .faq-panel[data-state='closed'] > div", (d) => getComputedStyle(d).visibility);
  if (closedHidden !== "hidden") fail(`closed faq panel visibility is ${closedHidden}`);
  note("faq accordion ok");
  await shot(page, "ix-faq");

  // Contact form: required validation, then intercept the POST
  await page.evaluate(() => document.getElementById("contact").scrollIntoView());
  await sleep(600);
  await page.click("#contact button[type=submit]");
  if (await page.evaluate(() => document.querySelector("#contact form").checkValidity())) fail("empty form passed validation");
  await page.setRequestInterception(true);
  let posted = null;
  let intercepting = true;
  page.on("request", (req) => {
    if (!intercepting) return;
    if (req.method() === "POST" && req.url() === BASE + "/") {
      posted = req.postData();
      req.respond({ status: 200, body: "ok" });
    } else req.continue();
  });
  await page.type("#contact-name", "Test Person");
  await page.type("#contact-email", "test@example.com");
  await page.type("#contact-message", "Hello from the smoke test.");
  await page.click("#contact button[type=submit]");
  await sleep(800);
  const status = await page.$eval("#contact [role=status]", (p) => p.textContent);
  if (!posted || !/form-name=contact/.test(posted) || !/name=Test\+Person/.test(posted)) fail(`form POST body: ${posted}`);
  if (!/on its way/.test(status)) fail(`form status text: ${status}`);
  if ((await page.$eval("#contact-name", (i) => i.value)) !== "") fail("form did not reset after success");
  note(`form ok, status: "${status}"`);
  await shot(page, "ix-form-sent");
  await page.setRequestInterception(false);
  intercepting = false;

  // Static asset URLs referenced in the DOM resolve
  const urls = await page.$$eval("img[src], a[href$='.pdf'], link[rel=icon]", (els) => els.map((e) => e.getAttribute("src") || e.getAttribute("href")));
  for (const u of new Set(urls)) {
    const res = await page.evaluate(async (u) => (await fetch(u, { method: "HEAD" })).status, u);
    if (res !== 200) fail(`asset ${u} -> ${res}`);
  }
  note(`assets ok: ${[...new Set(urls)].join(", ")}`);

  // External links open safely; images have alt; form controls have labels; one h1
  const unsafe = await page.$$eval("a[target=_blank]", (as) => as.filter((a) => !/noreferrer|noopener/.test(a.rel)).map((a) => a.href));
  if (unsafe.length) fail(`external links without rel: ${unsafe.join(", ")}`);
  const missingAlt = await page.$$eval("img", (imgs) => imgs.filter((i) => i.getAttribute("alt") === null).length);
  if (missingAlt) fail(`${missingAlt} images missing alt`);
  const unlabeled = await page.$$eval("#contact form input:not([type=hidden]), #contact form textarea", (els) =>
    els.filter((el) => !el.labels?.length && !el.getAttribute("aria-label")).map((el) => el.name)
  );
  if (unlabeled.length) fail(`unlabeled fields: ${unlabeled.join(",")}`);
  const h1s = await page.$$eval("h1", (hs) => hs.length);
  if (h1s !== 1) fail(`expected one h1, found ${h1s}`);
  await page.close();
}

async function mobileMenu(browser) {
  console.log("Mobile menu");
  const page = await newPage(browser, 390, 844);
  await openHome(page);
  await sleep(1500);
  await shot(page, "ix-mobile-hero");
  await page.click("button[aria-controls='site-menu']");
  await sleep(600);
  const open = await page.$eval("#site-menu", (el) => el.classList.contains("is-open"));
  const expanded = await page.$eval("button[aria-controls='site-menu']", (b) => b.getAttribute("aria-expanded"));
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  if (!open || expanded !== "true" || bodyOverflow !== "hidden") fail(`menu open state (open=${open}, expanded=${expanded}, overflow=${bodyOverflow})`);
  const focused = await page.evaluate(() => document.activeElement?.textContent);
  if (focused !== "Work") fail(`focus after opening menu is on "${focused}"`);
  // Page content behind the overlay must be inert, and Tab must stay inside the header/menu.
  const inertBehind = await page.evaluate(() => ["#main", "footer"].every((s) => document.querySelector(s)?.hasAttribute("inert")));
  if (!inertBehind) fail("content behind the open menu is not inert");
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  const escaped = await page.evaluate(() => {
    const el = document.activeElement;
    return !!el && el !== document.body && !!el.closest("#main, footer");
  });
  if (escaped) fail("Tab focus escaped the open menu into page content");
  await shot(page, "ix-mobile-menu");
  await page.keyboard.press("Escape");
  await sleep(500);
  const closed = await page.$eval("#site-menu", (el) => !el.classList.contains("is-open"));
  const restored = await page.evaluate(() => document.body.style.overflow);
  const inertCleared = await page.evaluate(() => !document.querySelector("[inert]"));
  if (!closed || restored !== "" || !inertCleared) fail(`menu close via Escape (closed=${closed}, overflow="${restored}", inertCleared=${inertCleared})`);
  await page.click("button[aria-controls='site-menu']");
  await sleep(400);
  await page.click("#site-menu a[href='#about']");
  await sleep(1200);
  const y = await page.evaluate(() => window.scrollY);
  const closedAfterNav = await page.$eval("#site-menu", (el) => !el.classList.contains("is-open"));
  if (y < 200 || !closedAfterNav) fail(`menu link navigation (y=${y}, closed=${closedAfterNav})`);
  note("mobile menu ok");
  await page.close();
}

async function reducedMotion(browser) {
  console.log("Reduced motion");
  const page = await newPage(browser, 1440, 900, { reducedMotion: true });
  await openHome(page);
  await sleep(400);
  const tickerAnim = await page.$eval(".ticker-track", (el) => getComputedStyle(el).animationName);
  if (tickerAnim !== "none") fail(`ticker animates under reduced motion: ${tickerAnim}`);
  const revealOpacity = await page.$eval("[data-reveal]", (el) => getComputedStyle(el).opacity);
  if (revealOpacity !== "1") fail(`reveal elements hidden under reduced motion: ${revealOpacity}`);
  if (await page.$eval(".deck", (el) => el.classList.contains("is-stacked"))) fail("deck stacked under reduced motion");
  const statusPinned = await page.$eval("section#top .sr-only + span", (el) => el.textContent);
  await sleep(4600);
  const statusStill = await page.$eval("section#top .sr-only + span", (el) => el.textContent);
  if (statusPinned !== statusStill || !/Open to new/.test(statusPinned)) fail(`status line cycles under reduced motion: "${statusPinned}" -> "${statusStill}"`);
  if (await page.$(".cursor-dot")) fail("custom cursor mounted under reduced motion");
  const flowStatic = await page.$eval(".flow", (el) => el.classList.contains("is-static"));
  const packets = await page.$$eval(".flow-packet", (p) => p.length);
  if (!flowStatic || packets) fail(`flow under reduced motion (static=${flowStatic}, packets=${packets})`);
  await shot(page, "ix-reduced-motion");
  note("reduced motion ok");
  await page.close();
}

async function notFound(browser) {
  console.log("404 route");
  const page = await newPage(browser, 1440, 900);
  const res = await page.goto(BASE + "/does-not-exist", { waitUntil: "networkidle0" });
  // Netlify serves dist/404.html with a 404; `vite preview` falls back to index.html with a 200.
  if (![200, 404].includes(res.status())) fail(`unexpected status for an unknown path: ${res.status()}`);
  const h1 = await page.$eval("h1", (h) => h.textContent);
  if (!/nothing at this address/i.test(h1)) fail(`404 heading: ${h1}`);
  await shot(page, "ix-404");
  await page.click("a.pill[href='/']");
  await sleep(600);
  if (page.url() !== BASE + "/") fail(`404 back link went to ${page.url()}`);
  note(`404 ok (status ${res.status()})`);
  await page.close();
}

async function boot(browser) {
  console.log("Boot sequence");
  // First visit in a session: overlay runs, hands over to the hero, then unmounts. The boot is over in
  // about two seconds, quicker than a slow runner can poll for it, so an observer inside the page records
  // what happened and the checks read the recording afterwards.
  let page = await newPage(browser, 1440, 900, { boot: true });
  await page.evaluateOnNewDocument(() => {
    const rec = { mounted: false, booting: false, lines: [], unmounted: false };
    window.__boot = rec;
    const observer = new MutationObserver(() => {
      const overlay = document.querySelector(".boot");
      if (overlay && !rec.mounted) {
        rec.mounted = true;
        rec.booting = document.documentElement.classList.contains("is-booting");
      }
      if (overlay) {
        const lines = [...overlay.querySelectorAll(".boot-line")].map((l) => l.textContent);
        if (lines.length > rec.lines.length) rec.lines = lines;
      }
      if (rec.mounted && !overlay) {
        rec.unmounted = true;
        observer.disconnect();
      }
    });
    // This runs before <html> exists, so observe the document node itself.
    observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const finished = await page
    .waitForFunction(() => window.__boot.unmounted, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  const rec = await page.evaluate(() => window.__boot);
  if (!rec.mounted) {
    fail("boot overlay never mounted on a first visit");
  } else {
    if (!rec.booting) fail("html.is-booting not set while booting");
    const lines = rec.lines;
    if (!/run portfolio/.test(lines[0] || "")) fail(`boot prompt line: "${lines[0]}"`);
    if (!/^\d+ projects · \d+ automations · \d+ aws certs$/.test(lines[1] || "")) fail(`boot facts line: "${lines[1]}"`);
    if (!/in addis ababa · (light|dark) theme/.test(lines[2] || "")) fail(`boot status line: "${lines[2]}"`);
    if (!finished) fail("boot overlay never unmounted");
    if ((await page.evaluate(() => sessionStorage.getItem("boot-seen"))) !== "1") fail("boot-seen not stored after boot");
    await sleep(2200);
    const state = await page.evaluate(() => ({
      hero: getComputedStyle(document.querySelector("h1 .rise")).opacity,
      stacked: document.querySelector(".deck").classList.contains("is-stacked"),
      bootVar: document.documentElement.style.getPropertyValue("--boot"),
      cls: document.documentElement.classList.contains("is-booting")
    }));
    if (state.hero !== "1" || state.stacked || state.bootVar !== "" || state.cls) fail(`page state after boot: ${JSON.stringify(state)}`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await sleep(400);
    if (await page.$(".boot")) fail("boot ran again on reload within the same session");
  }
  await page.close();

  // Skipping by click drops the hero delay.
  page = await newPage(browser, 1440, 900, { boot: true });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  if (await page.waitForSelector(".boot", { timeout: 8000 }).catch(() => null)) {
    // The skip listeners attach in an effect after the first paint; a human can't click before that.
    await sleep(250);
    const before = await page.$eval(".boot", (el) => el.className).catch(() => "(gone)");
    await page.mouse.click(720, 450);
    await sleep(120);
    const skipped = await page
      .$eval(".boot", (el) => el.classList.contains("is-skipped") && el.classList.contains("is-done"))
      .catch(() => false);
    const bootVar = await page.evaluate(() => document.documentElement.style.getPropertyValue("--boot").trim());
    if (before !== "boot") note(`boot had already reached "${before}" before the skip click`);
    else if (!skipped || bootVar !== "0ms") fail(`boot skip (skipped=${skipped}, --boot="${bootVar}")`);
  } else if ((await page.evaluate(() => sessionStorage.getItem("boot-seen"))) === "1") {
    note("boot was over before the skip check could click; skipped");
  } else fail("boot overlay never mounted for the skip check");
  await page.close();

  // No boot under reduced motion, on a phone, or when arriving on a deep link.
  page = await newPage(browser, 1440, 900, { boot: true, reducedMotion: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  if (await page.$(".boot")) fail("boot ran under reduced motion");
  if (await page.evaluate(() => document.documentElement.classList.contains("is-booting"))) fail("is-booting set under reduced motion");
  await page.close();
  page = await newPage(browser, 390, 844, { boot: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  if (await page.$(".boot")) fail("boot ran on a phone-sized screen");
  // Without a boot the hero still rises, just without the hold; give it a moment to finish.
  await sleep(1600);
  const phone = await page.evaluate(() => ({
    hero: getComputedStyle(document.querySelector("h1 .rise")).opacity,
    bootVar: document.documentElement.style.getPropertyValue("--boot")
  }));
  if (phone.hero !== "1" || phone.bootVar !== "") fail(`phone hero state without boot: ${JSON.stringify(phone)}`);
  await page.close();
  page = await newPage(browser, 1440, 900, { boot: true });
  await page.goto(BASE + "/#contact", { waitUntil: "networkidle0" });
  if (await page.$(".boot")) fail("boot ran on a deep link");
  // A deep link mounts every section at once, so the browser has the target to scroll to.
  const deepLink = await page.evaluate(() => ({ contact: !!document.getElementById("contact"), scrollY: window.scrollY }));
  if (!deepLink.contact || deepLink.scrollY < 200) fail(`deep link did not land on the section: ${JSON.stringify(deepLink)}`);
  await page.close();
  note("boot ok");
}

async function features(browser) {
  console.log("Palette, status line, cursor, flow");
  const page = await newPage(browser, 1440, 900);
  await openHome(page);

  // Command palette: Ctrl+K, filter, Enter navigates, command mode, Escape returns focus.
  if (!(await page.$("header .palette-trigger"))) fail("palette trigger missing from the header");
  await page.keyboard.down("Control");
  await page.keyboard.press("k");
  await page.keyboard.up("Control");
  await sleep(300);
  if (!(await page.$(".palette[role=dialog]"))) fail("Ctrl+K did not open the palette");
  const paletteState = await page.evaluate(() => ({
    focused: document.activeElement?.classList.contains("palette-input"),
    inert: document.querySelector("#main")?.hasAttribute("inert"),
    overflow: document.body.style.overflow,
    options: document.querySelectorAll(".palette [role=option]").length
  }));
  if (!paletteState.focused || !paletteState.inert || paletteState.overflow !== "hidden" || paletteState.options < 10)
    fail(`palette open state: ${JSON.stringify(paletteState)}`);
  await page.type(".palette-input", "lawata");
  await sleep(200);
  const filtered = await page.$$eval(".palette [role=option]", (o) => o.map((x) => x.textContent));
  if (!(filtered.length >= 1 && /Lawata/.test(filtered[0]))) fail(`palette filter for "lawata": ${filtered.join(" | ")}`);
  const activeDesc = await page.$eval(".palette-input", (i) => i.getAttribute("aria-activedescendant"));
  if (!activeDesc || !(await page.$(`#${activeDesc}`))) fail(`aria-activedescendant "${activeDesc}" not in the DOM`);
  await shot(page, "ix-palette");
  await page.keyboard.press("Enter");
  await sleep(1200);
  const afterEnter = await page.evaluate(() => {
    const r = document.getElementById("lawata").getBoundingClientRect();
    return {
      closed: !document.querySelector(".palette[role=dialog]"),
      inView: r.top >= 0 && r.top < window.innerHeight,
      inertCleared: !document.querySelector("[inert]"),
      overflow: document.body.style.overflow
    };
  });
  if (!afterEnter.closed || !afterEnter.inView || !afterEnter.inertCleared || afterEnter.overflow !== "")
    fail(`palette Enter: ${JSON.stringify(afterEnter)}`);
  await page.click("header .palette-trigger");
  await sleep(300);
  await page.type(".palette-input", "whoami");
  await page.keyboard.press("Enter");
  await sleep(300);
  const response = await page.$eval(".palette-response", (el) => el.textContent).catch(() => "");
  if (!/Michael/.test(response)) fail(`whoami response: "${response}"`);
  await shot(page, "ix-palette-whoami");
  await page.keyboard.press("Escape");
  await sleep(300);
  const afterEscape = await page.evaluate(() => ({
    gone: !document.querySelector(".palette[role=dialog]"),
    focusBack: document.activeElement?.classList.contains("palette-trigger")
  }));
  if (!afterEscape.gone || !afterEscape.focusBack) fail(`palette Escape: ${JSON.stringify(afterEscape)}`);
  note("palette ok");

  // Hero status line: accessible text is the plain status; the visible line cycles.
  await page.evaluate(() => window.scrollTo(0, 0));
  const sr = await page.$eval("section#top .sr-only", (el) => el.textContent);
  if (!/Open to new opportunities/.test(sr)) fail(`status sr-only text: "${sr}"`);
  const readStatus = () => page.$eval("section#top .sr-only + span", (el) => el.textContent);
  const settled = (s) => /^(Open to new|\d\d:\d\d in Addis Ababa · UTC\+3$|\d+ automations in production|AWS Solutions Architect – Associate$)/.test(s);
  let s0 = await readStatus();
  if (!settled(s0)) {
    // Caught it mid-decode; the sweep takes 620ms.
    await sleep(900);
    s0 = await readStatus();
  }
  const cycled = await page
    .waitForFunction((prev) => document.querySelector("section#top .sr-only + span").textContent !== prev, { timeout: 7000 }, s0)
    .then(() => true)
    .catch(() => false);
  await sleep(900);
  const s1 = await readStatus();
  if (!cycled || !settled(s0) || !settled(s1) || s0 === s1) fail(`status line cycle: "${s0}" -> "${s1}"`);
  note(`status line cycles: "${s0}" -> "${s1}"`);

  // Custom cursor on a fine pointer: mounted, tracks, reacts to links and form fields.
  const pointer = await page.evaluate(() => ({
    mounted: document.documentElement.classList.contains("has-cursor") && !!document.querySelector(".cursor-dot"),
    fine: matchMedia("(pointer: fine)").matches,
    hover: matchMedia("(hover: hover)").matches
  }));
  if (!pointer.mounted) fail(`custom cursor not mounted on desktop (${JSON.stringify(pointer)})`);
  else {
    await page.mouse.move(600, 300);
    await sleep(80);
    await page.mouse.move(640, 330);
    await sleep(250);
    const cursorState = await page.evaluate(() => ({
      shown: document.querySelector(".cursor").classList.contains("is-shown"),
      body: getComputedStyle(document.body).cursor
    }));
    if (!cursorState.shown || cursorState.body !== "none") fail(`cursor state: ${JSON.stringify(cursorState)}`);
    const navBox = await (await page.$("nav[aria-label='Primary'] a[href='#work']")).boundingBox();
    await page.mouse.move(navBox.x + navBox.width / 2, navBox.y + navBox.height / 2);
    await sleep(250);
    if (!(await page.$eval(".cursor", (el) => el.classList.contains("is-link")))) fail("cursor not in link state over a nav link");
    await page.evaluate(() => document.getElementById("contact").scrollIntoView());
    await sleep(500);
    const fieldBox = await (await page.$("#contact-name")).boundingBox();
    await page.mouse.move(fieldBox.x + 20, fieldBox.y + fieldBox.height / 2);
    await sleep(250);
    const fieldState = await page.evaluate(() => ({
      field: document.querySelector(".cursor").classList.contains("is-field"),
      inputCursor: getComputedStyle(document.getElementById("contact-name")).cursor
    }));
    if (!fieldState.field || fieldState.inputCursor === "none") fail(`cursor over a field: ${JSON.stringify(fieldState)}`);
    note("cursor ok");
  }

  // Live pipeline board: wired links + packets, hover lights a route and updates the caption.
  await page.evaluate(() => document.getElementById("automation").scrollIntoView());
  await sleep(900);
  const flow = await page.evaluate(() => ({
    nodes: document.querySelectorAll(".flow .flow-node").length,
    links: document.querySelectorAll(".flow-link").length,
    packets: document.querySelectorAll(".flow-packet").length,
    // Each packet rides its link on a running transform animation (Web Animations, not offset-path).
    riding: [...document.querySelectorAll(".flow-packet")].filter((p) => p.getAnimations().some((a) => a.playState === "running")).length,
    core: !!document.querySelector(".flow-core"),
    caption: document.querySelector(".flow-caption").textContent
  }));
  if (flow.nodes < 5 || flow.links < 4 || flow.packets !== flow.links || flow.riding !== flow.packets || !flow.core || !/Hover or tap/.test(flow.caption))
    fail(`flow board: ${JSON.stringify(flow)}`);
  const firstNode = await page.$(".flow [data-node='sources'] .flow-node");
  // Approach the node from outside, the way a hand does; parking on it after a scroll fires no enter event.
  await page.mouse.move(10, 10);
  await sleep(200);
  const nodeBox = await firstNode.boundingBox();
  await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2, { steps: 6 });
  await sleep(350);
  const lit = await page.evaluate(() => ({
    litLinks: document.querySelectorAll(".flow-link.is-lit").length,
    dimLinks: document.querySelectorAll(".flow-link.is-dim").length,
    litNodes: document.querySelectorAll(".flow-node.is-lit").length,
    caption: document.querySelector(".flow-caption").textContent,
    label: document.querySelector(".cursor-label").textContent,
    labelState: document.querySelector(".cursor").classList.contains("is-label")
  }));
  if (lit.litLinks < 1 || lit.dimLinks < 1 || lit.litNodes < 2 || /Hover or tap/.test(lit.caption)) fail(`flow hover: ${JSON.stringify(lit)}`);
  if (lit.label !== "Trace" || !lit.labelState) fail(`cursor label over a flow node: ${JSON.stringify(lit)}`);
  await shot(page, "ix-flow-hover");
  await firstNode.click();
  await sleep(200);
  if (!(await firstNode.evaluate((el) => el.getAttribute("aria-pressed") === "true" && el.classList.contains("is-pinned")))) fail("clicking a flow node did not pin it");
  await page.mouse.move(10, 10);
  await sleep(300);
  if (!(await page.$$eval(".flow-link.is-lit", (l) => l.length))) fail("pinned route lost its lighting when the pointer left");
  await firstNode.click();
  await sleep(200);
  if (!(await firstNode.evaluate((el) => el.getAttribute("aria-pressed") === "false" && !el.classList.contains("is-pinned")))) fail("clicking a pinned node again did not unpin it");
  await page.mouse.move(10, 10);
  await sleep(300);
  const rested = await page.evaluate(() => !document.querySelector(".flow-link.is-lit") && /Hover or tap/.test(document.querySelector(".flow-caption").textContent));
  if (!rested) fail("flow board did not return to rest after unpinning and leaving");
  note("flow board ok");
  await page.close();

  // Coarse pointer: no custom cursor, palette trigger still reachable.
  const phone = await newPage(browser, 390, 844, { touch: true });
  await phone.goto(BASE + "/", { waitUntil: "networkidle0" });
  const touchState = await phone.evaluate(() => ({
    coarse: matchMedia("(pointer: coarse)").matches,
    cursor: !!document.querySelector(".cursor-dot"),
    hasCursor: document.documentElement.classList.contains("has-cursor"),
    trigger: !!document.querySelector("header .palette-trigger")
  }));
  if (!touchState.coarse || touchState.cursor || touchState.hasCursor || !touchState.trigger) fail(`touch state: ${JSON.stringify(touchState)}`);
  await phone.close();
  note("touch fallbacks ok");
}

(async () => {
  const started = Date.now();
  const sections = { securityHeaders, fullPageShots, accessibility, interactions, mobileMenu, reducedMotion, notFound, boot, features };
  const wanted = args.only ? args.only.split(",").map((s) => s.trim()) : Object.keys(sections);
  const unknown = wanted.filter((name) => !sections[name]);
  if (unknown.length) throw new Error(`unknown section(s) ${unknown.join(", ")}; choose from ${Object.keys(sections).join(", ")}`);
  const server = args.base ? null : await startPreview(Number(args.port));
  BASE = (args.base ?? server.url).replace(/\/$/, "");
  console.log(`Testing ${BASE} with ${findBrowser()}\n`);
  // A headless Chromium on a machine without a mouse (CI runners) reports `pointer: none` and `hover: none`,
  // which would hide the desktop-only cursor; declare a mouse so desktop pages behave like a desktop. Touch
  // emulation on the phone pages still switches them to `pointer: coarse` / `hover: none`.
  const browser = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: true,
    args: ["--no-first-run", "--blink-settings=primaryPointerType=4,availablePointerTypes=4,primaryHoverType=2,availableHoverTypes=2"]
  });
  try {
    for (const name of wanted) await sections[name](browser);
  } catch (err) {
    fail(`suite crashed: ${err.stack || err}`);
  } finally {
    // Chromium sometimes still holds its temp profile on Windows; don't let that mask a real failure.
    await browser.close().catch((e) => console.log("  (browser close: " + e.message.split("\n")[0] + ")"));
    await server?.close();
  }
  const seconds = Math.round((Date.now() - started) / 1000);
  console.log(problems.length ? `\n${problems.length} problem(s) in ${seconds}s` : `\nAll checks passed in ${seconds}s`);
  process.exit(problems.length ? 1 : 0);
})();
