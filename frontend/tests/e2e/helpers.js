import { expect } from "@playwright/test";

const adminUser = {
  id: "test-admin-user",
  aud: "authenticated",
  role: "authenticated",
  email: "admin@example.com",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  identities: [],
  created_at: "2026-01-01T00:00:00.000Z",
  is_anonymous: false,
};

const defaultSiteContent = {
  1: {
    site_name: "farzana.no",
    eyebrow: "MENNESKER · SAMFUNN · MULIGHETER",
    headline: "Et mer rettferdig, inkluderende og fredelig samfunn",
    introduction: "Jeg arbeider med menneskerettigheter, forskning og dialog.",
    hero_image: "",
    quote: "Endring er mulig når vi bygger broer sammen.",
    quote_image: "",
    sections: [
      { title: "Menneskerettigheter & politikk", description: "Like muligheter og sosial rettferdighet.", image: "", href: "#kontakt" },
      { title: "Forskning & publikasjoner", description: "Analyse og kunnskap.", image: "", href: "#kontakt" },
      { title: "Prosjekter", description: "Dialog og varig endring.", image: "", href: "#kontakt" },
      { title: "Dialog & fasilitering", description: "Samtaler på tvers.", image: "", href: "#kontakt" },
    ],
    contact_email: "hello@example.com",
  },
  2: {
    title: "Et liv mellom mennesker, steder og muligheter",
    story_title: "Fra Afghanistan til Norge – og videre",
    story: ["Første historieavsnitt.", "Andre historieavsnitt."],
    areas: [
      { title: "Politikk og menneskerettigheter", description: "Rettigheter og politikk." },
      { title: "Forskning og kunnskap", description: "Forskning og analyse." },
    ],
    nature_title: "Jeg finner også mening ute",
  },
  3: {
    eyebrow: "FORSKNING · POLITIKK · MENNESKER",
    headline: "Arbeid som bygger broer.",
    introduction: "Mellom mennesker og institusjoner.",
    perspective: "Forskning, kunnskap og handling.",
    publications: [
      { category: "Masteroppgave", year: "2025", title: "Publikasjon A", organization: "NMBU", description: "Masterforskning.", link: "" },
      { category: "Forskningsrapport", year: "2024", title: "Publikasjon B", organization: "NMBU", description: "Forskningsrapport.", link: "" },
    ],
    experiences: [
      { years: "2019–2021", role: "Parlamentsmedlem", organization: "Afghanistans parlament", description: "Lovgivning og offentlig politikk." },
    ],
    engagements: [
      { year: "2025", title: "Dialog og fasilitering", description: "Fasilitering og dialog.", link: "" },
    ],
    media: [
      { name: "Manara Magazine", year: "2023", subject: "Kvinner og politikk", link: "" },
    ],
  },
};

const contactMessages = [{
  id: "message-1",
  created_at: "2026-01-01T00:00:00.000Z",
  name: "Test Avsender",
  email: "sender@example.com",
  topic: "Forskning og samarbeid",
  message: "Dette er en testmelding til innboksen.",
  status: "new",
}];

export async function mockSupabase(page, { authenticated = false, isAdmin = true } = {}) {
  const state = {
    authenticated,
    isAdmin,
    content: structuredClone(defaultSiteContent),
    messages: structuredClone(contactMessages),
    uploads: [],
  };

  await page.route("http://127.0.0.1:54321/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/auth/v1/user") {
      return route.fulfill({
        status: state.authenticated ? 200 : 401,
        json: state.authenticated ? adminUser : { message: "Invalid JWT" },
      });
    }

    if (path === "/auth/v1/token") {
      const credentials = request.postDataJSON();
      if (credentials.email !== adminUser.email || credentials.password !== "test-password") {
        return route.fulfill({ status: 400, json: { msg: "Invalid login credentials" } });
      }
      state.authenticated = true;
      return route.fulfill({
        status: 200,
        json: {
          access_token: "test-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "test-refresh-token",
          user: adminUser,
        },
      });
    }

    if (path === "/auth/v1/logout") {
      state.authenticated = false;
      return route.fulfill({ status: 204, body: "" });
    }

    if (path.startsWith("/rest/v1/admin_users")) {
      return route.fulfill({
        status: 200,
        json: state.authenticated && state.isAdmin ? [{ user_id: adminUser.id }] : [],
      });
    }

    if (path.startsWith("/rest/v1/site_content")) {
      const id = Number(url.searchParams.get("id")?.replace("eq.", ""));
      if (method === "GET") {
        const record = state.content[id];
        return route.fulfill({
          status: record ? 200 : 406,
          json: record ? { id, content: record } : { message: "No rows found" },
        });
      }
      if (method === "PATCH") {
        const body = request.postDataJSON();
        state.content[id] = body.content;
        if (request.headers().prefer?.includes("return=representation")) {
          return route.fulfill({ status: 200, json: [{ id }] });
        }
        return route.fulfill({ status: 204, body: "" });
      }
    }

    if (path.startsWith("/rest/v1/contact_messages")) {
      if (method === "GET") return route.fulfill({ status: 200, json: state.messages });
      if (method === "PATCH") {
        const body = request.postDataJSON();
        const id = url.searchParams.get("id")?.replace("eq.", "");
        state.messages = state.messages.map(message =>
          message.id === id ? { ...message, ...body } : message
        );
        return route.fulfill({ status: 204, body: "" });
      }
    }

    if (path.startsWith("/storage/v1/object/site-images/") && method === "POST") {
      const body = request.postDataBuffer();
      const boundary = request.headers()["content-type"].split("boundary=")[1];
      const multipart = body.toString("latin1");
      const filePart = multipart.match(/Content-Disposition: form-data; name="[^"]*"; filename="[^"]+"\r\nContent-Type: (image\/[a-z0-9.+-]+)\r\n\r\n/i);
      if (!filePart) {
        return route.fulfill({ status: 400, json: { message: "Expected a WebP thumbnail upload" } });
      }
      const fileStart = filePart.index + filePart[0].length;
      const fileEnd = multipart.indexOf(`\r\n--${boundary}`, fileStart);
      const image = Buffer.from(multipart.slice(fileStart, fileEnd), "latin1");
      state.uploads.push({
        path: path.split("/").pop(),
        contentType: filePart[1],
        image,
      });
      return route.fulfill({ status: 200, json: { Key: path } });
    }

    if (path.startsWith("/storage/v1/object/public/site-images/")) {
      const upload = state.uploads.at(-1);
      if (!upload) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5xoAAAAASUVORK5CYII=", "base64"),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "image/webp",
        body: upload.image,
      });
    }

    return route.fulfill({ status: 404, json: { message: `Unhandled mock request: ${method} ${path}` } });
  });

  return state;
}

export async function loginAsAdmin(page, path = "/admin/dashboard") {
  await page.goto("/admin");
  await page.getByLabel("E-post").fill("admin@example.com");
  await page.getByLabel("Passord").fill("test-password");
  await page.getByRole("button", { name: "Logg inn" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  if (path !== "/admin/dashboard") await page.goto(path);
}
