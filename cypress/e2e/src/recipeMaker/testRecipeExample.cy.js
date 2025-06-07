import recipeExample from "../../assets/recipeExample";
import createRecipe from "../../utils/createRecipe";

export function createRecipeTest() {
  describe("The recipe maker works", () => {
    it("fills in the fields on the recipe maker", () => {
      cy.visit("/");
      cy.get("#homepage-call-to-action").should("exist");
      createRecipe(recipeExample);
    });
  });
}

createRecipeTest();
