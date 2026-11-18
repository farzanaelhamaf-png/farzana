import { describe, expect, it } from 'vitest';
import { getLocale, localePath, pageFromPath, pageMetadata } from '../src/lib/locales.js';
import { getTranslations } from '../src/lib/site-translations.js';

describe('locale configuration', () => {
  it('defines the requested locales and language directions', () => {
    expect(getLocale('en')).toMatchObject({ lang: 'en', dir: 'ltr' });
    expect(getLocale('no')).toMatchObject({ lang: 'nb-NO', dir: 'ltr' });
    expect(getLocale('fa-af')).toMatchObject({ lang: 'fa-AF', dir: 'rtl' });
    expect(getLocale('ps')).toMatchObject({ lang: 'ps-AF', dir: 'rtl' });
  });

  it('maps each page to its public URL in every language', () => {
    expect(localePath('en', 'home')).toBe('/');
    expect(localePath('no', 'home')).toBe('/no/');
    expect(localePath('fa-af', 'about')).toBe('/fa-af/about');
    expect(localePath('ps', 'contact')).toBe('/ps/contact');
    expect(pageFromPath('/no/arbeid')).toBe('work');
    expect(pageFromPath('/fa-af/contact')).toBe('contact');
  });

  it('generates canonical URLs and all localized hreflang alternatives', () => {
    const metadata = pageMetadata('fa-af', 'about');
    expect(metadata.alternates.canonical).toBe('/fa-af/about');
    expect(metadata.alternates.languages).toEqual({
      'fa-AF': '/fa-af/about',
      en: '/about',
      'nb-NO': '/no/about',
      'ps-AF': '/ps/about',
      'x-default': '/about',
    });
    expect(metadata.title).toContain('دربارهٔ من');
  });

  it('uses the correct Dari name and excludes the incorrect surname everywhere', () => {
    const dariMetadata = pageMetadata('fa-af', 'about');
    const dariTranslations = getTranslations('fa-af');

    expect(dariMetadata.title).toContain('فرزانه الهام کوچی');
    expect(dariTranslations.common.copyright).toContain('فرزانه الهام کوچی');
    expect(JSON.stringify(dariMetadata)).not.toContain('کوهستانی');
    expect(JSON.stringify(dariTranslations)).not.toContain('کوهستانی');
  });

  it('uses accurate Pashto terms for dialogue facilitation and institutions', () => {
    const pashto = getTranslations('ps');

    expect(pashto.home.sections[3].title).toContain('د خبرو اترو اسانتیا');
    expect(pashto.about.areas[2].description).toContain('د خبرو اترو د بهیر د اسانه کولو');
    expect(pashto.work.engagements[1].title).toContain('د خبرو اترو اسانتیا');
    expect(pashto.work.experiences[2].organization).toBe('د کوچیانو خپلواکه عمومي ریاست');
    expect(JSON.stringify(pashto)).not.toContain('اسانتیاوې');
  });

  it('provides translated content and contact topics for every locale', () => {
    for (const locale of ['en', 'no', 'fa-af', 'ps']) {
      const translations = getTranslations(locale);
      expect(translations.home.headline).toBeTruthy();
      expect(translations.about.title).toBeTruthy();
      expect(translations.work.publications.length).toBeGreaterThan(0);
      expect(translations.contact.topics).toHaveLength(5);
    }
  });
});
