import { expect, test } from "@playwright/test";
import { navigation } from "../src/data/portfolio";
import { gotoHome } from "./helpers";

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "The pill nav collapses into the burger menu on small screens.");

  test("lists every section and jumps to the one you pick", async ({ page }) => {
    await gotoHome(page);
    const nav = page.getByRole("navigation", { name: "Primary" });

    const links = nav.getByRole("list").getByRole("link");
    await expect(links).toHaveText(navigation.map((item) => item.label));

    await links.filter({ hasText: "Experience" }).click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator("#experience")).toBeInViewport();
    await expect(nav.locator("a[aria-current='true']")).toHaveText("Experience");
    await expect(nav).toHaveClass(/is-scrolled/);
  });

  test("does not render the burger menu", async ({ page }) => {
    await gotoHome(page);

    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expect(page.locator("#site-menu")).toBeHidden();
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "Only the phone viewports show the burger menu.");

  test("opens a full-screen menu, traps focus behind it and closes on Escape", async ({ page }) => {
    await gotoHome(page);
    // The label flips between "Open menu" and "Close menu", so match both to keep hold of the button.
    const toggle = page.getByRole("button", { name: /^(Open|Close) menu$/ });
    const menu = page.locator("#site-menu");

    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("list")).toBeHidden();
    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveAccessibleName("Close menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link")).toHaveText([...navigation.map((item) => item.label), "Start a conversation", /@/]);
    await expect(menu.getByRole("link", { name: navigation[0].label })).toBeFocused();
    await expect(page.locator("#main")).toHaveAttribute("inert", "");

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(page.locator("#main")).not.toHaveAttribute("inert");
  });

  test("choosing a link closes the menu and scrolls to the section", async ({ page }) => {
    await gotoHome(page);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#site-menu").getByRole("link", { name: "About" }).click();

    await expect(page.locator("#site-menu")).toBeHidden();
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator("#about")).toBeInViewport();
  });
});

test("back to top returns to the hero", async ({ page }) => {
  await gotoHome(page);

  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { level: 1 })).not.toBeInViewport();

  await footer.getByRole("link", { name: "Back to top" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await expect(page).toHaveURL(/#top$/);
});
