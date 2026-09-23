import { expect, type Page } from "@playwright/test";

export const HEADLINE = "From the cloud to the last pixel.";

/** Opens the front page and waits until React has rendered the hero. */
export const gotoHome = async (page: Page, hash = "") => {
  await page.goto(`/${hash}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(HEADLINE);
};

/** Opens the command palette with the keyboard shortcut and returns its dialog. */
export const openPalette = async (page: Page) => {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  return dialog;
};
