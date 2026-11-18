'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { getTranslations } from '@/lib/site-translations';
import { localePath } from '@/lib/locales';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

function Photo({ src, className = '', children }) {
  return <div className={`photo ${className}`} style={src ? { backgroundImage: `url("${src}")` } : undefined}>{children}</div>;
}

function HeroPhoto({ src }) {
  return <div className="hero-photo">
    {src && <Image src={src} alt="" fill sizes="100vw" priority unoptimized />}
  </div>;
}

function FeaturePhoto({ src, className }) {
  return <div className={`photo ${className}`}>
    {src && <Image src={src} alt="" fill sizes="(max-width: 530px) 100vw, (max-width: 850px) 50vw, 25vw" unoptimized />}
  </div>;
}

export default function Home({ locale = 'en' }) {
  const translated = getTranslations(locale);
  const defaults = translated.home;
  const [content, setContent] = useState(defaults);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_content').select('content').eq('id', 1).single().then(({ data, error }) => {
      if (error || !data?.content) return;
      if (locale === 'no') {
        setContent({ ...defaults, ...data.content });
        return;
      }
      const sharedContent = data.content;
      setContent({
        ...defaults,
        hero_image: sharedContent.hero_image || defaults.hero_image,
        quote_image: sharedContent.quote_image || defaults.quote_image,
        contact_email: sharedContent.contact_email || defaults.contact_email,
        sections: defaults.sections.map((section, index) => ({
          ...section,
          image: sharedContent.sections?.[index]?.image || section.image,
        })),
      });
    });
  }, [defaults, locale]);
  const sections = Array.isArray(content.sections) ? content.sections : defaults.sections;
  const path = page => localePath(locale, page);
  return <div className="homepage">
    <SiteHeader locale={locale} currentPage="home" />
    <main>
      <section id="hjem" className="hero">
        <HeroPhoto src={content.hero_image} />
        <div className="hero-shade" />
        <div className="hero-inner">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.headline}</h1>
          <p className="intro">{content.introduction}</p>
          <div className="actions"><a className="button primary" href={path('work')}>{translated.home.actions.work} <span aria-hidden>→</span></a></div>
        </div>
        {!content.hero_image && <p className="photo-hint">{translated.home.photo_hint}</p>}
      </section>
      <section id="arbeid" className="features" aria-label="Arbeidsområder">
        {sections.map((item, i) => <a className="feature" href={locale === 'no' && item.href === '#kontakt' ? path('contact') : item.href || path('contact')} key={i}>
          <FeaturePhoto src={item.image} className={`feature-photo placeholder-${i % 4}`} />
          <h2>{item.title}</h2><p>{item.description}</p><span className="arrow" aria-hidden>→</span>
        </a>)}
      </section>
      <section id="om" className="quote-section">
        <Photo src={content.quote_image} className="quote-photo" />
        <div className="quote-content"><div className="gold-rule" /><blockquote>“{content.quote}”</blockquote><p>FARZANA ELHAM KOCHAI</p></div>
      </section>
      <section id="kontakt" className="contact"><p className="eyebrow">{translated.home.contact_section.eyebrow}</p><h2>{translated.home.contact_section.title}</h2><p>{translated.home.contact_section.description}</p>{content.contact_email ? <a href={`mailto:${content.contact_email}`}>{content.contact_email} →</a> : <p>{translated.home.contact_section.missingEmail}</p>}</section>
    </main>
    <SiteFooter locale={locale} />
  </div>;
}
