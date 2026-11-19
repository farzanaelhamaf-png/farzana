"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { workDefaults } from "@/lib/work-content";
import { getTranslations } from "@/lib/site-translations";
import { localePath } from "@/lib/locales";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="work-section-heading">
      <span className="work-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default function ArbeidPage({ locale = "no" }) {
  const translated = getTranslations(locale);
  const [content, setContent] = useState(locale === "no" ? workDefaults : translated.work);

  useEffect(() => {
    if (locale !== "no") return;
    let active = true;

    async function loadContent() {
      if (!supabase) {
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", 3)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        console.error(fetchError);
      } else if (data?.content) {
        setContent({
          ...workDefaults,
          ...data.content,
        });
      }

    }

    loadContent();

    return () => {
      active = false;
    };
  }, [locale]);

  const ui = translated.work;
  const path = page => localePath(locale, page);

  const publications = Array.isArray(content.publications)
    ? content.publications
    : [];

  const engagements = Array.isArray(content.engagements)
    ? content.engagements
    : [];

  const media = Array.isArray(content.media)
    ? content.media
    : [];

  return (
    <main className="work-page">
      <SiteHeader locale={locale} currentPage="work" />

      <section className="work-hero">
        <div className="work-hero-content">
          <span className="work-eyebrow">
            {content.eyebrow}
          </span>

          <h1>{content.headline}</h1>

          <p>{content.introduction}</p>
          <div className="work-hero-links">
            <a href="#publikasjoner">{ui.links.explore}</a>
            <a href="#erfaring">{ui.links.experience}</a>
          </div>
        </div>
        <div className="work-hero-decoration" aria-hidden="true">
          <span>01 / 04</span>
          <div />
          <span>{ui.sections.decoration}</span>
        </div>
      </section>

      <section className="work-intro">
        <span className="work-eyebrow">{ui.sections.perspective}</span>
        <p>{content.perspective}</p>
      </section>

      <section className="work-section" id="publikasjoner">
        <SectionHeading
          eyebrow={ui.sections.knowledge}
          title={ui.sections.publications}
          description={ui.sections.publicationsDescription}
        />
        <div className="work-publication-list">
          {publications.map((item, index) => (
            <article className="work-publication" key={item.title}>
              <div className="work-publication-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="work-publication-content">
                <div className="work-meta">
                  <span>{item.category}</span>
                  <span>{item.year}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="work-organization">{item.organization}</p>
                <p>{item.description}</p>
                {item.link && (
                  <a
                    className="work-text-link"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.linkText || ui.links.read} ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="work-quote">
        <span className="work-eyebrow">{ui.sections.motivation}</span>
        <blockquote>
          «{ui.sections.quote}»
        </blockquote>
        <span className="work-quote-signature">
          FARZANA ELHAM KOCHAI
        </span>
      </section>

      <section className="work-section" id="erfaring">
        <SectionHeading
          eyebrow={ui.sections.practice}
          title={ui.sections.experience}
        />
        <div className="work-experience-story">
          <h3>{ui.sections.experienceStoryTitle}</h3>
          {ui.experienceStory.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="work-section work-engagement-section">
        <SectionHeading
          eyebrow={ui.sections.engagement}
          title={ui.sections.engagementTitle}
          description={ui.sections.engagementDescription}
        />
        <div className="work-engagement-grid">
          {engagements.map((item) => (
            <article className="work-engagement-card" key={item.title}>
              <span className="work-eyebrow">{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-text-link"
                >
                  {ui.links.evidence}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="work-section" id="media">
        <SectionHeading
          eyebrow={ui.sections.public}
          title={ui.sections.media}
          description={ui.sections.mediaDescription}
        />
        <div className="work-media-list">
          {media.map((item) => (
            <a
              className="work-media-item"
              key={item.name + item.subject}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="work-media-year">{item.year}</span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.subject}</p>
              </div>
              <span className="work-media-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="work-contact">
        <span className="work-eyebrow">{ui.sections.collaboration}</span>
        <h2>{ui.sections.contactTitle}</h2>
        <p>
          {ui.sections.contactText}
        </p>
        <Link href={path("contact")} className="site-action-button work-contact-button">
          {ui.links.contact}
        </Link>
      </section>

      <SiteFooter locale={locale} currentPage="work" />
    </main>
  );
}
