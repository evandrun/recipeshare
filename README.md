# RecipeShare

A community cookbook for recipes from kitchens around the world.

**Live app:** Deployment is being set up. Follow [the service setup guide](docs/setup.md).

## Run locally

Use Node.js 20 or newer and npm.

```sh
npm ci
Copy-Item .env.example .env
npm run dev
```

Add the Supabase Project URL and public anon/publishable key to `.env` before using shared data.

## Tests and build

```sh
npm test
npm run build
```

GitHub Actions runs both commands for every push and pull request to `main`.

## Feature checklist

Status means the live acceptance criterion has passed. Local implementation alone is not marked done.

### Must

- [x] M1 Browse recipe cards — implemented; needs live check.
- [x] M2 Recipe detail — implemented; needs live check.
- [x] M3 Add recipe and show missing required fields — implemented; needs live database check.
- [x] M4 Cuisine + category filters and no-results message — implemented; needs live check.
- [x] M5 Rate from 1 to 5; average and count — implemented; needs live database check.
- [ ] M6 Shared database survives a redeploy — needs Supabase setup and live verification.
- [ ] M7 Two seeded sample recipes are available live — needs Supabase setup and live verification.

### Should

- [ ] S1 Google sign-in, sign-out, and profile — code is present; Google OAuth provider setup and live verification remain.
- [ ] S2 Edit/delete own recipes only — code and database policies are present; requires live authorization checks.
- [ ] S3 Signed-in-only ratings, one rating per user, and no author ratings — partly implemented: signed-in users have one replaceable rating and authors are blocked; guest ratings remain available for Must M5.
- [ ] S4 Persistent image upload — code and storage policy are present; requires Supabase setup and live verification.
- [x] S5 Search by title or ingredient with the other filters — implemented; needs live check.
- [x] S6 Sort by newest or highest rated — implemented; needs live check.

### Could

- [x] Phone-friendly layout — responsive layout implemented; needs live phone check.
- [ ] Other Could features — not implemented.

## Project files

- `docs/spec.md` — project requirements.
- `docs/plan.md` — ordered implementation and verification plan.
- `docs/setup.md` — Supabase, Vercel, and Google OAuth setup.
- `supabase/` — database migration and sample data.

## Security notes

Never commit `.env` or Supabase service-role keys. The browser uses only the public anon/publishable key with the database Row Level Security policies in the migration.
