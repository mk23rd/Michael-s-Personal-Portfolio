import { expect, test } from "@playwright/test";
import { profile } from "../src/data/portfolio";
import { gotoHome } from "./helpers";

const fill = async (page: import("@playwright/test").Page) => {
  const form = page.locator("form[name='contact']:not([hidden])");
  await form.scrollIntoViewIfNeeded();
  await form.getByLabel("Name").fill("Ada Lovelace");
  await form.getByLabel("Email").fill("ada@example.com");
  await form.getByLabel("Message").fill("Hello from the end-to-end suite.");
  return form;
};

test.describe("contact form", () => {
  test("is wired for Netlify Forms and mirrored statically for the build scanner", async ({ page }) => {
    await gotoHome(page);
    const form = page.locator("form[name='contact']:not([hidden])");

    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
    await expect(form).toHaveAttribute("method", "POST");
    await expect(form.locator("input[name='form-name']")).toHaveValue("contact");
    await expect(form.locator("input[name='bot-field']")).toBeHidden();

    const mirror = page.locator("body > form[name='contact'][hidden]");
    await expect(mirror).toHaveCount(1);
    for (const field of ["name", "email", "message"]) {
      await expect(mirror.locator(`[name='${field}']`)).toHaveCount(1);
    }
  });

  test("blocks an empty submission with native validation", async ({ page }) => {
    await gotoHome(page);
    const form = page.locator("form[name='contact']:not([hidden])");
    let posted = false;
    page.on("request", (request) => {
      if (request.method() === "POST") posted = true;
    });

    await form.getByRole("button", { name: "Send message" }).click();

    await expect(form.getByLabel("Name")).toHaveJSProperty("validity.valueMissing", true);
    await expect(form.getByRole("status")).toBeEmpty();
    expect(posted).toBe(false);
  });

  test("posts the encoded fields and confirms", async ({ page }) => {
    await gotoHome(page);
    const posted = page.waitForRequest((request) => request.method() === "POST" && new URL(request.url()).pathname === "/");
    await page.route("**/", (route) =>
      route.request().method() === "POST" ? route.fulfill({ status: 200, body: "" }) : route.continue()
    );
    const form = await fill(page);

    await form.getByRole("button", { name: "Send message" }).click();
    const request = await posted;

    expect(request.headers()["content-type"]).toContain("application/x-www-form-urlencoded");
    const body = new URLSearchParams(request.postData() ?? "");
    expect(body.get("form-name")).toBe("contact");
    expect(body.get("name")).toBe("Ada Lovelace");
    expect(body.get("email")).toBe("ada@example.com");
    expect(body.get("message")).toBe("Hello from the end-to-end suite.");
    expect(body.get("bot-field")).toBe("");

    await expect(form.getByRole("button", { name: "Sent" })).toBeVisible();
    await expect(form.getByRole("status")).toHaveText("Thanks, it's on its way. I'll reply within a day.");
    await expect(form.getByLabel("Name")).toHaveValue("");
    await expect(form.getByLabel("Message")).toHaveValue("");
  });

  test("falls back to email when the endpoint fails", async ({ page }) => {
    await gotoHome(page);
    await page.route("**/", (route) =>
      route.request().method() === "POST" ? route.fulfill({ status: 500, body: "" }) : route.continue()
    );
    const form = await fill(page);

    await form.getByRole("button", { name: "Send message" }).click();

    await expect(form.getByRole("status")).toContainText(`Email me directly at ${profile.email}`);
    await expect(form.getByRole("status")).toHaveClass(/text-destructive/);
    await expect(form.getByRole("button", { name: "Send message" })).toBeEnabled();
    await expect(form.getByLabel("Name")).toHaveValue("Ada Lovelace");
  });
});
