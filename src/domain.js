export const CUISINES = ["American", "Arabic", "Chinese", "German", "Indian", "Iranian", "Italian", "Japanese", "Mexican", "Other"];
export const CATEGORIES = ["Breakfast", "Main Dish", "Fast Food", "Soup", "Salad", "Dessert", "Snack", "Drink"];

export function validateRecipe(values) {
  const required = [
    ["author_name", "Author name"], ["title", "Title"], ["cuisine", "Cuisine"],
    ["category", "Category"], ["ingredients", "Ingredients"], ["steps", "Steps"],
    ["prep_minutes", "Prep time"], ["image_url", "Image link"],
  ];
  return required.filter(([key]) => {
    const value = values[key];
    if (["ingredients", "steps"].includes(key) && typeof value === "string") {
      return value.split(/\r?\n/).every((line) => !line.trim());
    }
    if (["ingredients", "steps"].includes(key) && Array.isArray(value)) return value.filter((line) => String(line).trim()).length === 0;
    return value == null || String(value).trim() === "" || (key === "prep_minutes" && (!Number.isFinite(Number(value)) || Number(value) < 1));
  }).map(([, label]) => label);
}

export function filterRecipes(recipes, cuisine = "", category = "", keyword = "") {
  const query = keyword.trim().toLocaleLowerCase();
  return recipes.filter((recipe) =>
    (!cuisine || recipe.cuisine === cuisine) &&
    (!category || recipe.category === category) &&
    (!query || `${recipe.title} ${(recipe.ingredients || []).join(" ")}`.toLocaleLowerCase().includes(query))
  );
}

export function averageRating(ratings = []) {
  if (!ratings.length) return { average: 0, count: 0 };
  const total = ratings.reduce((sum, item) => sum + Number(item.rating), 0);
  return { average: Math.round((total / ratings.length) * 10) / 10, count: ratings.length };
}

export function sortRecipes(recipes, mode) {
  return [...recipes].sort((a, b) => mode === "highest"
    ? (Number(b.average_rating || 0) - Number(a.average_rating || 0)) || (b.rating_count || 0) - (a.rating_count || 0)
    : new Date(b.created_at) - new Date(a.created_at));
}
