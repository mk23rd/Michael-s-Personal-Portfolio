import { expect, test } from "@playwright/test";
import { navigation, profile } from "../src/data/portfolio";
import { gotoHome, HEADLINE } from "./helpers";

test.describe("front page", () => {
  test("serves the document metadata", async ({ page }) => {
    await gotoHome(page);

    await expect(page).toHaveTitle(/Michael Wagaye/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /automation/i);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "/og-image.png");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
  });

  test("has one h1, the main landmarks and a section for every nav item", async ({ page }) => {
    await gotoHome(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

    for (const item of navigation) {
      await expect(page.locator(`section${item.href}`), `${item.label} section`).toHaveCount(1);
    }
  });

  test("the skip link is the first tab stop and jumps to the content", async ({ page, browserName }) => {
    await gotoHome(page);
    const skip = page.getByRole("link", { name: "Skip to content" });

    // WebKit only tabs to links when the OS-level "press Tab to highlight" setting is on, so it
    // gets the link focused directly and still checks what the link does.
    if (browserName === "webkit") await skip.focus();
    else await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("loads without page errors, console errors or failed same-origin requests", async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      // The browser's own report of a failed request duplicates the same-origin checks below and,
      // for third-party hosts such as Google Fonts, reflects the network rather than the site.
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
        errors.push(`console: ${message.text()}`);
      }
    });
    page.on("requestfailed", (request) => {
      if (request.url().startsWith(baseURL!)) errors.push(`request: ${request.url()} ${request.failure()?.errorText}`);
    });
    page.on("response", (response) => {
      if (response.url().startsWith(baseURL!) && response.status() >= 400) {
        errors.push(`response: ${response.status()} ${response.url()}`);
      }
    });

    await gotoHome(page);
    // Walk the whole page so lazy media and every section's scripts get exercised.
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByText(`© ${new Date().getFullYear()} Michael Wagaye`)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("links the CV, email and social profiles", async ({ page }) => {
    await gotoHome(page);

    const cv = page.getByRole("link", { name: "Download CV" });
    await expect(cv).toHaveAttribute("href", profile.resume);
    await expect(cv).toHaveAttribute("download", "");
    const resume = await page.request.get(profile.resume);
    expect(resume.ok()).toBe(true);
    expect(resume.headers()["content-type"]).toContain("application/pdf");

    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);
    const socials = footer.getByRole("list", { name: "Social links" }).getByRole("link");
    await expect(socials.filter({ hasText: "GitHub" })).toHaveAttribute("href", profile.github);
    for (const link of await socials.all()) {
      if ((await link.getAttribute("href"))?.startsWith("http")) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noreferrer/);
      }
    }
  });
});

test.describe("unknown routes", () => {
  test("show the 404 page and link back to the front page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("There's nothing at this address.");
    await expect(page.locator("code")).toHaveText("/this-page-does-not-exist");

    await page.getByRole("link", { name: "Back to the front page" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(HEADLINE);
  });
});
