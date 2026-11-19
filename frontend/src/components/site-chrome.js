import Link from 'next/link';
import { localePath } from '@/lib/locales';
import { getTranslations } from '@/lib/site-translations';
import LanguageSwitcher from '@/components/language-switcher';

function SocialIcon({ platform }) {
  const iconProps = {
    'aria-hidden': true,
    viewBox: '0 0 24 24',
    width: 22,
    height: 22,
  };

  if (platform === 'facebook') {
    return (
      <svg {...iconProps}>
        <path fill="currentColor" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.017 1.792-4.688 4.533-4.688 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.956.93-1.956 1.885v2.278h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073z" />
      </svg>
    );
  }

  if (platform === 'x') {
    return (
      <svg {...iconProps}>
        <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19 9.46 12.504h-7.406l-5.8-7.584-6.64 7.584h-3.68l8.6-9.83L.99 1.153h7.594l5.24 6.932 6.077-6.932zm-1.29 19.49h2.039L7.57 3.24H5.38l12.23 17.403z" />
      </svg>
    );
  }

  if (platform === 'instagram') {
    return (
      <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path fill="currentColor" d="M5.2 7.3a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM3.4 9h3.6v11.6H3.4zM9.2 9h3.4v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.4v6.5H17v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.9H9.2z" />
    </svg>
  );
}

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
  const socialLinks = [
    { label: common.facebookPage, platform: 'facebook', href: 'https://www.facebook.com/FarzanaElhamaf/' },
    { label: 'X', platform: 'x', href: 'https://x.com/Farzanakochai' },
    { label: 'Instagram', platform: 'instagram', href: 'https://www.instagram.com/farzanaelhamkochai/' },
    { label: 'LinkedIn', platform: 'linkedin', href: 'https://www.linkedin.com/in/farzanaelhamkochai/' },
  ];

  return (
    <footer className="site-footer">
      <span>{common.copyright.replace('{year}', String(new Date().getFullYear()))}</span>
      <div className="site-footer-social">
        <span>{common.socialLabel}</span>
        <nav aria-label={common.socialLinks} className="site-footer-social-links">
          {socialLinks.map(({ label, platform, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              title={label}
              target="_blank"
              rel="noopener noreferrer"
              className="site-social-link"
            >
              <SocialIcon platform={platform} />
            </a>
          ))}
        </nav>
      </div>
      <nav aria-label={common.navigation} className="site-footer-links">
        <Link href={localePath(locale, 'contact')} aria-current={currentPage === 'contact' ? 'page' : undefined}>
          {common.contact}
        </Link>
        {locale === 'no' && <Link href="/admin">{common.admin}</Link>}
      </nav>
    </footer>
  );
}
