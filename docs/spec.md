# RecipeShare: Product Specification

> Put this file in your repository at `docs/spec.md`. It replaces intent.md for this activity: the requirements are already decided. Point your agent at this file before it plans or writes code.

## 1. Product summary

RecipeShare is a website where people share recipes from cuisines around the world, find recipes by cuisine and category, and rate the recipes they try.

**Users:** visitors. No account is needed for the Must features. Sign-in is a Should feature (S1).

## 2. Fixed lists

Show these as drop-down choices, never free text.

- **Cuisine:** American, Arabic, Chinese, German, Indian, Iranian, Italian, Japanese, Mexican, Other
- **Category:** Breakfast, Main Dish, Fast Food, Soup, Salad, Dessert, Snack, Drink

## 3. Must have features

A feature is done only when its acceptance criterion passes on the deployed app. Must features need no user accounts and no file uploads: photos come from an image link.

| ID | User story | Acceptance criterion |
|---|---|---|
| M1 | As a visitor, I want to browse recipes so that I can see what people are cooking. | The home page shows recipe cards with photo, title, cuisine, category, and average rating. |
| M2 | As a visitor, I want to open a recipe so that I can read how to make it. | Clicking a card opens a detail page showing all recipe fields and the author's name. |
| M3 | As a visitor, I want to add a recipe so that others can cook it. | The form has: author name, title, cuisine, category, ingredients, steps, prep time in minutes, image link (URL). With all fields filled, the new recipe appears on the home page. When a required field is empty, nothing is saved and I see which field is missing. |
| M4 | As a visitor, I want to search by cuisine and filter by category so that I find the food I want. | Choosing cuisine "Iranian" and category "Main Dish" shows only recipes matching both. Clearing the choices shows all recipes. No matches shows "No recipes found". |
| M5 | As a visitor, I want to rate a recipe from 1 to 5 stars so that others know whether it is good. | After rating, the recipe's average rating and number of ratings update on its detail page and card. |
| M6 | As a visitor, I want recipes and ratings to be saved so that everyone sees the same data. | Data is stored in a database. A recipe added on one computer appears on another, and it is still there after redeploying. |
| M7 | As the instructor, I want sample data in the live app so that I can test it. | The live app already has at least 2 recipes, each with a different cuisine and category, so the filters can be checked. |

## 4. Should have features

S1 must be done before S2 and S3.

| ID | User story | Acceptance criterion |
|---|---|---|
| S1 | As a visitor, I want to sign in with Google so that my recipes and ratings are linked to me. | I can sign in with Google and sign out. When signed in, my name is the author of my new recipes, and a profile page lists my recipes. |
| S2 | As an author, I want to edit or delete my own recipes so that I can fix mistakes. | I can edit and delete my own recipes, but not other people's, even by sending the request directly to the server. |
| S3 | As a signed-in user, I want fair ratings so that the average means something. | Only signed-in users can rate; one rating per user per recipe (rating again replaces it); authors cannot rate their own recipes. |
| S4 | As an author, I want to upload a photo instead of pasting a link. | I can upload an image file, and it still shows after redeploying. |
| S5 | As a visitor, I want to search by keyword so that I can find a recipe by name or ingredient. | Typing "rice" shows recipes with "rice" in the title or ingredients, combined with the filters. |
| S6 | As a visitor, I want to sort recipes so that I see the best or newest first. | The home page can be sorted by "Newest" and "Highest rated". |

## 5. Could have features

Comments; favorites on a profile page; a servings scaler; recipe video as an embedded link; dietary tags usable as a filter; a phone-friendly layout; your own ideas (describe them in the README).

## 6. Engineering requirements

- **E1** All code in one public GitHub repository, with frequent commits and clear messages.
- **E2** An agent instruction file (`CLAUDE.md` or `AGENTS.md`) in the repository root; this spec at `docs/spec.md`; the agent's build plan at `docs/plan.md`.
- **E3** Tests are added one feature at a time: once a feature works, add a test for it. By the end, at least 3 passing tests in total (not one per feature) (for example: the cuisine and category filter, the average rating calculation, the required-field check). All tests run with one command.
- **E4** By the end of the project, a GitHub Actions workflow runs the tests and the build on every push.
- **E5** Pushing to the main branch deploys the app automatically (Vercel or a similar free host).
- **E6** No secrets in the repository. Secrets live in environment variables; `.env.example` lists the names only.
- **E7** README: live URL, how to run the app and the tests, and a checklist of M, S, and Could features (done, partly done, not done).

## 7. Constraints and out of scope

- Free plans only, for every service.
- No payments, no admin panel, no email notifications.
- Images are links to food photos only; no photos of people.
- Build the Must features first. Do not start Should features until M1 to M7 work.
