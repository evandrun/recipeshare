# RecipeShare agent instructions

## Purpose and source of truth
- Build RecipeShare according to `docs/spec.md`; the spec is authoritative.
- Build Must features M1-M7 before treating Should features as complete. Keep README status honest: a feature is only done when its deployed acceptance check passes.

## Stack and commands
- Vanilla JavaScript and Node's built-in web server/build scripts, Supabase for Postgres/Auth/Storage, Vercel for hosting.
- Install: `npm ci`; local app: `npm run dev`; tests: `npm test`; production build: `npm run build`; preview: `npm run preview`.
- Apply the SQL migration and seed in `supabase/` to a free Supabase project.

## Conventions
- Keep the app small, accessible, responsive, and dependency-light. Supabase JS is loaded from esm.sh; do not add a package without a clear need.
- Keep fixed cuisine/category lists in sync with the database constraints and `docs/spec.md`.
- Validate required form fields before submitting. Escape user-provided text before rendering HTML.
- Add a focused test for each feature after it works; run all tests after each change.
- Never commit secrets. Read public client configuration from environment variables. Only use Supabase's public anon/publishable key in the browser; never expose a service-role key.
- Add `.env.example` variable names without values. Keep local `.env` files out of Git.
- Use Row Level Security for authorization; never rely only on client-side ownership checks.
- Make small, clear commits as each feature is completed.
