This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server: 

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tests

Start the app locally in Docker and open http://localhost:3000:

```bash
docker compose up --build
```

The app runs without Supabase credentials using its default content. To test
features that need Supabase, provide local development credentials through
Next.js' `.env.local` file; Compose passes the file into the app container
without copying it into the image. Restart the app after editing the file.
The Compose setup does not start a Supabase server.

Install the Playwright browser once, then run the API and browser tests:

```bash
npx playwright install chromium
npm test
```

The browser tests use mocked Supabase and Turnstile services; they do not need
production credentials or modify real content. To run the same suite in Docker:

```bash
docker compose -f compose.test.yaml run --build --rm test
```

The suite covers contact API validation and message delivery, public pages,
administrator access, content editing, thumbnail uploads, and message status
updates.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
