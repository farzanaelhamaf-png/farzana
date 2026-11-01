
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const pages = [
  {
    title: "Forside",
    description: "Endre hovedbilde, introduksjon og arbeidsområder.",
    icon: "⌂",
    href: "/admin/forside",
    status: "Klar",
  },
  {
    title: "Om meg",
    description: "Rediger personlig historie, erfaringer og fotografier.",
    icon: "◉",
    href: "/admin/om-meg",
    status: "Klar",
  },
  {
    title: "Forskning og publikasjoner",
    description: "Masteroppgave, forskningsrapporter og artikler.",
    icon: "▤",
    href: "/admin/arbeid",
    status: "Klar",
  },
  {
    title: "Prosjekter",
    description: "Vis frem prosjekter, samarbeid og aktiviteter.",
    icon: "◇",
    href: null,
    status: "Kommer",
  },
];

export default function AdminDashboard() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      return;
    }

    async function checkAccess() {
      const { data: { user }, error } =
        await supabase.auth.getUser();

      if (error || !user) {
        setStatus("unauthorized");
        return;
      }

      const { data, error: roleError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      setStatus(!roleError && data ? "ready" : "unauthorized");
    }

    checkAccess();
  }, []);

  if (status === "loading") {
    return <main className="dashboard-message">Kontrollerer tilgang …</main>;
  }

  if (status !== "ready") {
    return (
      <main className="dashboard-message">
        <h1>Ingen administratortilgang</h1>
        <p>Logg inn med en godkjent administratorkonto.</p>
        <Link href="/admin">Gå til innlogging</Link>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">FARZANA.NO</p>
          <h1>Administrasjon</h1>
          <p>Velkommen! Her kan du administrere nettsidens innhold.</p>
        </div>
        <Link href="/" className="dashboard-view">
          Se nettsiden ↗
        </Link>
      </header>

      <section className="dashboard-intro">
        <h2>Nettsidens innhold</h2>
        <p>Velg siden du ønsker å redigere.</p>
      </section>

      <section className="dashboard-grid">
        {pages.map((page) => {
          const inner = (
            <>
              <div className="dashboard-card-top">
                <span className="dashboard-icon">{page.icon}</span>
                <span className="dashboard-status">{page.status}</span>
              </div>
              <h3>{page.title}</h3>
              <p>{page.description}</p>
              <span className="dashboard-action">
                {page.href ? "Rediger siden →" : "Under utvikling"}
              </span>
            </>
          );

          return page.href ? (
            <Link className="dashboard-card" href={page.href} key={page.title}>
              {inner}
            </Link>
          ) : (
            <div className="dashboard-card dashboard-disabled" key={page.title}>
              {inner}
            </div>
          );
        })}
      </section>
    </main>
  );
}
