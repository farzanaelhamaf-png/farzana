import './globals.css';
import { headers } from 'next/headers';
import { getLocale, pageMetadata } from '@/lib/locales';
import LanguageSwitcher from '@/components/language-switcher';

export const metadata = {
  metadataBase: new URL('https://farzana.no'),
  ...pageMetadata('en', 'home'),
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const locale = getLocale(requestHeaders.get('x-site-locale')) || getLocale('en');

  return <html lang={locale.lang} dir={locale.dir} data-scroll-behavior="smooth"><body>{children}<LanguageSwitcher /></body></html>;
}
