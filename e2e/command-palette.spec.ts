import { expect, test } from "@playwright/test";
import { navigation, profile, projects } from "../src/data/portfolio";
import { gotoHome, openPalette } from "./helpers";

test.describe("command palette", () => {
  test("opens with Ctrl/⌘ K, lists the sections and closes with Escape", async ({ page }) => {
    await gotoHome(page);
    const dialog = await openPalette(page);

    const input = dialog.getByRole("combobox");
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute("aria-controls", "palette-list");
    await expect(page.locator("#main")).toHaveAttribute("inert", "");

    const sections = dialog.getByRole("group", { name: "Sections" });
    await expect(sections.getByRole("option")).toHaveText(navigation.map((item) => item.label));
    await expect(dialog.getByRole("group", { name: "Projects" }).getByRole("option")).toHaveCount(projects.length);
    await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#main")).not.toHaveAttribute("inert");
  });

  test("the nav button opens it and gets focus back when it closes", async ({ page }) => {
    await gotoHome(page);
    const trigger = page.getByRole("button", { name: "Open command palette" });

    // Activated from the keyboard: WebKit never focuses a clicked button, so for a mouse user
    // there is no focus to return to and the check would be meaningless there.
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Close command palette" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("filters as you type and runs the highlighted result with Enter", async ({ page }) => {
    await gotoHome(page);
    const dialog = await openPalette(page);

    await dialog.getByRole("combobox").fill("exp");
    const first = dialog.getByRole("option").first();
    await expect(first).toHaveText("Experience");
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(first).toHaveId("palette-option-nav-#experience");
    await expect(dialog.getByRole("combobox")).toHaveAttribute("aria-activedescendant", "palette-option-nav-#experience");

    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator("#experience")).toBeInViewport();
    await expect(page.locator("#experience")).toBeFocused();
  });

  test("arrow keys move the highlight and wrap around", async ({ page }) => {
    await gotoHome(page);
    const dialog = await openPalette(page);
    const options = dialog.getByRole("option");
    const count = await options.count();

    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(options.nth(count - 1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(options.nth(count - 1)).toHaveAttribute("aria-selected", "true");
  });

  test("answers shell-style commands", async ({ page }) => {
    await gotoHome(page);
    const dialog = await openPalette(page);
    const input = dialog.getByRole("combobox");
    const response = dialog.getByRole("status");

    await input.fill("whoami");
    await expect(response).toContainText("Press ↵ to run whoami");
    await expect(dialog.getByRole("option")).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(response).toContainText(`${profile.name} — ${profile.role} at ${profile.employer}, ${profile.city}.`);
    await expect(response).toContainText(profile.status);

    await input.fill("help");
    await page.keyboard.press("Enter");
    for (const command of ["whoami", "uptime", "ls", "cat cv", "sudo hire", "clear"]) {
      await expect(response).toContainText(command);
    }

    await input.fill("ls");
    await page.keyboard.press("Enter");
    await expect(response).toContainText(projects[0].title);
    await expect(dialog.getByRole("group", { name: "Projects" }).getByRole("option")).toHaveCount(projects.length);
  });

  test("`sudo hire` hands you over to the contact form", async ({ page, browserName, isMobile }) => {
    await gotoHome(page);
    const dialog = await openPalette(page);

    await dialog.getByRole("combobox").fill("sudo hire michael");
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("status")).toContainText("Permission granted");

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
    // iOS WebKit ignores focus() on a text field outside a user gesture (it would pop the keyboard).
    if (!(isMobile && browserName === "webkit")) await expect(page.getByLabel("Name")).toBeFocused();
  });

  test("switches the theme without closing", async ({ page }) => {
    await gotoHome(page);
    const html = page.locator("html");
    const wasDark = /\bdark\b/.test((await html.getAttribute("class")) ?? "");
    const next = wasDark ? "light" : "dark";
    const dialog = await openPalette(page);

    await dialog.getByRole("combobox").fill("switch to");
    await expect(dialog.getByRole("option").first()).toHaveText(`Switch to ${next} theme`);
    await page.keyboard.press("Enter");

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toContainText(`Theme set to ${next}.`);
    await expect(html).toHaveClass(new RegExp(`\\b${next}\\b`));
  });

  test("offers an email fallback when nothing matches", async ({ page }) => {
    await gotoHome(page);
    const dialog = await openPalette(page);

    await dialog.getByRole("combobox").fill("quantum llamas");
    await expect(dialog.getByRole("option")).toHaveCount(0);
    await expect(dialog).toContainText("Nothing matches “quantum llamas”");
    await expect(dialog.getByRole("link", { name: "ask me directly" })).toHaveAttribute(
      "href",
      `mailto:${profile.email}?subject=${encodeURIComponent("quantum llamas")}`
    );
  });
});
