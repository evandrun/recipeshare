# RecipeShare

A community cookbook for recipes from kitchens around the world.

**Live app:** [recipeshare-pl1u.vercel.app](https://recipeshare-pl1u.vercel.app/)

## Run locally

Use Node.js 20 or newer and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Add the Supabase Project URL and public anon/publishable key to `.env` before using shared data. In PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed.

## Tests and build

```sh
npm test
npm run build
```

The test suite contains three tests covering filters/search, rating averages, and required fields. GitHub Actions runs tests and a production build on every push to `main` and pull request. Vercel deploys the connected `main` branch automatically.

## Feature checklist

“Done” means the deployed acceptance check passed. “Partly done” means the implementation or one part is verified, but the full live criterion is not.

### Must

- [ ] M1 Recipe cards show photos, titles, cuisine, category, and rating state (partly done; live cards checked, but no numeric average is displayed until recipes have ratings).
- [x] M2 Recipe detail shows all recipe fields and author (checked live).
- [ ] M3 Add a recipe and identify missing required fields (partly done; live required-field messages checked, valid database submission still needs checking).
- [x] M4 Iranian + Main Dish filters, clearing filters, and no-results message (checked live).
- [ ] M5 Submit a 1–5 rating and see average/count update on card and detail (not done; automated calculation test passes, live rating update needs checking).
- [ ] M6 Shared database is configured and the live app can load it; cross-device submission and persistence after redeploy still need acceptance checks (partly done).
- [x] M7 Two seeded recipes with different cuisines and categories are visible live.

### Should

- [ ] S1 Google sign-in, sign-out, and profile recipe list (not done; Google provider is disabled until OAuth credentials are configured).
- [ ] S2 Edit/delete only one's own recipes, including direct server requests (not done; requires S1 and live authorization checks).
- [ ] S3 Signed-in-only ratings, one replaceable rating per user, and no author ratings (not done; guests can currently rate, so this does not meet the criterion).
- [ ] S4 Persistent image upload (implementation and storage rules are present; live check requires S1).
- [ ] S5 Search title/ingredients together with filters (implemented; needs live check).
- [ ] S6 Sort by newest or highest rated (implemented; needs live check).

### Could

- [ ] Comments, favorites, servings scaler, recipe video, and dietary-tag filters (not implemented).
- [ ] Phone-friendly layout (implemented; needs live phone check).

## Project files

- `AGENTS.md` — project instructions.
- `docs/spec.md` — requirements.
- `docs/plan.md` — implementation and verification plan.
- `docs/setup.md` — Supabase, Vercel, and Google OAuth setup.
- `supabase/migrations/` and `supabase/seed.sql` — database schema, access policies, API grants, and sample recipes.

## Security notes

Never commit `.env` or Supabase service-role keys. The browser uses only the public anon/publishable key with row-level security policies. Migration `002_public_api_grants.sql` applies the API role grants needed for the policies in migration `001_recipes_and_ratings.sql` to take effect.
