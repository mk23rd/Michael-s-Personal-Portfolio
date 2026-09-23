import { expect, test, type Page } from "@playwright/test";
import { LOG_MS } from "../src/lib/boot";
import { gotoHome, HEADLINE, openPalette } from "./helpers";

/**
 * The rest of the suite runs with `prefers-reduced-motion: reduce` so animations never race an
 * assertion. These tests opt back in to check the motion features themselves.
 */
test.use({ reducedMotion: "no-preference" });

test.describe("boot log", () => {
  // The whole boot is over in about two seconds, less than Firefox or WebKit sometimes need to
  // finish loading, so the page's timers are frozen and moved by hand where a test needs them.
  const START = new Date("2025-06-01T09:00:00");
  const gotoBoot = async (page: Page) => {
    await page.clock.install({ time: START });
    await page.clock.pauseAt(START.getTime() + 1_000);
    await page.goto("/");
  };
  const WIPE_MS = 1_000;

  test("plays once per tab session and any click skips it", async ({ page }) => {
    await gotoBoot(page);
    const boot = page.locator(".boot");

    await expect(boot).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/is-booting/);
    await expect(boot.locator(".boot-line").first()).toContainText("run portfolio");

    await page.mouse.click(10, 10);
    await expect(boot).toHaveClass(/is-skipped/);
    await expect(page.locator("html")).not.toHaveClass(/is-booting/);
    await page.clock.runFor(WIPE_MS);
    await expect(boot).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(HEADLINE);
    expect(await page.evaluate(() => sessionStorage.getItem("boot-seen"))).toBe("1");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(HEADLINE);
    await expect(page.locator(".boot")).toHaveCount(0);
  });

  test("finishes on its own", async ({ page }) => {
    await gotoBoot(page);
    const boot = page.locator(".boot");
    await expect(boot).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/is-booting/);

    await page.clock.runFor(LOG_MS);
    await expect(boot).toHaveClass(/is-done/);
    await expect(boot).not.toHaveClass(/is-skipped/);
    await expect(page.locator("html")).not.toHaveClass(/is-booting/);

    await page.clock.runFor(WIPE_MS);
    await expect(boot).toHaveCount(0);
  });

  test("is skipped for deep links", async ({ page }) => {
    await page.goto("/#contact");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(HEADLINE);
    await expect(page.locator(".boot")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/is-booting/);
  });
});

test.describe("scroll reveals", () => {
  test("hidden content becomes visible as it scrolls into view", async ({ page }) => {
    await gotoHome(page, "#top");
    const late = page.locator("#faq [data-reveal]").first();

    await expect(late).not.toHaveClass(/is-visible/);
    await expect(late).toHaveCSS("opacity", "0");

    await late.scrollIntoViewIfNeeded();
    await expect(late).toHaveClass(/is-visible/);
    await expect(late).toHaveCSS("opacity", "1");
  });

  test("nothing stays hidden after a jump to the bottom of the page", async ({ page }) => {
    await gotoHome(page, "#top");

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByRole("contentinfo")).toBeInViewport();

    // Everything above the fold at the bottom must have been swept in, not left at opacity 0.
    const stuck = page.locator("[data-reveal]:not(.is-visible)");
    await expect
      .poll(async () => {
        const boxes = await stuck.evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect().top).filter((top) => top < window.innerHeight * 0.9)
        );
        return boxes.length;
      })
      .toBe(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("skips the boot, shows all content immediately and keeps the native cursor", async ({ page }) => {
    await gotoHome(page);

    await expect(page.locator(".boot")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/is-booting/);
    await expect(page.locator("#faq [data-reveal]").first()).toHaveCSS("opacity", "1");
    await expect(page.locator(".cursor")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/has-cursor/);
  });
});

test.describe("custom cursor", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "Touch devices keep the native cursor.");

  test("follows the mouse and grows over links", async ({ page }) => {
    await gotoHome(page);
    await page.mouse.click(10, 10);
    const cursor = page.locator(".cursor");

    await expect(cursor).toHaveCount(1);
    await expect(page.locator("html")).toHaveClass(/has-cursor/);
    await page.mouse.move(200, 300);
    await expect(cursor).toHaveClass(/is-shown/);

    const link = page.getByRole("link", { name: "See selected work" });
    await link.hover();
    await expect(cursor).toHaveClass(/is-link/);

    // The palette input is already on screen; with motion on, scrolling down to the contact form
    // would be a smooth scroll and the field a moving target.
    const dialog = await openPalette(page);
    await dialog.getByRole("combobox").hover();
    await expect(cursor).toHaveClass(/is-field/);
  });
});
