import { expect, test } from "@playwright/test";
import { mockSupabase } from "./helpers.js";

test("English homepage renders content, navigation and un-cropped thumbnails", async ({ page }) => {
  const mocks = await mockSupabase(page);
  mocks.content[1].sections[0].image = "http://127.0.0.1:54321/storage/v1/object/public/site-images/card.webp";
  mocks.content[1].hero_image = "http://127.0.0.1:54321/storage/v1/object/public/site-images/hero.jpg";

  await page.goto("/");

  await expect(page.getByRole("heading", {
    name: "Working towards a more just, inclusive and peaceful society",
  })).toBeVisible();
  await expect(page.getByText(
    "My work brings together experience in parliamentary work, institutional development, civil society and human rights, alongside research and dialogue practice in Norway.",
  )).toBeVisible();
  await expect(page.locator(".feature")).toHaveCount(4);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".site-header nav").getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  await expect(page.getByRole("link", { name: "About me", exact: true })).toHaveCount(0);
  await expect(page.locator(".site-header nav").getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  await expect(page.locator(".site-header nav").getByRole("link")).toHaveCount(3);
  await expect(page.locator(".site-footer-links").getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  const socialLinks = [
    ["Facebook page", "https://www.facebook.com/FarzanaElhamaf/"],
    ["X", "https://x.com/Farzanakochai"],
    ["Instagram", "https://www.instagram.com/farzanaelhamkochai/"],
    ["LinkedIn", "https://www.linkedin.com/in/farzanaelhamkochai/"],
  ];
  for (const [label, href] of socialLinks) {
    const link = page.locator(".site-footer-social-links").getByRole("link", { name: label });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(page.locator(".feature").first()).toHaveAttribute("href", "/contact");
  await expect(page.locator('link[rel="alternate"][hreflang="nb-NO"]')).toHaveAttribute("href", "https://farzana.no/no/");
  await expect(page.locator(".contact a[href^='mailto:']")).toHaveAttribute("href", "mailto:hello@example.com");
  await expect(page.locator(".hero-photo img")).toHaveAttribute("src", mocks.content[1].hero_image);
  await expect(page.locator(".hero-photo img")).toHaveCSS("object-fit", "cover");
  await expect(page.locator(".feature-photo img").first()).toHaveCSS("object-fit", "contain");
});

test("Norwegian work page shows publication, experience, engagement and media content", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/no/work");

  await expect(page.getByRole("heading", { name: "Arbeid som bygger broer." })).toBeVisible();
  await expect(page.getByText("Publikasjon A")).toBeVisible();
  await expect(page.getByText("Parlamentsmedlem")).toBeVisible();
  await expect(page.getByText("Dialog og fasilitering")).toBeVisible();
  await expect(page.getByText("Manara Magazine")).toBeVisible();
});

test("Norwegian about page renders story, experience areas and contact links", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/no/about");

  await expect(page.getByRole("heading", {
    name: "Et liv mellom mennesker, steder og muligheter",
  })).toBeVisible();
  await expect(page.getByText("Første historieavsnitt.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Politikk og menneskerettigheter" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kontakt", exact: true })).toHaveAttribute("href", "/no/contact");
  await expect(page.getByRole("link", { name: "Ta kontakt →" })).toHaveAttribute("href", "/no/contact");
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
      topic: "research",
      message: "Dette er en gyldig melding fra kontaktskjemaet.",
      turnstileToken: "test-turnstile-token",
    });
    await route.fulfill({ status: 200, json: { ok: true } });
  });

  await page.goto("/no/contact");
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

test("Dari and Pashto pages render with localized language and right-to-left direction", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/fa-af");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa-AF");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "برای جامعه‌ای عادلانه‌تر، فراگیرتر و صلح‌آمیزتر" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "زبان" })).toBeVisible();
  await expect(page.locator('link[rel="alternate"][hreflang="ps-AF"]')).toHaveAttribute("href", "https://farzana.no/ps/");

  await page.goto("/ps");
  await expect(page.locator("html")).toHaveAttribute("lang", "ps-AF");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "د یوې لا عادلانه، ټولشموله او سوله‌ییزې ټولنې د جوړولو لپاره" })).toBeVisible();
});

test("language selector preserves the current page when changing language", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/about");
  await page.getByRole("combobox", { name: "Language" }).selectOption("no");
  await expect(page).toHaveURL(/\/no\/about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nb-NO");
});

test("all languages share the same header and place contact in the footer", async ({ page }) => {
  await mockSupabase(page);
  const locales = [
    { prefix: "", home: "Home", about: "About", work: "Work", contact: "Contact", language: "Language", homePath: "/", contactPath: "/contact" },
    { prefix: "/no", home: "Hjem", about: "Om meg", work: "Arbeid", contact: "Kontakt", language: "Språk", homePath: "/no/", contactPath: "/no/contact" },
    { prefix: "/fa-af", home: "صفحهٔ اصلی", about: "دربارهٔ من", work: "فعالیت‌ها", contact: "تماس", language: "زبان", homePath: "/fa-af/", contactPath: "/fa-af/contact" },
    { prefix: "/ps", home: "کور", about: "زما په اړه", work: "کار", contact: "اړیکه", language: "ژبه", homePath: "/ps/", contactPath: "/ps/contact" },
  ];

  for (const locale of locales) {
    for (const pagePath of [locale.homePath, `${locale.prefix}/about`, `${locale.prefix}/work`, locale.contactPath]) {
      await page.goto(pagePath);
      const navigation = page.locator(".site-header nav");
      await expect(navigation.getByRole("link")).toHaveCount(3);
      await expect(navigation.getByRole("link", { name: locale.home })).toBeVisible();
      await expect(navigation.getByRole("link", { name: locale.about })).toBeVisible();
      await expect(navigation.getByRole("link", { name: locale.work })).toBeVisible();
      await expect(navigation.getByRole("link", { name: locale.contact })).toHaveCount(0);
      await expect(page.locator(".site-header-controls .language-switcher").getByRole("combobox", { name: locale.language })).toBeVisible();
      await expect(page.locator(".site-footer-links").getByRole("link", { name: locale.contact })).toHaveAttribute("href", locale.contactPath);
      await expect(page.locator(".site-footer-social-links a")).toHaveCount(4);
      if (pagePath === locale.homePath) {
        await expect(page.getByRole("link", { name: locale.about, exact: true })).toHaveCount(1);
      }
    }
  }
});
