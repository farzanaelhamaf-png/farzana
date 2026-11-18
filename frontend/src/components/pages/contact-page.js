"use client";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { getTranslations } from "@/lib/site-translations";
import { localePath } from "@/lib/locales";

const topicIds = ["research", "speaking", "dialogue", "media", "other"];
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function KontaktPage({ locale = "no" }) {
  const translated = getTranslations(locale);
  const content = translated.contact;
  const common = translated.common;
  const [form, setForm] = useState({ name: "", email: "", topic: topicIds[0], message: "", website: "" });
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");
  const widget = useRef(null);
  const widgetId = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  useEffect(() => {
    if (!scriptReady || !siteKey || !widget.current || widgetId.current !== null || !window.turnstile) return;
    widgetId.current = window.turnstile.render(widget.current, {
      sitekey: siteKey,
      callback: (value) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken("")
    });
    return () => { if (widgetId.current !== null && window.turnstile) { window.turnstile.remove(widgetId.current); widgetId.current = null; } };
  }, [scriptReady]);
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  async function submit(event) {
    event.preventDefault();
    if (!token) { setNotice(content.turnstilePrompt); return; }
    setStatus("sending"); setNotice("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, locale, turnstileToken: token }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || content.error);
      setStatus("sent"); setNotice(content.success);
      setForm({ name: "", email: "", topic: topicIds[0], message: "", website: "" });
    } catch { setStatus("error"); setNotice(content.error); }
    finally { setToken(""); if (widgetId.current !== null && window.turnstile) window.turnstile.reset(widgetId.current); }
  }
  const field = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-700 focus:ring-2 focus:ring-stone-200";
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-stone-900">
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} />}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 text-sm">
        <Link href={localePath(locale, "home")} className="font-semibold tracking-wide">farzana.no</Link>
        <nav aria-label={common.navigation} className="flex gap-5 text-stone-600"><Link href={localePath(locale, "home")}>{common.home}</Link><Link href={localePath(locale, "about")}>{common.about}</Link><Link href={localePath(locale, "work")}>{common.work}</Link></nav>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-14 md:pt-24">
        <p className="mb-5 text-xs font-semibold tracking-[0.22em] text-stone-500">{content.eyebrow}</p>
        <h1 className="max-w-3xl text-5xl font-light tracking-tight md:text-7xl">{content.title}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-600">{content.introduction}</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 border-t border-stone-300 px-6 py-14 md:grid-cols-[1fr_1.4fr] md:gap-20">
        <div><p className="mb-4 text-xs font-semibold tracking-[0.2em] text-stone-500">{content.contactLabel}</p><h2 className="text-3xl font-light">{content.invitation}</h2><p className="mt-5 leading-7 text-stone-600">{content.invitationText}</p><p className="mt-6 text-sm text-stone-500">{content.privacy}</p></div>
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-9">
          <h2 className="text-2xl font-medium">{content.formTitle}</h2>
          <div><label htmlFor="contact-name" className="mb-2 block text-sm">{content.name}</label><input id="contact-name" className={field} value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} maxLength={120} autoComplete="name" /></div>
          <div><label htmlFor="contact-email" className="mb-2 block text-sm">{content.email}</label><input id="contact-email" type="email" className={field} value={form.email} onChange={(e) => set("email", e.target.value)} required maxLength={254} autoComplete="email" /></div>
          <div><label htmlFor="contact-topic" className="mb-2 block text-sm">{content.topic}</label><select id="contact-topic" className={field} value={form.topic} onChange={(e) => set("topic", e.target.value)}>{content.topics.map((topic, index) => <option key={topicIds[index]} value={topicIds[index]}>{topic}</option>)}</select></div>
          <div><label htmlFor="contact-message" className="mb-2 block text-sm">{content.message}</label><textarea id="contact-message" className={field} value={form.message} onChange={(e) => set("message", e.target.value)} required minLength={10} maxLength={5000} rows={6} /></div>
          <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="contact-website">{content.website}</label><input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
          <div ref={widget} />
          {!siteKey && <p className="text-sm text-amber-800">{content.turnstileMissing}</p>}
          <button disabled={status === "sending" || !siteKey} className="w-full rounded-xl bg-stone-900 px-6 py-3 font-medium text-white hover:bg-stone-700 disabled:opacity-50">{status === "sending" ? content.sending : content.submit}</button>
          {notice && <p role="status" className={status === "error" ? "text-sm text-red-700" : "text-sm text-stone-700"}>{notice}</p>}
        </form>
      </section>
      <footer className="mx-auto flex max-w-6xl justify-between border-t border-stone-300 px-6 py-8 text-xs text-stone-500"><span>{common.copyright.replace("{year}", String(new Date().getFullYear()))}</span><Link href={localePath(locale, "home")}>{content.footer}</Link></footer>
    </main>
  );
}
