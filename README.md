# farzana.no

Personal website, portfolio and digital platform for Farzana.

**Project status:** Initial setup  
**Started:** October 2026  
**Version:** 0.1.0  
**Primary language:** JavaScript  
**Database:** Supabase PostgreSQL

---

## About the project

**farzana.no** is being developed as a personal website and an expandable digital platform.

The initial goal is to create a professional online presence showcasing Farzana's background, experience, publications, projects and public engagements.

Over time, the platform may also support research, surveys, data collection, contact management and other digital tools.

The project follows a simple principle:

**Start small, keep costs low, and build a foundation that can grow.**

## Planned features

### Phase 1 — Public website

- [ ] Homepage and introduction
- [ ] About and professional background
- [ ] Portfolio and projects
- [ ] Publications and research
- [ ] Public speaking and media appearances
- [ ] Contact information
- [ ] Responsive design for mobile and desktop
- [ ] Basic search engine optimization (SEO)

### Phase 2 — Content management

- [ ] Supabase integration
- [ ] Secure administrator login
- [ ] Manage projects and publications
- [ ] Upload images and documents
- [ ] Update website content without modifying code

### Phase 3 — Data collection

- [ ] Custom forms and surveys
- [ ] Public form links
- [ ] Secure response storage
- [ ] Data management dashboard
- [ ] CSV export
- [ ] Email invitations and notifications
- [ ] Privacy and consent management

### Phase 4 — Future expansion

Potential features include research tools, Python-based data analysis, event registration, booking and professional services.

These features are not part of the initial release.

## Technology stack

| Component | Technology | Status |
|---|---|---|
| Frontend | Next.js | Planned |
| Language | JavaScript | Selected |
| Styling | Tailwind CSS | Planned |
| Database | Supabase PostgreSQL | Project created |
| Authentication | Supabase Auth | Planned |
| File storage | Supabase Storage | Planned |
| Hosting | Vercel | Planned |
| Version control | Git / GitHub | Setup in progress |
| Python | Data processing and analysis | Optional, future |

The initial implementation will use JavaScript rather than TypeScript.

A separate Python backend is not currently required.

## Architecture

The planned architecture is:

```text
                    Visitors
                       |
                       v
                  farzana.no
                       |
                       v
              Next.js Application
                Hosted on Vercel
                       |
              +--------+--------+
              |                 |
              v                 v
         Public Website    Admin Dashboard
              |                 |
              +--------+--------+
                       |
                       v
                    Supabase
              +--------+--------+
              |        |        |
           Database   Auth    Storage
```

Next.js will handle the frontend and application logic.

Supabase will provide persistent data storage, authentication and related backend services.

Python may be introduced later for data analysis, automation or specialized processing.

## Infrastructure

### Domain

**Domain:** `farzana.no`  
**Registrar / DNS provider:** Uniweb  
**Management:** https://home.uniweb.no/

DNS settings will be configured when the frontend deployment is ready.

### Supabase

**Provider:** https://supabase.com/  
**Plan:** Free  
**Project reference:** `ulkksgetydtritfdxdfb`

**Project URL:**

```text
https://ulkksgetydtritfdxdfb.supabase.co
```

This URL is the Supabase API endpoint, not the public website.

The free plan provides a PostgreSQL database with a 500 MB database size limit, subject to Supabase's current plan conditions.

### Frontend hosting

**Planned provider:** Vercel

The initial non-commercial development phase is intended to use Vercel's free Hobby plan.

If the website later supports commercial services, the hosting plan must be reviewed for compliance with Vercel's terms.

## Getting started

The following instructions describe the planned local development setup once the Next.js project has been created.

### 1. Prerequisites

Install:

- Git
