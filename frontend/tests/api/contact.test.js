import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../src/app/api/contact/route.js";

const validPayload = {
  name: "Test Person",
  email: "test@example.com",
  topic: "Forskning og samarbeid",
  message: "Dette er en gyldig testmelding.",
  turnstileToken: "test-token",
};

function request(body, { contentType = "application/json", raw = false } = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: contentType ? { "content-type": contentType } : {},
    body: raw ? body : JSON.stringify(body),
  });
}

async function responseJson(response) {
  return { status: response.status, body: await response.json() };
}

function mockExternalServices({ turnstile = { success: true }, databaseStatus = 201, resendStatus } = {}) {
  const calls = [];
  vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
    const target = String(url);
    calls.push({ url: target, options });

    if (target.includes("siteverify")) {
      return Response.json(turnstile);
    }

    if (target.includes("/rest/v1/contact_messages")) {
      return new Response(null, { status: databaseStatus });
    }

    if (target.includes("api.resend.com")) {
      return new Response(null, { status: resendStatus || 200 });
    }

    throw new Error(`Unexpected external request: ${target}`);
  }));
  return calls;
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("CONTACT_NOTIFY_EMAIL", "");
    vi.stubEnv("CONTACT_FROM_EMAIL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects non-JSON requests", async () => {
    const result = await responseJson(await POST(request("hello", {
      contentType: "text/plain",
      raw: true,
    })));

    expect(result).toEqual({ status: 415, body: { error: "Ugyldig forespørsel." } });
  });

  it("rejects malformed JSON", async () => {
    const result = await responseJson(await POST(request("{", { raw: true })));

    expect(result).toEqual({ status: 400, body: { error: "Ugyldig JSON." } });
  });

  it("rejects oversized payloads", async () => {
    const result = await responseJson(await POST(request({
      ...validPayload,
      message: "x".repeat(10_000),
    })));

    expect(result.status).toBe(413);
    expect(result.body.error).toBe("Meldingen er for lang.");
  });

  it("silently accepts a filled honeypot without contacting external services", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await responseJson(await POST(request({ website: "https://spam.example" })));

    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["short name", { name: "A" }],
    ["long name", { name: "x".repeat(121) }],
    ["invalid email", { email: "not-an-email" }],
    ["long email", { email: `${"x".repeat(250)}@example.com` }],
    ["unknown topic", { topic: "Unknown" }],
    ["short message", { message: "Too short" }],
    ["long message", { message: "x".repeat(5_001) }],
  ])("rejects invalid %s", async (_label, overrides) => {
    const result = await responseJson(await POST(request({ ...validPayload, ...overrides })));

    expect(result.status).toBe(400);
    expect(result.body.error).toBe("Kontroller feltene og prøv igjen.");
  });

  it("reports missing Turnstile configuration", async () => {
    const result = await responseJson(await POST(request(validPayload)));

    expect(result.status).toBe(503);
    expect(result.body.error).toBe("Skjemaet er ikke ferdig konfigurert.");
  });

  it("requires a Turnstile token", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    const { turnstileToken: _ignored, ...payload } = validPayload;
    const result = await responseJson(await POST(request(payload)));

    expect(result.status).toBe(400);
    expect(result.body.error).toBe("Fullfør sikkerhetskontrollen.");
  });

  it("rejects an unsuccessful Turnstile response", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    const calls = mockExternalServices({ turnstile: { success: false } });
    const result = await responseJson(await POST(request(validPayload)));

    expect(result.status).toBe(403);
    expect(result.body.error).toBe("Sikkerhetskontrollen mislyktes. Prøv igjen.");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("siteverify");
  });

  it("reports missing database configuration after verification", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    mockExternalServices();
    const result = await responseJson(await POST(request(validPayload)));

    expect(result.status).toBe(503);
    expect(result.body.error).toBe("Tjenesten er ikke konfigurert.");
  });

  it("saves a verified message and succeeds if optional email notification fails", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    vi.stubEnv("RESEND_API_KEY", "test-resend-key");
    vi.stubEnv("CONTACT_NOTIFY_EMAIL", "notify@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "site@example.com");
    const calls = mockExternalServices({ resendStatus: 503 });
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await responseJson(await POST(request(validPayload)));

    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(calls.map(({ url }) => new URL(url).hostname)).toEqual([
      "challenges.cloudflare.com",
      "supabase.example",
      "api.resend.com",
    ]);
    expect(calls[1].options.method).toBe("POST");
    expect(JSON.parse(calls[1].options.body)).toEqual({
      name: validPayload.name,
      email: validPayload.email,
      topic: validPayload.topic,
      message: validPayload.message,
    });
    expect(logError).toHaveBeenCalledWith("Contact notification failed:", 503);
  });

  it("normalizes localized contact topic IDs before storing messages", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    const calls = mockExternalServices();

    const result = await responseJson(await POST(request({
      ...validPayload,
      topic: "research",
      locale: "en",
    })));

    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(JSON.parse(calls[1].options.body).topic).toBe("Forskning og samarbeid");
  });

  it("reports database write errors", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    mockExternalServices({ databaseStatus: 500 });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await responseJson(await POST(request(validPayload)));

    expect(result.status).toBe(500);
    expect(result.body.error).toBe("Kunne ikke lagre meldingen.");
  });
});
