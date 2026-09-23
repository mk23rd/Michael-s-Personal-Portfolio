import { expect, test } from "@playwright/test";
import { faq, pipeline, projects, timeline } from "../src/data/portfolio";
import { gotoHome } from "./helpers";

test.describe("projects", () => {
  test("shows every project with source and live links", async ({ page }) => {
    await gotoHome(page);
    await page.locator("#work").scrollIntoViewIfNeeded();

    for (const project of projects) {
      const card = page.locator(`#${project.id}`);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(project.title);
      await expect(card.getByRole("link", { name: `${project.title} source code on GitHub` })).toHaveAttribute(
        "href",
        project.github
      );
      const live = card.getByRole("link", { name: `${project.title} live site` });
      if (project.live) await expect(live).toHaveAttribute("href", project.live);
      else await expect(live).toHaveCount(0);
      await expect(card.getByRole("list", { name: "Built with" }).getByRole("listitem")).toHaveText(project.stack);
    }
  });

  test("deep links straight to a project card", async ({ page }) => {
    await gotoHome(page, `#${projects[1].id}`);

    await expect(page.locator(`#${projects[1].id}`)).toBeInViewport();
    await expect(page.locator(`#${projects[1].id}`).getByRole("heading", { level: 3 })).toBeVisible();
  });
});

test.describe("timeline filters", () => {
  test("narrow the entries and report the counts", async ({ page }) => {
    await gotoHome(page);
    const section = page.locator("#experience");
    await section.scrollIntoViewIfNeeded();
    const filters = section.getByRole("group", { name: "Filter entries" });
    const entries = section.getByRole("list").getByRole("listitem");

    await expect(filters.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
    await expect(entries).toHaveCount(timeline.length);

    const certifications = timeline.filter((entry) => entry.kind === "Certification");
    const chip = filters.getByRole("button", { name: /^Certifications/ });
    await expect(chip).toContainText(String(certifications.length));
    await chip.click();

    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(filters.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "false");
    await expect(entries).toHaveCount(certifications.length);
    await expect(entries.first()).toContainText("Certification");

    await filters.getByRole("button", { name: /^Work/ }).click();
    await expect(entries).toHaveCount(timeline.filter((entry) => entry.kind === "Work").length);
  });
});

test.describe("faq accordion", () => {
  test("opens one answer at a time and is keyboard operable", async ({ page }) => {
    await gotoHome(page);
    const section = page.locator("#faq");
    await section.scrollIntoViewIfNeeded();
    const triggers = section.getByRole("button");
    await expect(triggers).toHaveCount(faq.length);

    const first = triggers.nth(0);
    const second = triggers.nth(1);
    const panelFor = (index: number) => section.getByRole("region", { name: faq[index].q });

    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(panelFor(0)).toContainText(faq[0].a);
    await expect(second).toHaveAttribute("aria-expanded", "false");

    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(panelFor(1).locator("p")).toBeVisible();
    await expect(panelFor(0).locator("p")).toBeHidden();

    await second.focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-expanded", "false");
    await expect(triggers.filter({ has: page.locator("[aria-expanded='true']") })).toHaveCount(0);
  });
});

test.describe("pipeline board", () => {
  test("renders every node and traces a route on focus and click", async ({ page }) => {
    await gotoHome(page);
    const board = page.locator(".flow-shell");
    await board.scrollIntoViewIfNeeded();

    await expect(board.getByRole("list", { name: "Systems the automation reads from" }).getByRole("button")).toHaveCount(
      pipeline.sources.length
    );
    await expect(board.getByRole("list", { name: "Where the results are delivered" }).getByRole("button")).toHaveCount(
      pipeline.outputs.length
    );
    await expect(board.locator(".flow-link")).toHaveCount(await board.locator(".flow-link").count());
    expect(await board.locator(".flow-link").count()).toBeGreaterThan(0);

    const source = pipeline.sources[0];
    const node = board.locator(`[data-node="${source.id}"]`);
    const caption = board.locator(".flow-caption");
    await expect(caption).toContainText("Hover or tap a node");

    await node.focus();
    await expect(caption).toContainText(source.note);
    await expect(node).toHaveClass(/is-lit/);
    for (const id of source.to ?? []) await expect(board.locator(`[data-node="${id}"]`)).toHaveClass(/is-lit/);
    await expect(board.locator(`[data-node="${pipeline.outputs.find((o) => !source.to?.includes(o.id))!.id}"]`)).toHaveClass(
      /is-dim/
    );

    await node.click();
    await expect(node).toHaveAttribute("aria-pressed", "true");
    await expect(node).toHaveClass(/is-pinned/);
    await page.mouse.move(0, 0);
    await expect(caption).toContainText(source.note);

    await node.click();
    await expect(node).toHaveAttribute("aria-pressed", "false");
  });
});
