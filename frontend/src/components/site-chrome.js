import Link from 'next/link';
import { localePath } from '@/lib/locales';
import { getTranslations } from '@/lib/site-translations';
import LanguageSwitcher from '@/components/language-switcher';

export function SiteHeader({ locale, currentPage }) {
  const common = getTranslations(locale).common;
  const pages = ['home', 'about', 'work'];

  return (
    <header className="site-header">
      <Link href={localePath(locale, 'home')} className="site-logo">
        farzana.no
      </Link>
      <div className="site-header-controls">
        <nav aria-label={common.navigation}>
          {pages.map(page => (
            <Link
              key={page}
              href={localePath(locale, page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {common[page]}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export function SiteFooter({ locale, currentPage }) {
  const common = getTranslations(locale).common;

  return (
    <footer className="site-footer">
      <span>{common.copyright.replace('{year}', String(new Date().getFullYear()))}</span>
      <nav aria-label={common.navigation} className="site-footer-links">
        <Link href={localePath(locale, 'contact')} aria-current={currentPage === 'contact' ? 'page' : undefined}>
          {common.contact}
        </Link>
        {locale === 'no' && <Link href="/admin">{common.admin}</Link>}
      </nav>
    </footer>
  );
}
