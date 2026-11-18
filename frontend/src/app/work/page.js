import { pageMetadata } from '@/lib/locales';
import WorkPage from '@/components/pages/work-page';

export const metadata = pageMetadata('en', 'work');

export default function EnglishWorkPage() {
  return <WorkPage locale="en" />;
}
