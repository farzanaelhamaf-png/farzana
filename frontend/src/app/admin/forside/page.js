'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { defaults } from '@/lib/content';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(defaults);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    async function sync(nextSession) {
      if (!mounted) return;
      setSession(nextSession);
      setAllowed(false);
      if (!nextSession) return;
      const { data: role, error: roleError } = await supabase.from('admin_users').select('user_id').eq('user_id', nextSession.user.id).maybeSingle();
      if (!mounted) return;
      if (roleError || !role) { setStatus('Denne kontoen har ikke administratortilgang.'); return; }
      setAllowed(true);
      const { data } = await supabase.from('site_content').select('content').eq('id', 1).single();
      if (mounted && data?.content) setContent({ ...defaults, ...data.content });
    }
    supabase.auth.getSession().then(({ data }) => sync(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => { setTimeout(() => sync(next), 0); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function signIn(e) {
    e.preventDefault(); setStatus('Logger inn …');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatus(error ? error.message : 'Innlogget. Laster inn tilgang …');
  }
  async function save() {
    setBusy(true); setStatus('Lagrer …');
    const { error } = await supabase.from('site_content').update({ content, updated_at: new Date().toISOString() }).eq('id', 1);
    setStatus(error ? `Kunne ikke lagre: ${error.message}` : 'Lagret! Åpne forsiden og oppdater siden for å se endringene.');
    setBusy(false);
  }
  async function upload(file, callback) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('Velg en bildefil.'); return; }
    if (file.size > 8 * 1024 * 1024) { setStatus('Bildet må være mindre enn 8 MB.'); return; }
    setBusy(true); setStatus('Laster opp bilde …');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('site-images').upload(path, file, { upsert: false, contentType: file.type });
    if (error) setStatus(`Opplasting feilet: ${error.message}`);
    else {
      const { data } = supabase.storage.from('site-images').getPublicUrl(path);
      callback(data.publicUrl);
      setStatus('Bildet er lastet opp. Trykk «Lagre endringer» for å publisere det.');
    }
    setBusy(false);
  }
  function update(key, value) { setContent(prev => ({ ...prev, [key]: value })); }
  function updateSection(index, key, value) {
    setContent(prev => ({ ...prev, sections: prev.sections.map((s, i) => i === index ? { ...s, [key]: value } : s) }));
  }
  function field(label, key, multiline = false) {
    return <div><label htmlFor={key}>{label}</label>{multiline ? <textarea id={key} value={content[key] || ''} onChange={e => update(key, e.target.value)} /> : <input id={key} value={content[key] || ''} onChange={e => update(key, e.target.value)} />}</div>;
  }
  function imageField(label, src, onUpload) {
    return <div><label>{label}</label>{src && <img className="preview" src={src} alt="Forhåndsvisning" />}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={busy} onChange={e => { upload(e.target.files?.[0], onUpload); e.target.value = ''; }} /></div>;
  }
  return <main className="admin-page"><a href="/">← Til nettsiden</a><h1>Administrasjon</h1>
    {!supabase ? <p className="status">Supabase er ikke konfigurert. Legg inn miljøvariablene i frontend/.env.local.</p> : !session ?
      <form className="admin-card" onSubmit={signIn}><h2>Logg inn</h2><label htmlFor="email">E-post</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /><label htmlFor="password">Passord</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /><button type="submit">Logg inn</button></form>
    : !allowed ? <div className="admin-card"><p>Du er logget inn, men kontoen har ikke administratortilgang.</p><button onClick={() => supabase.auth.signOut()}>Logg ut</button></div>
    : <>
      <div className="admin-card"><h2>Forsiden</h2>{field('Nettsidens navn', 'site_name')}{field('Liten overskrift', 'eyebrow')}{field('Hovedoverskrift', 'headline', true)}{field('Introduksjon', 'introduction', true)}{imageField('Hovedbilde (helst bredt landskapsbilde)', content.hero_image, url => update('hero_image', url))}</div>
      <h2>Arbeidsområder</h2><div className="admin-grid">{content.sections.map((item, i) => <div className="admin-card" key={i}><h3>Område {i + 1}</h3><label htmlFor={`title-${i}`}>Tittel</label><input id={`title-${i}`} value={item.title} onChange={e => updateSection(i, 'title', e.target.value)} /><label htmlFor={`desc-${i}`}>Beskrivelse</label><textarea id={`desc-${i}`} value={item.description} onChange={e => updateSection(i, 'description', e.target.value)} /><label htmlFor={`href-${i}`}>Lenke (f.eks. /prosjekter eller #kontakt)</label><input id={`href-${i}`} value={item.href || ''} onChange={e => updateSection(i, 'href', e.target.value)} />{imageField('Bilde', item.image, url => updateSection(i, 'image', url))}</div>)}</div>
      <div className="admin-card"><h2>Sitat og kontakt</h2>{field('Sitat', 'quote', true)}{imageField('Bakgrunnsbilde for sitat', content.quote_image, url => update('quote_image', url))}{field('Kontakt-e-post', 'contact_email')}</div>
      <button disabled={busy} onClick={save}>Lagre endringer</button><button className="danger" onClick={() => supabase.auth.signOut()}>Logg ut</button>
    </>}
    {status && <p className="status" role="status">{status}</p>}
  </main>;
}
