# RecipeShare build plan

The order follows `docs/spec.md`: complete the Must features first. Deploy early, then wire in durable storage and sample data.

## 1. Browse recipes (M1)
- Files: `index.html`, `src/main.js`, `src/styles.css`, `src/domain.js`.
- Test: verify recipe cards show photo, title, cuisine, category, and average rating.
- Check: open the home page and compare both sample cards with the required fields.

## 2. Recipe details (M2)
- Files: `src/main.js`, `src/styles.css`.
- Test: detail rendering shows every recipe field and author name.
- Check: open a card and confirm ingredients, steps, prep time, cuisine, category, photo, title, and author.

## 3. Add and validate recipes (M3)
- Files: `src/main.js`, `src/domain.js`, `tests/domain.test.js`.
- Test: required-field validation reports missing fields and accepts a complete recipe.
- Check: submit a complete recipe, then submit with a required field blank and confirm nothing is saved.

## 4. Filter recipes (M4)
- Files: `src/main.js`, `src/domain.js`, `tests/domain.test.js`.
- Test: Iranian + Main Dish returns only matching recipes; no matches shows the required empty state.
- Check: combine both dropdowns, clear them, and try a combination with no results.

## 5. Deploy an early preview
- Files: `vercel.json`, `.env.example`, Vercel project settings.
- Test: CI runs `npm test` and `npm run build` on pushes and pull requests.
- Check: import the public GitHub repository into the free Vercel Hobby plan and open the preview URL.

## 6. Persist recipes, ratings, and sample data (M6, M7)
- Files: `supabase/migrations/001_recipes_and_ratings.sql`, `supabase/seed.sql`, `src/main.js`, `docs/setup.md`.
- Test: retain the filter, validation, and rating calculation tests; verify database requests use the configured Supabase project.
- Check: add a recipe on the live app, open it on another device, and confirm the two seeded cuisines/categories appear after redeploy.

## 7. Rating (M5)
- Files: migration SQL, `src/main.js`, `src/domain.js`, `tests/domain.test.js`.
- Test: rating mean and count update as expected after a new or replacement rating.
- Check: rate on a recipe detail page and verify the mean/count on both detail and home cards.

## 8. Should features after M1-M7
- S1: Google sign-in and profile recipe list; requires Supabase Google OAuth setup.
- S2: edit/delete controls plus database ownership policies; attempt a direct request against another user's recipe.
- S3: signed-in one-rating-per-user and author restrictions; check both UI and database rules.
- S4: authenticated image upload to persistent Supabase Storage.
- S5: keyword search combined with cuisine/category filters.
- S6: newest and highest-rated sort choices.
- Check each live acceptance criterion and update the README status only after it passes.

## 9. Finish and review
- Files: `README.md`, `.github/workflows/ci.yml`, environment settings.
- Test: run `npm test` and `npm run build`; verify the latest Actions run succeeds.
- Check: confirm the README's live URL works, all feature statuses are accurate, and no private keys are committed.
