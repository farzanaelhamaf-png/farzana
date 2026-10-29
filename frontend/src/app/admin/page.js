
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        setMessage("Supabase er ikke konfigurert.");
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          router.replace("/admin/dashboard");
          return;
        }
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const { data: admin, error: roleError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (roleError || !admin) {
      await supabase.auth.signOut();
      setMessage("Denne kontoen har ikke administratorrettigheter.");
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
  }

  if (loading) {
    return <main className="admin-page">Kontrollerer innlogging …</main>;
  }

  return (
    <main className="admin-page">
      <h1>Administrasjon</h1>
      <p>Logg inn for å administrere farzana.no.</p>

      <form className="admin-card" onSubmit={handleLogin}>
        <label htmlFor="email">E-post</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Passord</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Logg inn</button>
        {message && <p role="alert">{message}</p>}
      </form>
    </main>
  );
}
