import { expect, test } from "@playwright/test";
import { loginAsAdmin, mockSupabase } from "./helpers.js";

test("admin dashboard blocks anonymous users", async ({ page }) => {
  await mockSupabase(page, { authenticated: false });
  await page.goto("/admin/dashboard");

  await expect(page.getByRole("heading", { name: "Ingen administratortilgang" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Gå til innlogging" })).toHaveAttribute("href", "/admin");
});

test("admin login opens the dashboard with working editor links", async ({ page }) => {
  await mockSupabase(page, { authenticated: false });
  await page.goto("/admin");
  await page.getByLabel("E-post").fill("admin@example.com");
  await page.getByLabel("Passord").fill("test-password");
  await page.getByRole("button", { name: "Logg inn" }).click();

  await expect(page.getByRole("heading", { name: "Administrasjon" })).toBeVisible();
  await expect(page.locator('a[href="/admin/forside"]')).toBeVisible();
  await expect(page.locator('a[href="/admin/arbeid"]')).toBeVisible();
});

test("signed-in non-admin is denied access", async ({ page }) => {
  await mockSupabase(page, { authenticated: false, isAdmin: false });
  await page.goto("/admin");
  await page.getByLabel("E-post").fill("admin@example.com");
  await page.getByLabel("Passord").fill("test-password");
  await page.getByRole("button", { name: "Logg inn" }).click();

  await expect(page.locator('p[role="alert"]')).toHaveText("Denne kontoen har ikke administratorrettigheter.");
});

test("homepage editor saves text and uploads a resized WebP thumbnail", async ({ page }) => {
  const mocks = await mockSupabase(page, { authenticated: false });
  await loginAsAdmin(page, "/admin/forside");

  const headline = page.getByLabel("Hovedoverskrift");
  await headline.fill("Ny testoverskrift");

  const imageData = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    context.fillStyle = "#567";
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  });
  const imageBuffer = Buffer.from(imageData.split(",")[1], "base64");
  const thumbnailUpload = page.locator('input[type="file"]').nth(1);
  await expect(thumbnailUpload).toHaveAttribute("accept", /\.heic/);
  await thumbnailUpload.setInputFiles({
    name: "large-thumbnail-source.png",
    mimeType: "image/png",
    buffer: imageBuffer,
  });
  await expect(page.getByRole("status")).toContainText("Miniatyrbildet er optimalisert");
  expect(mocks.uploads).toHaveLength(1);
  expect(mocks.uploads[0].path).toMatch(/\.webp$/);
  expect(mocks.uploads[0].contentType).toContain("image/webp");

  const encodedThumbnail = mocks.uploads[0].image.toString("base64");
  const dimensions = await page.evaluate(async encoded => {
    const image = new Image();
    image.src = `data:image/webp;base64,${encoded}`;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, encodedThumbnail);
  expect(dimensions).toEqual({ width: 800, height: 400 });

  await page.getByRole("button", { name: "Lagre endringer" }).click();
  await expect(page.getByRole("status")).toContainText("Lagret!");
  expect(mocks.content[1].headline).toBe("Ny testoverskrift");
  expect(mocks.content[1].sections[0].image).toContain(".webp");
});

test("work editor can add, reorder, remove and save entries", async ({ page }) => {
  const mocks = await mockSupabase(page, { authenticated: false });
  await loginAsAdmin(page, "/admin/arbeid");

  const publications = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Forskning og publikasjoner" }),
  });
  await expect(publications.getByText("2 oppføringer")).toBeVisible();
  await publications.getByRole("button", { name: "+ Legg til oppføring" }).click();
  await expect(publications.getByText("3 oppføringer")).toBeVisible();

  const records = publications.locator(".rounded-lg.border");
  await records.nth(2).getByLabel("Tittel").fill("Ny testpublikasjon");
  await records.nth(1).getByRole("button", { name: "↑" }).click();
  await expect(records.nth(0).getByLabel("Tittel")).toHaveValue("Publikasjon B");

  page.once("dialog", dialog => dialog.accept());
  await records.nth(2).getByRole("button", { name: "Fjern" }).click();
  await expect(publications.getByText("2 oppføringer")).toBeVisible();

  await page.getByRole("button", { name: "Lagre Arbeid" }).click();
  await expect(page.getByRole("status")).toContainText("Lagret!");
  expect(mocks.content[3].publications.map(item => item.title)).toEqual([
    "Publikasjon B",
    "Publikasjon A",
  ]);
});

