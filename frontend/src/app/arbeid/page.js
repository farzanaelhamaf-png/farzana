"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { workDefaults } from "@/lib/work-content";

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="work-section-heading">
      <span className="work-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default function ArbeidPage() {
  const [content, setContent] = useState(workDefaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContent() {
      if (!supabase) {
        setError("Supabase er ikke konfigurert.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", 3)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError("Kunne ikke hente oppdatert innhold.");
        console.error(fetchError);
      } else if (data?.content) {
        setContent({
          ...workDefaults,
          ...data.content,
        });
      }

      setLoading(false);
    }

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  const publications = Array.isArray(content.publications)
    ? content.publications
    : [];

  const experiences = Array.isArray(content.experiences)
    ? content.experiences
    : [];

  const engagements = Array.isArray(content.engagements)
    ? content.engagements
    : [];

  const media = Array.isArray(content.media)
    ? content.media
    : [];

  return (
    <main className="work-page">
      <header className="work-nav">
        <Link href="/" className="work-logo">
          farzana.no
        </Link>
        <nav aria-label="Hovedmeny">
          <Link href="/">Hjem</Link>
          <Link href="/om-meg">Om meg</Link>
          <Link href="/arbeid" aria-current="page">
            Arbeid
          </Link>
          <Link href="/kontakt">Kontakt</Link>
        </nav>
      </header>

      <section className="work-hero">
        <div className="work-hero-content">
          <span className="work-eyebrow">
            {content.eyebrow}
          </span>

          <h1>{content.headline}</h1>

          <p>{content.introduction}</p>
          <div className="work-hero-links">
            <a href="#publikasjoner">Utforsk publikasjoner ↓</a>
            <a href="#erfaring">Se erfaring →</a>
          </div>
        </div>
        <div className="work-hero-decoration" aria-hidden="true">
          <span>01 / 04</span>
          <div />
          <span>ARBEID & ENGASJEMENT</span>
        </div>
      </section>

      <section className="work-intro">
        <span className="work-eyebrow">PERSPEKTIV</span>
        <p>{content.perspective}</p>
      </section>

      <section className="work-section" id="publikasjoner">
        <SectionHeading
          eyebrow="01 / KUNNSKAP"
          title="Forskning & publikasjoner"
          description="Akademisk forskning, faglige analyser og bidrag til offentlig kunnskapsutvikling."
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
                    {item.linkText || "Les publikasjonen"} ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="work-quote">
        <span className="work-eyebrow">DET SOM DRIVER MEG</span>
        <blockquote>
          «Kunnskap får verdi når den bidrar til forståelse,
          deltakelse og muligheten til å skape endring.»
        </blockquote>
        <span className="work-quote-signature">
          FARZANA ELHAM KOCHAI
        </span>
      </section>

      <section className="work-section" id="erfaring">
        <SectionHeading
          eyebrow="02 / PRAKSIS"
          title="Profesjonell erfaring"
          description="Arbeid med politikk, utvikling, institusjoner og sivilsamfunn."
        />
        <div className="work-timeline">
          {experiences.map((item) => (
            <article className="work-timeline-item" key={item.role + item.years}>
              <span className="work-timeline-year">{item.years}</span>
              <div>
                <h3>{item.role}</h3>
                <p className="work-organization">{item.organization}</p>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="work-section work-engagement-section">
        <SectionHeading
          eyebrow="03 / ENGASJEMENT"
          title="Dialog, menneskerettigheter & samfunn"
          description="Foredrag, fasilitering og engasjement i Norge og internasjonalt."
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
                  Se dokumentasjon ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="work-section" id="media">
        <SectionHeading
          eyebrow="04 / I OFFENTLIGHETEN"
          title="Intervjuer & mediebidrag"
          description="Utvalgte intervjuer og omtaler om politikk, demokrati og menneskerettigheter."
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
        <span className="work-eyebrow">SAMARBEID</span>
        <h2>Har du en idé vi kan utvikle sammen?</h2>
        <p>
          Jeg er interessert i samarbeid innen forskning,
          menneskerettigheter, samfunnsutvikling, foredrag og dialog.
        </p>
        <Link href="/kontakt" className="work-contact-button">
          Ta kontakt ↗
        </Link>
      </section>

      <footer className="work-footer">
        <span>© {new Date().getFullYear()} Farzana Elham Kochai</span>
        <Link href="/">Til forsiden ↑</Link>
      </footer>
    </main>
  );
}
