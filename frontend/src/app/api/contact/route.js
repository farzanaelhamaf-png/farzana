import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const topics = new Set(["Forskning og samarbeid", "Foredrag og arrangementer", "Dialog og fasilitering", "Medieforespørsel", "Annet"]);
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const text = (value) => typeof value === "string" ? value.trim() : "";

export async function POST(request) {
  const type = request.headers.get("content-type") || "";
  if (!type.includes("application/json")) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 415 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 }); }
  if (JSON.stringify(body).length > 10000) return NextResponse.json({ error: "Meldingen er for lang." }, { status: 413 });
  // Honeypot: silent success for bots.
  if (body.website) return NextResponse.json({ ok: true });
  const name = text(body.name), email = text(body.email), topic = text(body.topic), message = text(body.message);
  if (name.length < 2 || name.length > 120 || email.length > 254 || !validEmail(email) || !topics.has(topic) || message.length < 10 || message.length > 5000) {
    return NextResponse.json({ error: "Kontroller feltene og prøv igjen." }, { status: 400 });
  }
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Skjemaet er ikke ferdig konfigurert." }, { status: 503 });
  const token = text(body.turnstileToken);
  if (!token) return NextResponse.json({ error: "Fullfør sikkerhetskontrollen." }, { status: 400 });
  try {
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token }), cache: "no-store"
    });
    const result = await verify.json();
    if (!result.success) return NextResponse.json({ error: "Sikkerhetskontrollen mislyktes. Prøv igjen." }, { status: 403 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: "Tjenesten er ikke konfigurert." }, { status: 503 });
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("contact_messages").insert({ name, email, topic, message });
    if (error) { console.error("Contact insert failed:", error.message); return NextResponse.json({ error: "Kunne ikke lagre meldingen." }, { status: 500 }); }
    // Store first. If email delivery fails, the message remains in the admin inbox.
    if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL && process.env.CONTACT_FROM_EMAIL) {
      const notify = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL,
          to: [process.env.CONTACT_NOTIFY_EMAIL],
          subject: `Ny henvendelse på farzana.no: ${topic}`,
          text: `Ny henvendelse fra kontaktskjemaet\n\nNavn: ${name}\nE-post: ${email}\nTema: ${topic}\n\n${message}\n\nÅpne /admin/meldinger for å behandle henvendelsen.`
        }), cache: "no-store"
      });
      if (!notify.ok) console.error("Contact notification failed:", notify.status);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact request failed:", error);
    return NextResponse.json({ error: "Noe gikk galt. Prøv igjen senere." }, { status: 500 });
  }
}
