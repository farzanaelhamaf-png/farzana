'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { aboutDefaults } from '@/lib/about-content';

export default function AboutAdmin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [content, setContent] = useState(aboutDefaults);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { session: current } } = await supabase.auth.getSession();
      if (!active) return;
      setSession(current);
      if (!current) { setLoading(false); return; }
      const { data: role, error: roleError } = await supabase.from('admin_users').select('user_id').eq('user_id', current.user.id).maybeSingle();
      if (!active) return;
      if (roleError || !role) { setLoading(false); return; }
      setAllowed(true);
      const { data, error } = await supabase.from('site_content').select('content').eq('id', 2).maybeSingle();
      if (!active) return;
      if (error) setStatus(`Kunne ikke hente innhold: ${error.message}`);
      else if (!data) setStatus('Innholdsraden mangler. Kjør SQL-kommandoen i veiledningen.');
      else setContent({ ...aboutDefaults, ...data.content });
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const update = (key, value) => setContent(prev => ({ ...prev, [key]: value }));
  const updateArea = (index, key, value) => setContent(prev => ({ ...prev, areas: prev.areas.map((area, i) => i === index ? { ...area, [key]: value } : area) }));
  const updateStory = value => update('story', value.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean));

  async function upload(file, key) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setStatus('Bruk JPG, PNG eller WebP.'); return; }
    if (file.size > 8 * 1024 * 1024) { setStatus('Bildet må være under 8 MB.'); return; }
    setBusy(true); setStatus('Laster opp bilde …');
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('site-images').upload(path, file, { contentType: file.type, upsert: false });
    if (error) setStatus(`Opplasting feilet: ${error.message}`);
    else {
      const { data } = supabase.storage.from('site-images').getPublicUrl(path);
      update(key, data.publicUrl);
      setStatus('Bilde lastet opp. Trykk «Lagre Om meg» for å publisere.');
    }
    setBusy(false);
  }

  async function save() {
    setBusy(true); setStatus('Lagrer …');
    const { data, error } = await supabase.from('site_content').update({ content, updated_at: new Date().toISOString() }).eq('id', 2).select('id');
    setStatus(error ? `Kunne ikke lagre: ${error.message}` : !data?.length ? 'Ingen rad ble oppdatert. Kontroller at id = 2 finnes i site_content.' : 'Lagret! Åpne /om-meg og oppdater siden.');
    setBusy(false);
  }

  function field(label, key, multiline = false) {
    return <label className="block mb-5 text-sm font-medium">{label}{multiline ? <textarea className="mt-2 w-full rounded border border-stone-300 p-3 text-base min-h-28" value={content[key] ?? ''} onChange={e => update(key, e.target.value)} /> : <input className="mt-2 w-full rounded border border-stone-300 p-3 text-base" value={content[key] ?? ''} onChange={e => update(key, e.target.value)} />}</label>;
  }
  function imageField(label, key) {
    return <div className="mb-6"><label className="block text-sm font-medium mb-2" htmlFor={`upload-${key}`}>{label}</label>{content[key] && <img src={content[key]} alt="Forhåndsvisning" className="mb-3 max-h-52 rounded object-cover" />}<input id={`upload-${key}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { upload(e.target.files?.[0], key); e.target.value = ''; }} /></div>;
  }
  const panel = 'bg-white border border-stone-200 rounded-lg p-6 mb-6 shadow-sm';
  return <main className="min-h-screen bg-[#faf8f3] text-[#24352e] px-5 py-10"><div className="max-w-3xl mx-auto"><div className="flex flex-wrap gap-5 mb-8 text-sm"><Link href="/admin" className="underline">← Administrasjon</Link><Link href="/om-meg" className="underline">Se Om meg</Link></div><h1 className="font-serif text-4xl mb-8">Rediger Om meg</h1>
    {!supabase ? <p>Supabase er ikke konfigurert.</p> : loading ? <p>Kontrollerer tilgang …</p> : !session ? <p>Logg inn på <Link href="/admin" className="underline">administrasjonssiden</Link> først.</p> : !allowed ? <p>Denne kontoen har ikke administratorrettigheter.</p> : <>
      <section className={panel}><h2 className="font-serif text-2xl mb-5">Åpning</h2>{field('Overtekst', 'eyebrow')}{field('Hovedtittel', 'title', true)}{field('Introduksjon', 'lead', true)}{imageField('Stort hovedbilde', 'hero_image')}</section>
      <section className={panel}><h2 className="font-serif text-2xl mb-5">Min historie</h2>{field('Tittel', 'story_title')}<label className="block text-sm font-medium mb-5">Historie (tom linje mellom avsnitt)<textarea className="mt-2 w-full rounded border border-stone-300 p-3 min-h-72 text-base" value={Array.isArray(content.story) ? content.story.join('\n\n') : ''} onChange={e => updateStory(e.target.value)} /></label>{imageField('Bilde til historien', 'story_image')}</section>
      <section className={panel}><h2 className="font-serif text-2xl mb-5">Erfaring og engasjement</h2>{(content.areas || []).map((area, i) => <div key={i} className="border-t border-stone-200 pt-5 mt-5"><label className="block text-sm font-medium mb-4">Tittel {i + 1}<input className="mt-2 w-full rounded border border-stone-300 p-3 text-base" value={area.title} onChange={e => updateArea(i, 'title', e.target.value)} /></label><label className="block text-sm font-medium">Beskrivelse<textarea className="mt-2 w-full rounded border border-stone-300 p-3 min-h-24 text-base" value={area.description} onChange={e => updateArea(i, 'description', e.target.value)} /></label></div>)}</section>
      <section className={panel}><h2 className="font-serif text-2xl mb-5">Natur og fritid</h2>{field('Tittel', 'nature_title')}{field('Tekst', 'nature_text', true)}{imageField('Naturbilde', 'nature_image')}</section>
      <section className={panel}><h2 className="font-serif text-2xl mb-5">Veien videre</h2>{field('Tittel', 'closing_title')}{field('Tekst', 'closing_text', true)}</section>
      <button type="button" disabled={busy} onClick={save} className="rounded bg-[#173a34] text-white px-7 py-4 disabled:opacity-50">{busy ? 'Arbeider …' : 'Lagre Om meg'}</button>
    </>}{status && <p role="status" className="mt-5 p-4 bg-[#eaece4] rounded">{status}</p>}</div></main>;
}
