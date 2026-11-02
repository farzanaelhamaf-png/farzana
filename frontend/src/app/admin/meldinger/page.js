"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MeldingerAdmin() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  async function load() {
    setError("");
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) { setAuthorized(false); setLoading(false); return; }
    const { data: admin, error: adminError } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (adminError || !admin) { setAuthorized(false); setLoading(false); return; }
    setAuthorized(true);
    const { data, error: readError } = await supabase.from("contact_messages").select("id,created_at,name,email,topic,message,status").order("created_at", { ascending: false }).limit(100);
    if (readError) setError(readError.message);
    else setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function updateStatus(id, status) {
    const { error: updateError } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (updateError) setError(updateError.message);
    else setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
  }
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-900">
      <div className="mx-auto max-w-5xl"><Link href="/admin/dashboard" className="text-sm text-stone-600">← Til adminpanel</Link><h1 className="mb-3 mt-8 text-4xl font-semibold">Meldinger</h1><p className="mb-8 text-stone-600">Henvendelser fra kontaktskjemaet på farzana.no.</p>
        {loading ? <p>Laster …</p> : !authorized ? <p>Du må være logget inn som administrator for å se meldinger. <Link href="/admin" className="underline">Logg inn</Link></p> : <>
          <div className="mb-5 flex items-center justify-between"><p>{items.length} meldinger (de 100 nyeste)</p><button onClick={load} className="rounded-lg border px-4 py-2">Oppdater</button></div>
          {error && <p role="alert" className="mb-5 text-red-700">{error}</p>}
          {items.length === 0 && <p>Ingen meldinger ennå.</p>}
          <div className="space-y-5">{items.map((item) => <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{item.name}</h2><p className="text-sm text-stone-500">{new Date(item.created_at).toLocaleString("nb-NO")} · {item.topic}</p></div><select aria-label={`Status for melding fra ${item.name}`} className="rounded-lg border px-3 py-2" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}><option value="new">Ny</option><option value="read">Lest</option><option value="replied">Besvart</option></select></div>
            <a className="mt-3 inline-block text-sm underline" href={`mailto:${item.email}`}>{item.email}</a><p className="mt-5 whitespace-pre-wrap break-words leading-7">{item.message}</p>
            <a className="mt-5 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm text-white" href={`mailto:${item.email}?subject=${encodeURIComponent(`Svar på din henvendelse: ${item.topic}`)}`}>Svar via e-post ↗</a>
          </article>)}</div>
        </>}
      </div>
    </main>
  );
}
