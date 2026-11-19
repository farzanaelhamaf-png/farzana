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
  await page.goto("/no");
  await expect(page.getByRole("heading", {
    name: "Arbeider for et mer rettferdig, inkluderende og fredelig samfunn",
  })).toBeVisible();
  await expect(page.getByText(
    "Arbeidet mitt samler erfaring fra parlamentarisk arbeid, institusjonsutvikling, sivilsamfunn og menneskerettigheter, sammen med forskning og dialogarbeid i Norge.",
  )).toBeVisible();

  await page.goto("/no/work");

  await expect(page.getByRole("heading", { name: "Arbeid som bygger broer." })).toBeVisible();
  await expect(page.getByText("Publikasjon A")).toBeVisible();
  await expect(page.getByRole("heading", { name: "På tvers av lokalsamfunn, institusjoner og landegrenser" })).toBeVisible();
  await expect(page.getByText("Reisen min begynte med en bekymring for menneskene rundt meg", { exact: false })).toBeVisible();
  await expect(page.getByText("Parlamentsmedlem")).toHaveCount(0);
  await expect(page.getByText("Dialog og fasilitering")).toBeVisible();
  await expect(page.getByText("Manara Magazine")).toBeVisible();
});

test("professional experience narrative follows English source across all locales", async ({ page }) => {
  await mockSupabase(page);
  const locales = [
    { path: "/work", title: "Across communities, institutions and borders", phrase: "My journey began with a concern for the people around me" },
    { path: "/no/work", title: "På tvers av lokalsamfunn, institusjoner og landegrenser", phrase: "Reisen min begynte med en bekymring for menneskene rundt meg" },
    { path: "/fa-af/work", title: "در میان جوامع، نهادها و مرزها", phrase: "مسیر من با نگرانی دربارهٔ مردم پیرامونم" },
    { path: "/ps/work", title: "د ټولنو، بنسټونو او پولو ترمنځ", phrase: "زما سفر د شاوخوا خلکو او هغو نابرابریو په اړه له اندېښنې پیل شو" },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    await expect(page.getByRole("heading", { name: locale.title })).toBeVisible();
    await expect(page.getByText(locale.phrase, { exact: false })).toBeVisible();
    await expect(page.locator(".work-experience-story > p")).toHaveCount(3);
  }
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

test("about story image is hidden when unset and keeps its arch when configured", async ({ page }) => {
  const mocks = await mockSupabase(page);
  await page.goto("/no/about");
  await expect(page.locator(".about-story-image")).toHaveCount(0);

  mocks.content[2].story_image = "http://127.0.0.1:54321/storage/v1/object/public/site-images/story.jpg";
  await page.reload();

  const frame = page.locator(".about-story-image");
  const image = frame.locator("img");
  await expect(image).toHaveAttribute("src", mocks.content[2].story_image);
  await expect(image).toHaveCSS("object-fit", "cover");
  await expect(frame).toHaveCSS("border-top-left-radius", "180px");
});

test("about and work contact buttons share accessible styling", async ({ page }) => {
  await mockSupabase(page);
  for (const [url, label] of [["/about", "Get in touch →"], ["/work", "Get in touch ↗"]]) {
    await page.goto(url);
    const button = page.getByRole("link", { name: label });
    await expect(button).toHaveClass(/site-action-button/);
    await expect(button).toHaveCSS("background-color", "rgb(52, 79, 73)");
    await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
    const contrast = await button.evaluate(element => {
      const luminance = color => {
        const channels = color.match(/\d+/g).slice(0, 3).map(value => Number(value) / 255)
          .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const styles = getComputedStyle(element);
      const [lighter, darker] = [luminance(styles.color), luminance(styles.backgroundColor)].sort((a, b) => b - a);
      return (lighter + 0.05) / (darker + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);

    await button.hover();
    await expect(button).toHaveCSS("background-color", "rgb(41, 63, 58)");
    await button.focus();
    await expect(button).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveCSS("outline-width", "3px");
  }
});

test("home, about and work layouts fit desktop, tablet and mobile viewports", async ({ page }) => {
  await mockSupabase(page);
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ["/", "/about", "/work"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow, `${path} overflows at ${viewport.width}px`).toBe(false);
      await expect(page.locator(".site-header .language-switcher select")).toBeVisible();
    }

    await page.goto("/");
    const ratios = await page.locator(".feature-photo").evaluateAll(elements =>
      elements.map(element => {
        const { width, height } = element.getBoundingClientRect();
        return width / height;
      })
    );
    for (const ratio of ratios) expect(ratio).toBeCloseTo(16 / 9, 1);
  }
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
  await expect(page.getByRole("heading", { name: "در تلاش برای جامعه‌ای عادلانه‌تر، فراگیرتر و صلح‌آمیزتر" })).toBeVisible();
  await expect(page.getByText("کار من تجربه در پارلمان، توسعهٔ نهادها، جامعهٔ مدنی و حقوق بشر را با پژوهش و تجربهٔ عملی گفتگو در ناروی پیوند می‌دهد.")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "زبان" })).toBeVisible();
  await expect(page.locator('link[rel="alternate"][hreflang="ps-AF"]')).toHaveAttribute("href", "https://farzana.no/ps/");

  await page.goto("/ps");
  await expect(page.locator("html")).toHaveAttribute("lang", "ps-AF");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "د یوې لا عادلانه، ټولشموله او سوله‌ییزې ټولنې لپاره هڅې" })).toBeVisible();
  await expect(page.getByText("زما کار په پارلماني چارو، د بنسټونو پراختیا، مدني ټولنې او بشري حقونو کې تجربه، په ناروې کې له څېړنې او د خبرو اترو له عملي تجربې سره یوځای کوي.")).toBeVisible();
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
    { prefix: "", home: "Home", about: "About", work: "Work", contact: "Contact", language: "Language", socialLabel: "Social", homePath: "/", contactPath: "/contact" },
    { prefix: "/no", home: "Hjem", about: "Om meg", work: "Arbeid", contact: "Kontakt", language: "Språk", socialLabel: "Sosiale medier", homePath: "/no/", contactPath: "/no/contact" },
    { prefix: "/fa-af", home: "صفحهٔ اصلی", about: "دربارهٔ من", work: "فعالیت‌ها", contact: "تماس", language: "زبان", socialLabel: "شبکه‌های اجتماعی", homePath: "/fa-af/", contactPath: "/fa-af/contact" },
    { prefix: "/ps", home: "کور", about: "زما په اړه", work: "کار", contact: "اړیکه", language: "ژبه", socialLabel: "ټولنیزې رسنۍ", homePath: "/ps/", contactPath: "/ps/contact" },
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
      await expect(page.locator(".site-footer-social > span")).toHaveText(locale.socialLabel);
      await expect(page.locator(".site-footer-social-links a")).toHaveCount(4);
      if (pagePath === locale.homePath) {
        await expect(page.getByRole("link", { name: locale.about, exact: true })).toHaveCount(1);
      }
    }
  }
});
