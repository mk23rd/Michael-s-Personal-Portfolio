import { expect, test } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("system preference", () => {
  test.describe("dark", () => {
    test.use({ colorScheme: "dark" });

    test("is applied before first paint and offered a light switch", async ({ page }) => {
      await gotoHome(page);

      await expect(page.locator("html")).toHaveClass(/\bdark\b/);
      await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
      await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
      expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
    });

    test("loses to a saved light preference", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await gotoHome(page);

      await expect(page.locator("html")).toHaveClass(/\blight\b/);
      await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    });
  });

  test.describe("light", () => {
    test.use({ colorScheme: "light" });

    test("renders the light theme", async ({ page }) => {
      await gotoHome(page);

      await expect(page.locator("html")).toHaveClass(/\blight\b/);
      await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
      await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
    });
  });
});

test.describe("theme toggle", () => {
  test.use({ colorScheme: "light" });

  test("switches the theme, remembers it and restores it on reload", async ({ page }) => {
    await gotoHome(page);
    const html = page.locator("html");

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(html).not.toHaveClass(/\blight\b/);
    await expect(html).toHaveCSS("color-scheme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(html).toHaveClass(/\blight\b/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  });

  test("works from the 404 page as well", async ({ page }) => {
    await page.goto("/missing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("nothing at this address");

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });
});
