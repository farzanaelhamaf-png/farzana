'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { defaults } from '@/lib/content';

function Photo({ src, className = '', children }) {
  return <div className={`photo ${className}`} style={src ? { backgroundImage: `url("${src}")` } : undefined}>{children}</div>;
}

export default function Home() {
  const [content, setContent] = useState(defaults);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_content').select('content').eq('id', 1).single().then(({ data, error }) => {
      if (!error && data?.content) setContent({ ...defaults, ...data.content });
    });
  }, []);
  const sections = Array.isArray(content.sections) ? content.sections : defaults.sections;
  return <>
    <header className="topbar">
      <a className="wordmark" href="#hjem">{content.site_name}</a>
      <nav aria-label="Hovedmeny"><a href="#hjem">Hjem</a><a href="/om-meg">Om meg</a><a href="#arbeid">Arbeid</a><a href="#arbeid">Publikasjoner</a><a href="#arbeid">Prosjekter</a><a href="#kontakt">Kontakt</a></nav>
      <a className="admin-link" href="/admin">Admin</a>
    </header>
    <main>
      <section id="hjem" className="hero">
        <Photo src={content.hero_image} className="hero-photo" />
        <div className="hero-shade" />
        <div className="hero-inner">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.headline}</h1>
          <p className="intro">{content.introduction}</p>
          <div className="actions"><a className="button primary" href="#arbeid">Utforsk mitt arbeid <span aria-hidden>→</span></a><a className="button outline" href="/om-meg">Om meg</a></div>
        </div>
        {!content.hero_image && <p className="photo-hint">Hovedbildet kan legges til i administrasjonspanelet</p>}
      </section>
      <section id="arbeid" className="features" aria-label="Arbeidsområder">
        {sections.map((item, i) => <a className="feature" href={item.href || '#kontakt'} key={i}>
          <Photo src={item.image} className={`feature-photo placeholder-${i % 4}`} />
          <h2>{item.title}</h2><p>{item.description}</p><span className="arrow" aria-hidden>→</span>
        </a>)}
      </section>
      <section id="om" className="quote-section">
        <Photo src={content.quote_image} className="quote-photo" />
        <div className="quote-content"><div className="gold-rule" /><blockquote>“{content.quote}”</blockquote><p>FARZANA ELHAM KOCHAI</p></div>
      </section>
      <section id="kontakt" className="contact"><p className="eyebrow">KONTAKT</p><h2>La oss skape nye forbindelser.</h2><p>For samarbeid, forskning, samtaler og prosjekter.</p>{content.contact_email ? <a href={`mailto:${content.contact_email}`}>{content.contact_email} →</a> : <p>Kontaktinformasjon kommer snart.</p>}</section>
    </main>
    <footer><span>© {new Date().getFullYear()} Farzana Elham Kochai</span><a href="/admin">Administrasjon</a></footer>
  </>;
}
