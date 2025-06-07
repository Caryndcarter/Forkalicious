export default function createRecipe(recipe) {
  cy.get("#nav-recipe-maker-link").click();

  // fill in the recipe:
  cy.get("#title-input").type(recipe.title);
  cy.get("#summary-textArea").type(recipe.summary);
  cy.get("#ready-in-minutes-input").type(recipe.readyInMinutes);
  cy.get("#servings-input").type(recipe.servings);

  recipe.ingredients.forEach((ingredient, index) => {
    index > 0 ? cy.get("#add-ingredient-button").click() : null;
    cy.get("#ingredients-section input").eq(index).type(ingredient);
  });

  cy.get("#instructions-textarea").type(recipe.instructions);

  recipe.diets.forEach((diet, index) => {
    cy.get("#add-diet-button").click();
    cy.get("#diet-section select").eq(index).select(diet);
  });

  recipe.steps.forEach((step, index) => {
    cy.get("#add-step-button").click();
    cy.get("#steps-section input").eq(index).type(step);
  });

  cy.get("#image-input").type(recipe.image);
}
