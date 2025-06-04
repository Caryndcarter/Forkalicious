export default function copyRecipeData() {

  const recipeData = {}

  cy.get("img").invoke("attr", "src").then((imgSrc) => {
    recipeData.src = imgSrc;
  });

  cy.get("h2").invoke("text").then((val) => {
    recipeData.title = val;
  });

  cy.get("h4 span").eq(0).invoke("text").then((val) => {
    recipeData.readyInMinutes = val.replace(" minutes", "").trim();
  });

  cy.get("h4 span").eq(1).invoke("text").then((val) => {
    recipeData.servings = val;
  });

  cy.get("div.mb-8 span").eq(0).invoke("text").then((val) => {
    recipeData.summary = val;
  });

  cy.get("div.mb-8 li").eq(0).invoke("text").then((val) => {
    recipeData.firstIngredient = val;
  });

  cy.get("div.mb-8 span").eq(1).invoke("text").then((val) => {
    recipeData.instructions = val;
  });

  cy.get("ol li").eq(0).invoke("text").then((val) => {
    recipeData.firstStep = val;
  });

  return recipeData
}