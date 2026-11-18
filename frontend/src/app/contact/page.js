import { pageMetadata } from '@/lib/locales';
import ContactPage from '@/components/pages/contact-page';

export const metadata = pageMetadata('en', 'contact');

export default function EnglishContactPage() {
  return <ContactPage locale="en" />;
}
