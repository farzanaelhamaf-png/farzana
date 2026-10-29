# farzana.no – installasjon

Dette er en startpakke som legges **oppå** et eksisterende Next.js-prosjekt med App Router, JavaScript, Tailwind og `src/`-mappe. Den er ikke et selvstendig Next.js-prosjekt.

## 1. Kopier filer

Pakk ut ZIP-filen. Kopier `src/`-mappen fra pakken til `farzana.no/frontend/src/` og tillat erstatning av `app/page.js`, `app/layout.js` og `app/globals.css`. Andre filer i `frontend/` beholdes. SQL-filen er bare til oppsett i Supabase.

## 2. Installer Supabase-klienten

```bash
cd ~/farzana.no/frontend
npm install @supabase/supabase-js
```

## 3. Miljøvariabler

Opprett `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ulkksgetydtritfdxdfb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=DIN_SUPABASE_PUBLISHABLE_KEY
```

Finn publishable key i Supabase > Project Settings > API Keys. Bruk **aldri** secret/service_role key i `NEXT_PUBLIC_...`.

## 4. Database og bildeopplasting

Åpne Supabase > SQL Editor og kjør `supabase/setup.sql` én gang. Ikke kjør samme SQL flere ganger uten å tilpasse policy-opprettelsen.

I Supabase > Authentication > Users: opprett Farzanas bruker med e-post og et sterkt passord. Kopier **User UID**. I SQL Editor, kjør:

```sql
insert into public.admin_users (user_id)
values ('SETT-INN-FAKTISK-UUID');
```

Brukerens UID er ikke et passord. Ikke legg passord i kode eller dokumentasjon. Deaktiver gjerne offentlig registrering i Supabase Auth Settings når adminbrukeren er opprettet.

## 5. Start

```bash
npm run dev
```

Åpne http://localhost:3000 for forsiden og http://localhost:3000/admin for administrasjon. Last opp bilder og klikk **Lagre endringer**.

## 6. Publisering

Commit og push endringene til GitHub. I Vercel må **Root Directory** være `frontend`, og de to `NEXT_PUBLIC_...` miljøvariablene må legges inn under Project Settings > Environment Variables. Deploy på nytt etter at variablene er lagt til.

## Viktige merknader

- Dette er en **første versjon** med redigerbar forside og fire kort. Menylenkene til Arbeid, Publikasjoner og Prosjekter går foreløpig til samme seksjon. Vi kan bygge egne undersider senere.
- Ingen bilder av Farzana er inkludert. Bildeplassholdere vises frem til hun laster opp egne bilder.
- Bildene lagres i en offentlig Supabase Storage-bucket, slik at de kan vises på en offentlig nettside. Ikke last opp private eller sensitive bilder.
- Administratorautorisasjon håndheves av Supabase RLS, ikke bare av grensesnittet.
- Nettstedet bruker norsk som standardspråk. Engelsk språkversjon kan legges til senere.
