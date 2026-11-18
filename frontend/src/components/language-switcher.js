'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocale, localePath, locales, pageFromPath } from '@/lib/locales';
import { getTranslations } from '@/lib/site-translations';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocale(pathname.split('/').filter(Boolean)[0])?.code || 'en';
  const label = getTranslations(currentLocale).common.language;

  useEffect(() => {
    const locale = getLocale(currentLocale);
    document.documentElement.lang = locale.lang;
    document.documentElement.dir = locale.dir;
  }, [currentLocale]);

  function changeLanguage(event) {
    const locale = event.target.value;
    router.push(localePath(locale, pageFromPath(pathname)));
  }

  return (
    <label className="language-switcher flex min-h-14 w-full items-center justify-end border-b border-[var(--brand-natural-sand)] bg-[var(--brand-warm-ivory)] px-[clamp(20px,7vw,130px)] py-2 text-[var(--brand-soft-charcoal)]">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="cursor-pointer rounded-md border border-[var(--brand-natural-sand)] bg-[var(--brand-warm-ivory)] px-3 py-2 text-sm text-[var(--brand-soft-charcoal)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-deep-forest)]"
        value={currentLocale}
        onChange={changeLanguage}
        dir="ltr"
      >
        {locales.map(locale => <option key={locale.code} value={locale.code}>{locale.label}</option>)}
      </select>
    </label>
  );
}
