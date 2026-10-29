# Redigerbar «Om meg»-side

1. Supabase → SQL Editor → New query. Kjør:

```sql
INSERT INTO public.site_content (id, content)
VALUES (2, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
```

Dette oppretter en tom rad for «Om meg». Den eksisterende siden bruker allerede `aboutDefaults` fra `src/lib/about-content.js`, så den vil vise de opprinnelige tekstene til du lagrer fra admin. Ingen eksisterende innhold blir overskrevet.

2. Kopier `src/app/admin/om-meg/page.js` fra pakken til `frontend/src/app/admin/om-meg/page.js`. Lag mappene om nødvendig.
3. Start Next.js (`npm run dev`) fra `frontend`.
4. Logg inn på `http://localhost:3000/admin` med eksisterende adminbruker, og åpne `http://localhost:3000/admin/om-meg`.
5. Rediger tekst, last opp bilder og trykk «Lagre Om meg». Kontroller på `http://localhost:3000/om-meg`.

Ingen nye miljøvariabler eller administratorrettigheter kreves. Bildene bruker eksisterende Supabase-bucket `site-images`.

**Merk:** Innholdet lagres når du trykker «Lagre Om meg». Bildeopplasting lagrer selve filen umiddelbart, men publiserer ikke bilde-URL-en før du lagrer siden. Ikke legg ut private/sensitive bilder i denne offentlige bilde-bucketen.

**Sikkerhet:** Admin-siden kontrollerer innlogging og adminstatus i brukergrensesnittet. Supabase RLS er den egentlige tilgangskontrollen. Den eksisterende UPDATE-policyen for `site_content` må fortsatt være aktiv, og `admin_users` må ikke ha åpne INSERT-policyer.

**Valgfritt:** Legg til `<a href="/admin/om-meg">Rediger Om meg</a>` i `frontend/src/app/admin/page.js` inne i den innloggede administratorvisningen for enklere navigasjon.
