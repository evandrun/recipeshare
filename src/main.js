import { createClient } from "@supabase/supabase-js";
import { averageRating, CATEGORIES, CUISINES, filterRecipes, sortRecipes, validateRecipe } from "./domain.js";

const supabaseUrl = window.RECIPE_SHARE_CONFIG?.supabaseUrl;
const supabaseKey = window.RECIPE_SHARE_CONFIG?.supabaseAnonKey;
const db = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const root = document.querySelector("#app");
const guestId = localStorage.getItem("recipeshare-guest-id") || crypto.randomUUID();
localStorage.setItem("recipeshare-guest-id", guestId);

const starterRecipes = [
  { id: "sample-rice", author_name: "RecipeShare Kitchen", title: "Dill and Saffron Rice", cuisine: "Iranian", category: "Main Dish", ingredients: ["2 cups basmati rice", "2 tbsp chopped dill", "A pinch of saffron", "Salt"], steps: ["Rinse rice until the water runs clear.", "Cook rice in salted water until tender.", "Fold in dill and saffron, cover for 5 minutes, then serve."], prep_minutes: 35, image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85", created_at: "2026-01-02T00:00:00Z", ratings: [] },
  { id: "sample-tacos", author_name: "RecipeShare Kitchen", title: "Weeknight Avocado Tacos", cuisine: "Mexican", category: "Fast Food", ingredients: ["8 corn tortillas", "2 ripe avocados", "1 lime", "1 cup shredded cabbage", "Salsa"], steps: ["Warm tortillas in a dry skillet.", "Slice avocado and toss cabbage with lime juice.", "Fill tortillas and finish with salsa."], prep_minutes: 20, image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=85", created_at: "2026-01-01T00:00:00Z", ratings: [] },
];
let recipes = [...starterRecipes];
let session = null;
let currentRoute = location.hash.slice(1) || "/";
let filters = { cuisine: "", category: "", keyword: "", sort: "newest" };
let notice = "";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const optionList = (items, value) => items.map((item) => `<option value="${esc(item)}" ${value === item ? "selected" : ""}>${esc(item)}</option>`).join("");
const imageFor = (recipe) => `<img class="recipe-photo" src="${esc(recipe.image_url)}" alt="${esc(recipe.title)}" loading="lazy" onerror="this.classList.add('photo-missing'); this.removeAttribute('src')">`;
const displayRating = (recipe) => averageRating(recipe.ratings || []);

async function loadData() {
  if (!db) return;
  const [{ data: authData }, { data, error }] = await Promise.all([
    db.auth.getSession(),
    db.from("recipes").select("*, ratings(rating)").order("created_at", { ascending: false }),
  ]);
  session = authData?.session || null;
  if (!error && data) recipes = data;
  else notice = "Could not reach the recipe database. Check the Supabase settings and try again.";
}

function ratingText(recipe) {
  const { average, count } = displayRating(recipe);
  return count ? `${average.toFixed(1)} <span aria-label="star rating">★</span> <span class="rating-count">(${count})</span>` : `No ratings yet`;
}

function header() {
  const name = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || session?.user?.email;
  return `<header class="site-header"><a class="brand" href="#/" aria-label="RecipeShare home"><span class="brand-mark">R</span><span>recipe<span class="brand-light">share</span></span></a><nav aria-label="Main navigation"><a href="#/">Discover</a><a href="#/new">Share a recipe <span aria-hidden="true">＋</span></a>${session ? `<a href="#/profile">My recipes</a><button class="text-button" data-action="signout">Sign out</button><span class="user-chip">${esc(name)}</span>` : `<button class="text-button" data-action="signin">Sign in with Google</button>`}</nav></header>`;
}

function card(recipe) {
  const { average, count } = displayRating(recipe);
  return `<a class="recipe-card" href="#/recipes/${encodeURIComponent(recipe.id)}" aria-label="Open ${esc(recipe.title)}">
    <div class="card-image">${imageFor(recipe)}<span class="card-cuisine">${esc(recipe.cuisine)}</span><span class="image-arrow" aria-hidden="true">↗</span></div>
    <div class="card-content"><div class="eyebrow">${esc(recipe.category)} <span>·</span> ${Number(recipe.prep_minutes)} min</div><h3>${esc(recipe.title)}</h3><div class="card-footer"><span>By ${esc(recipe.author_name)}</span><span class="rating">${count ? `${average.toFixed(1)} ★ <small>(${count})</small>` : `☆ <small>New</small>`}</span></div></div>
  </a>`;
}

function homeView() {
  const visible = sortRecipes(filterRecipes(recipes, filters.cuisine, filters.category, filters.keyword).map((r) => ({ ...r, ...displayRating(r) })), filters.sort);
  return `<main><section class="hero"><div class="hero-copy"><p class="kicker"><span></span> GOOD FOOD, SHARED</p><h1>A world of recipes.<br><em>One table.</em></h1><p class="hero-description">Recipes passed around kitchens, cultures, and generations. Find something wonderful to make tonight.</p><a class="button button-dark" href="#/new">Share your recipe <span>↗</span></a></div><div class="hero-art" aria-label="A table set with a bowl of fresh food"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="A colorful shared meal"/><div class="art-label"><span>At the table</span><span>Since forever</span></div><span class="art-spark">✳</span></div><div class="hero-index">01 <span>—</span> 04</div></section>
  <section class="discovery"><div class="section-heading"><div><p class="kicker">THE COMMUNITY COOKBOOK</p><h2>Find your next <em>favorite.</em></h2></div><span class="recipe-total">${visible.length} ${visible.length === 1 ? "recipe" : "recipes"}</span></div>
  <div class="filters" aria-label="Recipe filters"><label class="filter-control"><span>Cuisine</span><select id="filter-cuisine"><option value="">All cuisines</option>${optionList(CUISINES, filters.cuisine)}</select></label><label class="filter-control"><span>Category</span><select id="filter-category"><option value="">All categories</option>${optionList(CATEGORIES, filters.category)}</select></label><label class="filter-control keyword-filter"><span>Search</span><input id="filter-keyword" type="search" placeholder="Try an ingredient" value="${esc(filters.keyword)}" /></label><label class="filter-control sort-filter"><span>Sort</span><select id="filter-sort"><option value="newest" ${filters.sort === "newest" ? "selected" : ""}>Newest</option><option value="highest" ${filters.sort === "highest" ? "selected" : ""}>Highest rated</option></select></label><button class="clear-button" data-action="clear">Clear all</button></div>
  ${visible.length ? `<div class="recipe-grid">${visible.map(card).join("")}</div>` : `<div class="empty-state"><span>✳</span><h3>No recipes found</h3><p>Try a different cuisine or clear the filters to see every recipe.</p><button class="button button-outline" data-action="clear">Clear filters</button></div>`}</section></main>`;
}

function recipeForm(recipe = null) {
  const signedName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || session?.user?.email || "";
  const author = recipe?.author_name || signedName;
  return `<main class="form-page"><a class="back-link" href="#/">← Back to recipes</a><div class="form-heading"><p class="kicker">FROM YOUR KITCHEN TO OURS</p><h1>${recipe ? "Edit your recipe" : "Share a recipe."}</h1><p>Every dish has a story. Add yours to the table.</p></div><form id="recipe-form" class="recipe-form" novalidate>
    <div class="form-grid"><label class="field full"><span>Your name</span><input name="author_name" required value="${esc(author)}" ${session ? "readonly" : ""} placeholder="Who made this?" /><small data-error="author_name"></small></label>
    <label class="field full"><span>Recipe title</span><input name="title" required value="${esc(recipe?.title || "")}" placeholder="e.g. Sunday tomato soup" /><small data-error="title"></small></label>
    <label class="field"><span>Cuisine</span><select name="cuisine" required><option value="">Choose a cuisine</option>${optionList(CUISINES, recipe?.cuisine)}</select><small data-error="cuisine"></small></label>
    <label class="field"><span>Category</span><select name="category" required><option value="">Choose a category</option>${optionList(CATEGORIES, recipe?.category)}</select><small data-error="category"></small></label>
    <label class="field"><span>Prep time <small>(minutes)</small></span><input name="prep_minutes" type="number" min="1" required value="${esc(recipe?.prep_minutes || "")}" placeholder="30" /><small data-error="prep_minutes"></small></label>
    <label class="field full"><span>Ingredients <small>(one per line)</small></span><textarea name="ingredients" rows="5" required placeholder="2 cups flour&#10;1 cup milk">${esc((recipe?.ingredients || []).join("\n"))}</textarea><small data-error="ingredients"></small></label>
    <label class="field full"><span>Steps <small>(one per line)</small></span><textarea name="steps" rows="5" required placeholder="Preheat the oven to 350°F.&#10;Mix the ingredients together.">${esc((recipe?.steps || []).join("\n"))}</textarea><small data-error="steps"></small></label>
    <label class="field full"><span>Food photo link</span><input name="image_url" type="url" required value="${esc(recipe?.image_url || "")}" placeholder="https://..." /><small class="field-hint">Use a link to a food photo. No photos of people.</small><small data-error="image_url"></small></label>
    ${session ? `<label class="field full upload-field"><span>Or upload a food photo</span><input name="photo_file" type="file" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG, or WebP · up to 5 MB</small></label>` : ""}
    </div><p class="form-error" role="alert" aria-live="polite"></p><button class="button button-dark submit-button" type="submit">${recipe ? "Save changes" : "Add to the cookbook"} <span>↗</span></button></form></main>`;
}

function detailView(recipe) {
  if (!recipe) return `<main class="empty-state"><h2>This recipe isn't here.</h2><a href="#/">Browse recipes</a></main>`;
  const mine = !!session?.user && recipe.owner_id === session.user.id;
  const { average, count } = displayRating(recipe);
  return `<main class="detail-page"><a class="back-link" href="#/">← Back to all recipes</a><div class="detail-hero"><div class="detail-photo">${imageFor(recipe)}<span class="card-cuisine">${esc(recipe.cuisine)}</span></div><div class="detail-intro"><p class="kicker">${esc(recipe.category)} <span>·</span> ${Number(recipe.prep_minutes)} MIN</p><h1>${esc(recipe.title)}</h1><p class="byline">Shared by <strong>${esc(recipe.author_name)}</strong></p><div class="detail-rating"><span class="big-rating">${count ? average.toFixed(1) : "—"}</span><span><span class="stars">${count ? "★" : "☆☆☆☆☆"}</span><br><small>${count ? `${count} ${count === 1 ? "rating" : "ratings"}` : "Be the first to rate"}</small></span></div>${mine ? `<div class="owner-actions"><a class="button button-outline" href="#/recipes/${encodeURIComponent(recipe.id)}/edit">Edit recipe</a><button class="text-button danger" data-action="delete" data-id="${esc(recipe.id)}">Delete</button></div>` : ""}</div></div>
  <div class="detail-columns"><section><p class="kicker">WHAT YOU'LL NEED</p><h2>Ingredients</h2><ul class="ingredient-list">${(recipe.ingredients || []).map((i) => `<li><span>○</span>${esc(i)}</li>`).join("")}</ul></section><section><p class="kicker">LET'S MAKE IT</p><h2>Method</h2><ol class="step-list">${(recipe.steps || []).map((step, i) => `<li><span class="step-number">${String(i + 1).padStart(2, "0")}</span><p>${esc(step)}</p></li>`).join("")}</ol><div class="rate-panel"><div><p class="kicker">MADE THIS RECIPE?</p><strong>Leave a little love.</strong></div><div class="rate-buttons" role="group" aria-label="Rate from 1 to 5 stars">${[1,2,3,4,5].map((n) => `<button class="star-button" data-action="rate" data-id="${esc(recipe.id)}" data-rating="${n}" aria-label="Rate ${n} out of 5 stars">★</button>`).join("")}</div><span class="rate-message" aria-live="polite"></span></div></section></div></main>`;
}

function profileView() {
  if (!session) return `<main class="empty-state"><h2>Sign in to see your recipes.</h2><button class="button button-dark" data-action="signin">Sign in with Google</button></main>`;
  const mine = recipes.filter((r) => r.owner_id === session.user.id);
  return `<main class="profile-page"><p class="kicker">YOUR KITCHEN</p><h1>My recipes.</h1><p class="hero-description">${esc(session.user.user_metadata?.full_name || session.user.email)}</p>${mine.length ? `<div class="recipe-grid">${mine.map(card).join("")}</div>` : `<div class="empty-state"><span>✳</span><h3>Your cookbook is waiting.</h3><p>Share the first recipe from your kitchen.</p><a class="button button-dark" href="#/new">Add a recipe</a></div>`}</main>`;
}

function render() {
  const path = currentRoute || "/";
  const editMatch = path.match(/^\/recipes\/([^/]+)\/edit$/);
  const detailMatch = path.match(/^\/recipes\/([^/]+)$/);
  let body = path === "/new" ? recipeForm() : path === "/profile" ? profileView() : editMatch ? recipeForm(recipes.find((r) => r.id === decodeURIComponent(editMatch[1]))) : detailMatch ? detailView(recipes.find((r) => r.id === decodeURIComponent(detailMatch[1]))) : homeView();
  root.innerHTML = `${header()}${!db ? `<div class="setup-banner"><span>Demo preview</span> Connect a free Supabase project to save recipes and ratings for everyone.</div>` : ""}${notice ? `<div class="notice-banner" role="status">${esc(notice)}</div>` : ""}${body}<footer><a class="brand" href="#/"><span class="brand-mark">R</span> recipe<span class="brand-light">share</span></a><span>Made with care, shared with the world.</span><a href="#/new">Have a recipe? Add it ↗</a><a class="footer-privacy" href="/privacy.html">Privacy</a></footer>`;
}

function go(path) { currentRoute = path; location.hash = `#${path}`; render(); window.scrollTo(0, 0); }

root.addEventListener("change", async (event) => {
  if (event.target.matches("#filter-cuisine")) filters.cuisine = event.target.value;
  else if (event.target.matches("#filter-category")) filters.category = event.target.value;
  else if (event.target.matches("#filter-sort")) filters.sort = event.target.value;
  else if (event.target.matches("#filter-keyword")) filters.keyword = event.target.value;
  else if (event.target.matches('[name="photo_file"]')) {
    const file = event.target.files?.[0];
    if (!file || !db || !session) return;
    const error = root.querySelector(".form-error");
    if (file.size > 5 * 1024 * 1024) { error.textContent = "That photo is larger than 5 MB."; event.target.value = ""; return; }
    const path = `${session.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await db.storage.from("recipe-photos").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) error.textContent = `Photo upload failed: ${uploadError.message}`;
    else { const { data } = db.storage.from("recipe-photos").getPublicUrl(path); root.querySelector('[name="image_url"]').value = data.publicUrl; error.textContent = "Photo uploaded. Its link is ready."; }
  }
  if (event.target.matches("#filter-cuisine, #filter-category, #filter-sort, #filter-keyword")) render();
});

root.addEventListener("submit", async (event) => {
  if (event.target.id !== "recipe-form") return;
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form).entries());
  const fields = { ...values, ingredients: values.ingredients.trim(), steps: values.steps.trim() };
  const missing = validateRecipe(fields);
  form.querySelectorAll("[data-error]").forEach((el) => { el.textContent = ""; });
  if (missing.length) {
    const fieldMap = { "Author name": "author_name", Title: "title", Cuisine: "cuisine", Category: "category", Ingredients: "ingredients", Steps: "steps", "Prep time": "prep_minutes", "Image link": "image_url" };
    missing.forEach((label) => { const key = fieldMap[label]; form.querySelector(`[data-error="${key}"]`).textContent = `${label} is required.`; });
    form.querySelector(`[name="${fieldMap[missing[0]]}"]`).focus();
    return;
  }
  try { const image = new URL(fields.image_url); if (!["https:", "http:"].includes(image.protocol)) throw new Error("Unsupported protocol"); } catch { form.querySelector('[data-error="image_url"]').textContent = "Enter a valid image URL."; return; }
  const payload = { author_name: session ? (session.user.user_metadata?.full_name || session.user.user_metadata?.name || values.author_name) : values.author_name.trim(), title: values.title.trim(), cuisine: values.cuisine, category: values.category, ingredients: values.ingredients.split(/\r?\n/).map((x) => x.trim()).filter(Boolean), steps: values.steps.split(/\r?\n/).map((x) => x.trim()).filter(Boolean), prep_minutes: Number(values.prep_minutes), image_url: values.image_url.trim(), owner_id: session?.user?.id || null };
  const button = form.querySelector("[type=submit]"); button.disabled = true; button.textContent = "Saving…";
  if (db) {
    const editMatch = currentRoute.match(/^\/recipes\/([^/]+)\/edit$/);
    let response;
    if (editMatch) response = await db.from("recipes").update(payload).eq("id", decodeURIComponent(editMatch[1])).select().single();
    else response = await db.from("recipes").insert(payload).select().single();
    if (response.error) { form.querySelector(".form-error").textContent = `Could not save this recipe: ${response.error.message}`; button.disabled = false; button.textContent = "Try again"; return; }
    await loadData();
  } else {
    recipes.unshift({ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), ratings: [] });
  }
  go("/");
});

root.addEventListener("click", async (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "clear") { filters = { cuisine: "", category: "", keyword: "", sort: "newest" }; render(); }
  if (action === "signin" && db) {
    const { error } = await db.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}${location.pathname}` } });
    if (error) notice = `Could not start Google sign-in: ${error.message}`;
  }
  if (action === "signout" && db) { await db.auth.signOut(); session = null; render(); }
  if (action === "rate") {
    const recipe = recipes.find((r) => r.id === control.dataset.id);
    if (session?.user && recipe?.owner_id === session.user.id) { notice = "You cannot rate your own recipe."; render(); return; }
    if (db) {
      const { error } = await db.rpc("save_rating", { p_recipe_id: control.dataset.id, p_rating: Number(control.dataset.rating), p_guest_id: session ? null : guestId });
      if (error) { notice = `Could not save your rating: ${error.message}`; render(); return; }
      await loadData(); render();
      const msg = root.querySelector(".rate-message"); if (msg) msg.textContent = "Thanks for rating this recipe!";
    } else {
      const existing = recipe.ratings.find((r) => r.guest_id === guestId);
      if (existing) existing.rating = Number(control.dataset.rating);
      else recipe.ratings.push({ rating: Number(control.dataset.rating), guest_id: guestId });
      render();
    }
  }
  if (action === "delete") {
    if (!session || !confirm("Delete this recipe? This cannot be undone.")) return;
    const { error } = await db.from("recipes").delete().eq("id", control.dataset.id);
    if (error) { notice = `Could not delete this recipe: ${error.message}`; render(); return; }
    await loadData(); go("/");
  }
});

window.addEventListener("hashchange", () => { currentRoute = location.hash.slice(1) || "/"; render(); });
root.addEventListener("input", (event) => {
  if (event.target.matches("#filter-keyword")) { filters.keyword = event.target.value; const cursor = event.target.selectionStart; render(); const input = root.querySelector("#filter-keyword"); input.focus(); input.setSelectionRange(cursor, cursor); }
});

if (db) {
  const { data } = await db.auth.getSession(); session = data?.session || null;
  await loadData();
  db.auth.onAuthStateChange((_event, nextSession) => { session = nextSession; queueMicrotask(async () => { await loadData(); render(); }); });
}
render();
