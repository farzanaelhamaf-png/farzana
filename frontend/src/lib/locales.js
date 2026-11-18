export const locales = [
  { code: 'fa-af', hreflang: 'fa-AF', label: 'Dari', lang: 'fa-AF', dir: 'rtl' },
  { code: 'en', hreflang: 'en', label: 'English', lang: 'en', dir: 'ltr' },
  { code: 'no', hreflang: 'nb-NO', label: 'Norsk', lang: 'nb-NO', dir: 'ltr' },
  { code: 'ps', hreflang: 'ps-AF', label: 'Pashto', lang: 'ps-AF', dir: 'rtl' },
];

export const pageSlugs = ['about', 'work', 'contact'];

export function getLocale(code) {
  return locales.find(locale => locale.code === code);
}

export function pageFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const localeOffset = getLocale(parts[0]) ? 1 : 0;
  const slug = parts[localeOffset];
  if (slug === 'om-meg') return 'about';
  if (slug === 'arbeid') return 'work';
  if (slug === 'kontakt') return 'contact';
  return pageSlugs.includes(slug) ? slug : 'home';
}

export function localePath(locale, page) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return page === 'home' ? (prefix ? `${prefix}/` : '/') : `${prefix}/${page}`;
}

export function pageMetadata(locale, page) {
  const content = siteMetadata[locale] || siteMetadata.en;
  const pageContent = content[page] || content.home;
  const languages = Object.fromEntries(
    locales.map(item => [item.hreflang, localePath(item.code, page)]),
  );
  languages['x-default'] = localePath('en', page);

  return {
    title: pageContent.title,
    description: pageContent.description,
    alternates: {
      canonical: localePath(locale, page),
      languages,
    },
    openGraph: {
      title: pageContent.title,
      description: pageContent.description,
      locale: getLocale(locale)?.lang || 'en',
      type: 'website',
    },
  };
}

export const siteMetadata = {
  en: {
    home: {
      title: 'Farzana Elham Kochai | Human rights, policy and dialogue',
      description: 'Human rights, public policy, research and dialogue for a more inclusive society.',
    },
    about: {
      title: 'About | Farzana Elham Kochai',
      description: 'Learn about Farzana Elham Kochai’s journey, experience and work.',
    },
    work: {
      title: 'Work and publications | Farzana Elham Kochai',
      description: 'Research, publications, professional experience and dialogue initiatives.',
    },
    contact: {
      title: 'Contact | Farzana Elham Kochai',
      description: 'Get in touch about research, collaboration, speaking and dialogue.',
    },
  },
  no: {
    home: {
      title: 'Farzana Elham Kochai | Mennesker, samfunn og muligheter',
      description: 'Menneskerettigheter, offentlig politikk, forskning og dialog.',
    },
    about: { title: 'Om meg | Farzana Elham Kochai', description: 'Les om Farzana Elham Kochais bakgrunn, erfaring og arbeid.' },
    work: { title: 'Arbeid og publikasjoner | Farzana Elham Kochai', description: 'Forskning, publikasjoner, erfaring og dialogarbeid.' },
    contact: { title: 'Kontakt | Farzana Elham Kochai', description: 'Ta kontakt om forskning, samarbeid, foredrag og dialog.' },
  },
  'fa-af': {
    home: { title: 'فرزانه الهام کوهستانی | حقوق بشر، سیاست و گفتگو', description: 'حقوق بشر، سیاست‌گذاری عمومی، پژوهش و گفتگو برای جامعه‌ای فراگیرتر.' },
    about: { title: 'درباره من | فرزانه الهام کوهستانی', description: 'با مسیر زندگی، تجربه‌ها و فعالیت‌های فرزانه الهام کوهستانی آشنا شوید.' },
    work: { title: 'فعالیت‌ها و نوشته‌ها | فرزانه الهام کوهستانی', description: 'پژوهش، نوشته‌ها، تجربه‌های حرفه‌ای و برنامه‌های گفتگو.' },
    contact: { title: 'تماس | فرزانه الهام کوهستانی', description: 'برای پژوهش، همکاری، سخنرانی و گفتگو با من تماس بگیرید.' },
  },
  ps: {
    home: { title: 'فرزانه الهام کوچی | بشري حقونه، سیاست او خبرې اترې', description: 'د یوې ټولشموله ټولنې لپاره بشري حقونه، عامه پالیسي، څېړنه او خبرې اترې.' },
    about: { title: 'زما په اړه | فرزانه الهام کوچی', description: 'د فرزانه الهام کوچۍ له ژوند، تجربو او کار سره اشنا شئ.' },
    work: { title: 'کار او خپرونې | فرزانه الهام کوچی', description: 'څېړنه، خپرونې، مسلکي تجربه او د خبرو اترو نوښتونه.' },
    contact: { title: 'اړیکه | فرزانه الهام کوچی', description: 'د څېړنې، همکارۍ، ویناوو او خبرو اترو لپاره اړیکه ونیسئ.' },
  },
};
