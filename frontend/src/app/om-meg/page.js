'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { aboutDefaults } from '@/lib/about-content';

export default function AboutPage() {
  const [content, setContent] = useState(aboutDefaults);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_content').select('content').eq('id', 2).maybeSingle().then(({ data, error }) => {
      if (!error && data?.content) setContent({ ...aboutDefaults, ...data.content });
    });
  }, []);
  const picture = (url, alt, className = '') => url ? <img src={url} alt={alt} className={`w-full h-full object-cover ${className}`} /> : <div aria-label={alt} className={`w-full h-full bg-gradient-to-br from-[#8e9a87] via-[#d4c5a6] to-[#536c6a] ${className}`} />;
  return <main className="min-h-screen bg-[#faf8f3] text-[#24352e]">
    <header className="flex items-center justify-between px-6 md:px-14 py-6 border-b border-[#e9e5da] bg-[#faf8f3]">
      <Link href="/" className="font-serif text-2xl tracking-tight">farzana.no</Link>
      <nav className="flex gap-5 text-sm"><Link href="/">Hjem</Link><Link href="/om-meg" className="font-semibold">Om meg</Link><Link href="/#kontakt">Kontakt</Link></nav>
    </header>
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      <div className="absolute inset-0">{picture(content.hero_image, 'Farzana i fjellandskap')}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#122c28]/90 via-[#122c28]/35 to-transparent" />
      <div className="relative z-10 max-w-5xl px-6 md:px-14 pb-16 pt-40 text-white">
        <p className="uppercase tracking-[0.25em] text-xs text-[#ead6ac] mb-5">{content.eyebrow}</p>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.08] max-w-4xl">{content.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/90">{content.lead}</p>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
      <div><p className="text-xs uppercase tracking-[0.2em] text-[#92764e] mb-5">Min historie</p><h2 className="font-serif text-4xl md:text-5xl mb-7">{content.story_title}</h2><div className="space-y-5 text-lg leading-8 text-[#45554d]">{content.story.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></div>
      <div className="h-[460px] rounded-t-[180px] overflow-hidden">{picture(content.story_image, 'Farzana sammen med mennesker')}</div>
    </section>
    <section className="bg-[#eaece4] py-20 md:py-24"><div className="max-w-6xl mx-auto px-6"><p className="text-xs uppercase tracking-[0.2em] text-[#92764e] mb-4">Erfaring og engasjement</p><h2 className="font-serif text-4xl md:text-5xl mb-12">Det som former arbeidet mitt</h2><div className="grid md:grid-cols-2 gap-5">{content.areas.map((area, i) => <article key={i} className="bg-[#faf8f3] p-8 md:p-10 rounded-sm"><span className="text-[#9b7d4b] text-sm">0{i+1}</span><h3 className="font-serif text-3xl mt-4 mb-4">{area.title}</h3><p className="text-[#526158] leading-7">{area.description}</p></article>)}</div></div></section>
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center"><div className="h-[450px] overflow-hidden rounded-sm">{picture(content.nature_image, 'Farzana på tur i norsk natur')}</div><div><p className="text-xs uppercase tracking-[0.2em] text-[#92764e] mb-5">Utenfor arbeidslivet</p><h2 className="font-serif text-4xl md:text-5xl mb-7">{content.nature_title}</h2><p className="text-lg leading-8 text-[#45554d]">{content.nature_text}</p></div></section>
    <section className="bg-[#173a34] text-white py-20 md:py-24 text-center px-6"><p className="text-xs uppercase tracking-[0.2em] text-[#e0c48f] mb-5">Veien videre</p><h2 className="font-serif text-4xl md:text-5xl max-w-3xl mx-auto leading-tight">{content.closing_title}</h2><p className="max-w-2xl mx-auto mt-7 text-lg leading-8 text-white/80">{content.closing_text}</p><Link href="/#kontakt" className="inline-block mt-9 border border-[#e0c48f] text-[#f2dfba] px-8 py-3 hover:bg-white/10">Ta kontakt →</Link></section>
    <footer className="px-6 md:px-14 py-7 flex justify-between text-sm bg-[#faf8f3]"><span>© {new Date().getFullYear()} Farzana Elham Kochai</span><Link href="/">Til forsiden ↑</Link></footer>
  </main>;
}
