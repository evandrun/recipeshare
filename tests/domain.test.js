import test from "node:test";
import assert from "node:assert/strict";
import { averageRating, filterRecipes, validateRecipe } from "../src/domain.js";

const recipes = [
  { title: "Herbed rice", cuisine: "Iranian", category: "Main Dish", ingredients: ["rice", "dill"] },
  { title: "Chili noodles", cuisine: "Chinese", category: "Fast Food", ingredients: ["noodles", "chili"] },
];

test("cuisine and category filters combine and keyword search finds ingredients", () => {
  assert.deepEqual(filterRecipes(recipes, "Iranian", "Main Dish"), [recipes[0]]);
  assert.deepEqual(filterRecipes(recipes, "", "", " RICE "), [recipes[0]]);
  assert.equal(filterRecipes(recipes, "German", "Dessert").length, 0);
});

test("average rating returns a rounded mean and rating count", () => {
  assert.deepEqual(averageRating([{ rating: 4 }, { rating: 5 }, { rating: 4 }]), { average: 4.3, count: 3 });
  assert.deepEqual(averageRating(), { average: 0, count: 0 });
});

test("required-field check names missing fields and accepts a complete recipe", () => {
  assert.deepEqual(validateRecipe({ title: "Tea" }), ["Author name", "Cuisine", "Category", "Ingredients", "Steps", "Prep time", "Image link"]);
  assert.deepEqual(validateRecipe({ author_name: "Sam", title: "Tea", cuisine: "Other", category: "Drink", ingredients: " \n ", steps: "brew", prep_minutes: "5", image_url: "https://example.com/tea.jpg" }), ["Ingredients"]);
  assert.deepEqual(validateRecipe({ author_name: "Sam", title: "Tea", cuisine: "Other", category: "Drink", ingredients: "water", steps: "brew", prep_minutes: "5", image_url: "https://example.com/tea.jpg" }), []);
});
