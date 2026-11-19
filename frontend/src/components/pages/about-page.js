'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { aboutDefaults } from '@/lib/about-content';
import { getTranslations } from '@/lib/site-translations';
import { localePath } from '@/lib/locales';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export default function AboutPage({ locale = 'no' }) {
  const translated = getTranslations(locale).about;
  const defaults = locale === 'no' ? aboutDefaults : translated;
  const [content, setContent] = useState(defaults);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_content').select('content').eq('id', 2).maybeSingle().then(({ data, error }) => {
      if (error || !data?.content) return;
      setContent(locale === 'no'
        ? { ...aboutDefaults, ...data.content }
        : { ...translated, hero_image: data.content.hero_image || translated.hero_image, story_image: data.content.story_image || translated.story_image, nature_image: data.content.nature_image || translated.nature_image });
    });
  }, [locale, translated]);
  const labels = translated.labels;
  const path = page => localePath(locale, page);
  const picture = (url, alt, className = '') => url ? <img src={url} alt={alt} className={`w-full h-full object-cover ${className}`} /> : <div aria-label={alt} className={`w-full h-full bg-[var(--brand-natural-sand)] ${className}`} />;
  return <main className="public-page about-page min-h-screen bg-[var(--brand-warm-ivory)] text-[var(--brand-soft-charcoal)]">
    <SiteHeader locale={locale} currentPage="about" />
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      <div className="absolute inset-0">{picture(content.hero_image, labels.imageHero)}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#122c28]/90 via-[#122c28]/35 to-transparent" />
      <div className="relative z-10 max-w-5xl px-6 md:px-14 pb-16 pt-40 text-white">
        <p className="uppercase tracking-[0.25em] text-xs text-[var(--brand-natural-sand)] mb-5">{content.eyebrow}</p>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.08] max-w-4xl">{content.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/90">{content.lead}</p>
      </div>
    </section>
    <section className={`about-story-section max-w-6xl mx-auto px-6 py-20 md:py-28 items-center ${content.story_image ? 'grid md:grid-cols-[1.2fr_0.8fr] gap-12' : ''}`}>
      <div className={content.story_image ? '' : 'max-w-3xl'}><p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-deep-forest)] mb-5">{labels.story}</p><h2 className="font-serif text-4xl md:text-5xl mb-7">{content.story_title}</h2><div className="space-y-5 text-lg leading-8 text-[#4B504D]">{content.story.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></div>
      {content.story_image && <div className="about-story-image h-[460px] rounded-t-[180px] overflow-hidden">{picture(content.story_image, labels.imageStory)}</div>}
    </section>
    <section className="bg-[var(--brand-natural-sand)] py-20 md:py-24"><div className="max-w-6xl mx-auto px-6"><p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-deep-forest)] mb-4">{labels.areas}</p><h2 className="font-serif text-4xl md:text-5xl mb-12">{labels.areasTitle}</h2><div className="grid md:grid-cols-2 gap-5">{content.areas.map((area, i) => <article key={i} className="bg-[var(--brand-warm-ivory)] p-8 md:p-10 rounded-sm"><span className="text-[var(--brand-deep-forest)] text-sm">0{i+1}</span><h3 className="font-serif text-3xl mt-4 mb-4">{area.title}</h3><p className="text-[#4B504D] leading-7">{area.description}</p></article>)}</div></div></section>
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center"><div className="h-[450px] overflow-hidden rounded-sm">{picture(content.nature_image, labels.imageNature)}</div><div><p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-deep-forest)] mb-5">{labels.nature}</p><h2 className="font-serif text-4xl md:text-5xl mb-7">{content.nature_title}</h2><p className="text-lg leading-8 text-[#4B504D]">{content.nature_text}</p></div></section>
    <section className="bg-[var(--brand-warm-ivory)] text-[var(--brand-soft-charcoal)] py-20 md:py-24 text-center px-6"><p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-deep-forest)] mb-5">{labels.closing}</p><h2 className="font-serif text-4xl md:text-5xl max-w-3xl mx-auto leading-tight">{content.closing_title}</h2><p className="max-w-2xl mx-auto mt-7 text-lg leading-8 text-[#4B504D]">{content.closing_text}</p><Link href={path('contact')} className="site-action-button mt-9">{labels.contact}</Link></section>
    <SiteFooter locale={locale} currentPage="about" />
  </main>;
}
