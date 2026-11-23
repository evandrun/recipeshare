# RecipeShare build plan

The order follows docs/spec.md: complete and verify the Must features before treating Should features as complete.

## 1. Browse recipes (M1)
- Files: index.html, src/main.js, src/styles.css, src/domain.js.
- Check: confirm each live card shows photo, title, cuisine, category, and rating state.

## 2. Recipe details (M2)
- Files: src/main.js, src/styles.css.
- Check: open a card and confirm its ingredients, steps, prep time, cuisine, category, photo, title, and author.

## 3. Add and validate recipes (M3)
- Files: src/main.js, src/domain.js, tests/domain.test.js.
- Test: required-field validation reports missing fields and accepts a complete recipe.
- Check: submit a complete recipe, then submit one with a required field blank and confirm nothing is saved.

## 4. Filter recipes (M4)
- Files: src/main.js, src/domain.js, tests/domain.test.js.
- Test: Iranian + Main Dish returns only matching recipes; no matches shows the required empty state.
- Check: combine both dropdowns, clear them, and try a combination with no results.

## 5. Deploy and persist data (M6, M7)
- Files: vercel.json, .env.example, supabase/migrations/001_recipes_and_ratings.sql, supabase/migrations/002_public_api_grants.sql, supabase/seed.sql, src/main.js, docs/setup.md.
- Test: CI runs npm test and npm run build on pushes and pull requests. Confirm the app reads the configured Supabase project.
- Check: confirm both seeded cuisines/categories appear; add a recipe and verify it from another device and after a redeploy.

## 6. Rating (M5)
- Files: migration SQL, src/main.js, src/domain.js, tests/domain.test.js.
- Test: rating mean and count update as expected after a new or replacement rating.
- Check: rate on a recipe detail page and verify the mean/count on both detail and home cards.

## 7. Should features after M1-M7
- S1: Google sign-in and profile recipe list; requires Supabase Google OAuth setup.
- S2: edit/delete controls plus database ownership policies; attempt a direct request against another user's recipe.
- S3: signed-in-only ratings, one rating per user, and author restriction; check both UI and database rules.
- S4: persistent image upload to Supabase Storage; verify the file remains after redeploy.
- S5: search titles/ingredients together with filters.
- S6: sort by newest and highest rated.

## 8. Finish and review
- Files: README.md, .github/workflows/ci.yml, environment settings.
- Test: run npm test and npm run build; verify the latest Actions run succeeds.
- Check: confirm the README live URL works, feature statuses are accurate, and no private keys are committed.
