# Service setup

## Supabase (free)

1. Create a free Supabase project and open **SQL Editor**.
2. Run `supabase/migrations/001_recipes_and_ratings.sql`, then `supabase/seed.sql`.
3. In **Project Settings → API**, copy the Project URL and the public anon/publishable key.
4. Put them in a local `.env` using the names shown in `.env.example`. Add the same two values to the Vercel project's **Environment Variables** for Production, Preview, and Development.
5. Never use or publish the Supabase `service_role` secret. The `VITE_` values are included in browser code; the anon/publishable key is safe to expose only with Row Level Security enabled as in the migration.

## Vercel (free Hobby)

1. Import `evandrun/recipeshare` from the Vercel dashboard and keep the Hobby plan.
2. The repository's `vercel.json` runs the dependency-free Node build script and serves its `dist/` output.
3. Add the two Supabase environment variables, then redeploy.
4. Put the live `https://…vercel.app` URL in `README.md`.

## Google sign-in (S1)

1. In Supabase, open **Authentication → Providers → Google** and enable Google.
2. Configure a Google OAuth client in Google Cloud. Add Supabase's callback URL shown in the provider settings as an authorized redirect URI.
3. Add the Vercel app URL and local dev URL to Supabase **Authentication → URL Configuration → Redirect URLs**.
4. Save the Google client ID and client secret in Supabase's provider settings only. They do not belong in this repository or Vercel frontend variables.
5. Test sign-in, sign-out, and the profile recipe list on the live site.

## Quick local start

```sh
npm ci
cp .env.example .env
# Fill in the Supabase URL and public anon/publishable key in .env
npm run dev
```

In PowerShell, copy `.env.example` to `.env` with `Copy-Item .env.example .env`.
