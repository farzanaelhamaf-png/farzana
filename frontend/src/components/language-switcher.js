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
    <label className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-stone-300 bg-white/95 px-3 py-2 text-sm text-stone-800 shadow-lg">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="cursor-pointer bg-transparent outline-none"
        value={currentLocale}
        onChange={changeLanguage}
        dir="ltr"
      >
        {locales.map(locale => <option key={locale.code} value={locale.code}>{locale.label}</option>)}
      </select>
    </label>
  );
}
