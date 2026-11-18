import { notFound } from 'next/navigation';
import { getLocale, pageMetadata, pageSlugs } from '@/lib/locales';
import Home from '@/app/page';
import AboutPage from '@/components/pages/about-page';
import WorkPage from '@/components/pages/work-page';
import ContactPage from '@/components/pages/contact-page';

const pages = { about: AboutPage, work: WorkPage, contact: ContactPage };

export function generateStaticParams() {
  return ['no', 'fa-af', 'ps'].flatMap(locale => [
    { locale, slug: [] },
    ...pageSlugs.map(page => ({ locale, slug: [page] })),
  ]);
}

export async function generateMetadata({ params }) {
  const { locale: localeCode, slug = [] } = await params;
  const page = slug[0] || 'home';
  if (!getLocale(localeCode) || (slug.length && !pageSlugs.includes(page))) return {};
  return pageMetadata(localeCode, page);
}

export default async function LocalizedPage({ params }) {
  const { locale: localeCode, slug = [] } = await params;
  const page = slug[0] || 'home';
  if (!getLocale(localeCode) || slug.length > 1 || (page !== 'home' && !pageSlugs.includes(page))) notFound();

  const Page = pages[page] || Home;
  return <Page key={localeCode} locale={localeCode} />;
}