test("about editor saves content", async ({ page }) => {
  const mocks = await mockSupabase(page, { authenticated: false });
  await loginAsAdmin(page, "/admin/om-meg");

  await page.getByLabel("Hovedtittel").fill("Oppdatert om meg-test");
  const imageData = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 50;
    canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  });
  const aboutImageUpload = page.locator('input[type="file"]').first();
  await expect(aboutImageUpload).toHaveAttribute("accept", /\.heic/);
  await aboutImageUpload.setInputFiles({
    name: "about-test.png",
    mimeType: "image/png",
    buffer: Buffer.from(imageData.split(",")[1], "base64"),
  });
  await expect(page.getByRole("status")).toContainText("Bilde lastet opp.");
  expect(mocks.uploads[0].contentType).toContain("image/png");

  await page.getByRole("button", { name: "Lagre Om meg" }).click();

  await expect(page.getByRole("status")).toContainText("Lagret!");
  expect(mocks.content[2].title).toBe("Oppdatert om meg-test");
  expect(mocks.content[2].hero_image).toContain(".png");

  await page.getByLabel("Heading (English)").fill("Making space for what’s possible");
  await page.getByLabel("Paragraph 1 (English)").fill(
    "My work across communities, institutions and borders has brought different stories, perspectives and lessons.",
  );
  await page.getByLabel("Paragraph 2 (English)").fill(
    "I welcome opportunities to exchange ideas, share perspectives and co-create through research, dialogue and collaboration.",
  );
  await page.getByRole("button", { name: "Lagre Om meg" }).click();

  await expect(page.getByRole("status")).toContainText("Lagret!");
  expect(mocks.content[2].en_closing_title).toBe("Making space for what’s possible");
  expect(mocks.content[2].en_closing_paragraph_1).toBe(
    "My work across communities, institutions and borders has brought different stories, perspectives and lessons.",
  );
  expect(mocks.content[2].en_closing_paragraph_2).toBe(
    "I welcome opportunities to exchange ideas, share perspectives and co-create through research, dialogue and collaboration.",
  );
  expect(mocks.content[2].closing_title).toBe("Skape rom for det som er mulig");
  expect(mocks.content[2].closing_text).toBe(
    "Arbeidet mitt på tvers av lokalsamfunn, institusjoner og landegrenser har brakt med seg ulike historier, perspektiver og erfaringer. Jeg ønsker muligheter til å utveksle ideer, dele perspektiver og skape noe sammen gjennom forskning, dialog og samarbeid.",
  );

  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Making space for what’s possible" })).toBeVisible();
  await expect(page.getByText("My work across communities, institutions and borders has brought different stories, perspectives and lessons.", { exact: true })).toBeVisible();
  await page.goto("/no/about");
  await expect(page.getByRole("heading", { name: "Skape rom for det som er mulig" })).toBeVisible();
});

test("messages inbox lists a message and persists its status", async ({ page }) => {
  const mocks = await mockSupabase(page, { authenticated: false });
  await loginAsAdmin(page, "/admin/meldinger");

  await expect(page.getByRole("heading", { name: "Test Avsender" })).toBeVisible();
  await expect(page.getByText("Dette er en testmelding til innboksen.")).toBeVisible();
  await page.getByLabel("Status for melding fra Test Avsender").selectOption("read");
  await expect(page.getByLabel("Status for melding fra Test Avsender")).toHaveValue("read");
  expect(mocks.messages[0].status).toBe("read");
});
