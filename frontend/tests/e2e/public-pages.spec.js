import { expect, test } from "@playwright/test";
import { mockSupabase } from "./helpers.js";

test("homepage renders content, navigation and un-cropped thumbnails", async ({ page }) => {
  const mocks = await mockSupabase(page);
  mocks.content[1].sections[0].image = "http://127.0.0.1:54321/storage/v1/object/public/site-images/card.webp";
  mocks.content[1].hero_image = "http://127.0.0.1:54321/storage/v1/object/public/site-images/hero.jpg";

  await page.goto("/");

  await expect(page.getByRole("heading", {
    name: "Et mer rettferdig, inkluderende og fredelig samfunn",
  })).toBeVisible();
  await expect(page.locator(".feature")).toHaveCount(4);
  await expect(page.locator(".topbar nav").getByRole("link", { name: "Om meg" })).toHaveAttribute("href", "/om-meg");
  await expect(page.locator(".topbar nav").getByRole("link", { name: "Arbeid" })).toHaveAttribute("href", "/arbeid");
  await expect(page.locator(".topbar nav").getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "/kontakt");
  await expect(page.locator(".feature").first()).toHaveAttribute("href", "/kontakt");
  await expect(page.locator(".contact a[href^='mailto:']")).toHaveAttribute("href", "mailto:hello@example.com");
  await expect(page.locator(".hero-photo img")).toHaveAttribute("src", mocks.content[1].hero_image);
  await expect(page.locator(".hero-photo img")).toHaveCSS("object-fit", "cover");
  await expect(page.locator(".feature-photo img").first()).toHaveCSS("object-fit", "contain");
});

test("work page shows publication, experience, engagement and media content", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/arbeid");

  await expect(page.getByRole("heading", { name: "Arbeid som bygger broer." })).toBeVisible();
  await expect(page.getByText("Publikasjon A")).toBeVisible();
  await expect(page.getByText("Parlamentsmedlem")).toBeVisible();
  await expect(page.getByText("Dialog og fasilitering")).toBeVisible();
  await expect(page.getByText("Manara Magazine")).toBeVisible();
});

test("about page renders story, experience areas and contact links", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/om-meg");

  await expect(page.getByRole("heading", {
    name: "Et liv mellom mennesker, steder og muligheter",
  })).toBeVisible();
  await expect(page.getByText("Første historieavsnitt.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Politikk og menneskerettigheter" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kontakt", exact: true })).toHaveAttribute("href", "/kontakt");
  await expect(page.getByRole("link", { name: "Ta kontakt →" })).toHaveAttribute("href", "/kontakt");
});

test("contact form validates fields and reports a successful submission", async ({ page }) => {
  await mockSupabase(page);
  await page.route("https://challenges.cloudflare.com/**", route => route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: "window.turnstile={render:(element,options)=>{window.__turnstileOptions=options;return 'test-widget';},remove:()=>{},reset:()=>{}};",
  }));
  await page.route("**/api/contact", async route => {
    expect(route.request().postDataJSON()).toMatchObject({
      name: "Test Avsender",
      email: "sender@example.com",
      topic: "Forskning og samarbeid",
      message: "Dette er en gyldig melding fra kontaktskjemaet.",
      turnstileToken: "test-turnstile-token",
    });
    await route.fulfill({ status: 200, json: { ok: true } });
  });

  await page.goto("/kontakt");
  const submit = page.getByRole("button", { name: "Send melding ↗" });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByLabel("Navn")).toHaveAttribute("required", "");

  await page.getByLabel("Navn").fill("Test Avsender");
  await page.getByLabel("E-postadresse").fill("sender@example.com");
  await page.getByLabel("Melding").fill("Dette er en gyldig melding fra kontaktskjemaet.");
  await expect.poll(() => page.evaluate(() => Boolean(window.__turnstileOptions))).toBe(true);
  await page.evaluate(() => window.__turnstileOptions.callback("test-turnstile-token"));
  await submit.click();

  await expect(page.getByRole("status")).toHaveText("Takk! Meldingen din er mottatt.");
  await expect(page.getByLabel("Navn")).toHaveValue("");
});
