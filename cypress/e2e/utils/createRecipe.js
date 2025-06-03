export default function createRecipe() {
  cy.get("#nav-recipe-maker-link").click();

  // fill in the recipe:
  cy.get("#maker-input-title input").type("title"); // title
  cy.get("#maker-input-summary textarea").type("summary");  // summary
  cy.get("#maker-input-ready-in-minutes input").type("30"); // ready-in-minutes
  cy.get("#maker-input-servings input").type("4");  // servings

  // ingredients
  cy.get("#maker-input-ingredients input").eq(0).type("1 cup lettuce")
  cy.get("#maker-input-ingredients button").eq(2).click();
  cy.get("#maker-input-ingredients input").eq(1).type("2 tsp salt")

  cy.get("#maker-input-instructions textarea").type("instructions"); // instrutions

  // diets
  cy.get("#maker-input-diets button").eq(1).click();
  cy.get("#maker-input-diets select").select("Vegan");

  // steps
  cy.get("#maker-input-steps button").eq(1).click();
  cy.get("#maker-input-steps input").eq(0).type("step 1");
  cy.get("#maker-input-steps button").eq(2).click();
  cy.get("#maker-input-steps input").eq(1).type("step 2");

  // image
  cy.get('#maker-input-image input').type("https://restaurants.com");
}