
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { workDefaults } from "@/lib/work-content";

const sections = [
  {
    key: "publications",
    title: "Forskning og publikasjoner",
    fields: [
      ["category", "Kategori"],
      ["year", "År"],
      ["title", "Tittel"],
      ["organization", "Institusjon / utgiver"],
      ["description", "Beskrivelse"],
      ["link", "Lenke"],
    ],
  },
  {
    key: "experiences",
    title: "Profesjonell erfaring",
    fields: [
      ["years", "Periode"],
      ["role", "Stilling / rolle"],
      ["organization", "Organisasjon"],
      ["description", "Beskrivelse"],
    ],
  },
  {
    key: "engagements",
    title: "Prosjekter, dialog og engasjement",
    fields: [
      ["year", "År / periode"],
      ["title", "Tittel"],
      ["description", "Beskrivelse"],
      ["link", "Lenke"],
    ],
  },
  {
    key: "media",
    title: "Mediebidrag",
    fields: [
      ["year", "År"],
      ["name", "Medie / publikasjon"],
      ["subject", "Tema"],
      ["link", "Lenke"],
    ],
  },
];

const inputClass =
  "mt-2 w-full rounded border border-stone-300 bg-white p-3 text-base";

export default function WorkAdmin() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [rowExists, setRowExists] = useState(false);
  const [content, setContent] = useState(workDefaults);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      const user = authData?.user;

      if (authError || !user) {
        setLoading(false);
        return;
      }

      setSignedIn(true);

      const { data: role, error: roleError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (roleError || !role) {
        setLoading(false);
        return;
      }

      setAllowed(true);

      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", 3)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setStatus(`Kunne ikke hente innhold: ${error.message}`);
      } else if (!data) {
        setStatus(
          "Innholdsraden med id = 3 mangler i Supabase. Opprett den før du lagrer."
        );
      } else {
        setRowExists(true);
        setContent({
          ...workDefaults,
          ...data.content,
          publications: Array.isArray(data.content?.publications)
            ? data.content.publications
            : workDefaults.publications,
          experiences: Array.isArray(data.content?.experiences)
            ? data.content.experiences
            : workDefaults.experiences,
          engagements: Array.isArray(data.content?.engagements)
            ? data.content.engagements
            : workDefaults.engagements,
          media: Array.isArray(data.content?.media)
            ? data.content.media
            : workDefaults.media,
        });
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  function updateField(key, value) {
    setContent((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function updateItem(section, index, field, value) {
    setContent((previous) => ({
      ...previous,
      [section]: previous[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem(section, fields) {
    const item = Object.fromEntries(
      fields.map(([key]) => [key, ""])
    );

    setContent((previous) => ({
      ...previous,
      [section]: [...previous[section], item],
    }));
  }

  function removeItem(section, index) {
    if (!window.confirm("Vil du fjerne denne oppføringen?")) return;

    setContent((previous) => ({
      ...previous,
      [section]: previous[section].filter((_, i) => i !== index),
    }));
  }

  function moveItem(section, index, direction) {
    setContent((previous) => {
      const items = [...previous[section]];
      const target = index + direction;

      if (target < 0 || target >= items.length) return previous;

      [items[index], items[target]] = [items[target], items[index]];

      return { ...previous, [section]: items };
    });
  }

  async function save() {
    if (!supabase || !allowed || !rowExists) return;

    setBusy(true);
    setStatus("Lagrer …");

    try {
      const { data, error } = await supabase
        .from("site_content")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 3)
        .select("id");

      if (error) {
        setStatus(`Kunne ikke lagre: ${error.message}`);
      } else if (!data?.length) {
        setStatus("Ingen rad ble oppdatert. Kontroller id = 3 og tilgang.");
      } else {
        setStatus("Lagret! Endringene er klare til å vises på Arbeid-siden.");
      }
    } catch (error) {
      setStatus(`En feil oppstod: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  if (!supabase) {
    return <main className="admin-page">Supabase er ikke konfigurert.</main>;
  }

  if (loading) {
    return <main className="admin-page">Kontrollerer tilgang …</main>;
  }

  if (!signedIn) {
    return (
      <main className="admin-page">
        Du må først <Link href="/admin">logge inn</Link>.
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="admin-page">
        Denne kontoen har ikke administratorrettigheter.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] px-5 py-10 text-[#24352e]">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex flex-wrap gap-6 text-sm">
          <Link href="/admin/dashboard" className="underline">
            ← Dashboard
          </Link>
          <Link href="/arbeid" className="underline">
            Se Arbeid
          </Link>
        </nav>

        <p className="text-xs font-bold tracking-[3px] text-[#9b7b4b]">
          FARZANA.NO / ADMINISTRASJON
        </p>

        <h1 className="mb-4 mt-3 font-serif text-4xl">
          Rediger arbeid
        </h1>

        <p className="mb-10 text-stone-600">
          Administrer publikasjoner, erfaring, prosjekter og mediebidrag.
          Husk å lagre når du har gjort endringer.
        </p>

        <section className="admin-card">
          <h2 className="mb-6 font-serif text-2xl">
            Introduksjon
          </h2>

          {[
            ["eyebrow", "Overtekst"],
            ["headline", "Hovedtittel"],
            ["introduction", "Introduksjon"],
            ["perspective", "Perspektiv"],
          ].map(([key, label]) => (
            <label key={key} className="mb-5 block text-sm font-medium">
              {label}
              <textarea
                className={inputClass}
                rows={key === "perspective" ? 5 : 2}
                value={content[key] ?? ""}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </label>
          ))}
        </section>

        {sections.map((section) => (
          <section className="admin-card" key={section.key}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">
                {section.title}
              </h2>
              <span className="text-sm text-stone-500">
                {content[section.key]?.length ?? 0} oppføringer
              </span>
            </div>

            {(content[section.key] || []).map((item, index) => (
              <div
                key={`${section.key}-${index}`}
                className="mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <strong>Oppføring {index + 1}</strong>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy || index === 0}
                      onClick={() => moveItem(section.key, index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={
                        busy ||
                        index === content[section.key].length - 1
                      }
                      onClick={() => moveItem(section.key, index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="danger"
                      disabled={busy}
                      onClick={() => removeItem(section.key, index)}
                    >
                      Fjern
                    </button>
                  </div>
                </div>

                {section.fields.map(([field, label]) => (
                  <label
                    key={field}
                    className="mb-4 block text-sm font-medium"
                  >
                    {label}

                    {field === "description" ? (
                      <textarea
                        className={inputClass}
                        rows={4}
                        value={item[field] ?? ""}
                        onChange={(e) =>
                          updateItem(
                            section.key,
                            index,
                            field,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <input
                        className={inputClass}
                        type={field === "link" ? "url" : "text"}
                        value={item[field] ?? ""}
                        onChange={(e) =>
                          updateItem(
                            section.key,
                            index,
                            field,
                            e.target.value
                          )
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            ))}

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                addItem(section.key, section.fields)
              }
            >
              + Legg til oppføring
            </button>
          </section>
        ))}

        <div className="sticky bottom-4 z-10 rounded-lg border border-stone-200 bg-white/95 p-4 shadow-lg">
          <button
            type="button"
            disabled={busy || !rowExists}
            onClick={save}
            className="rounded bg-[#173a34] px-7 py-3 text-white disabled:opacity-50"
          >
            {busy ? "Lagrer …" : "Lagre Arbeid"}
          </button>

          {status && (
            <p role="status" className="mt-3 text-sm">
              {status}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
