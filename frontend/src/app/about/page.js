import { pageMetadata } from '@/lib/locales';
import AboutPage from '@/components/pages/about-page';

export const metadata = pageMetadata('en', 'about');

export default function EnglishAboutPage() {
  return <AboutPage locale="en" />;
}
