import createRecipe from "../utils/createRecipe";
import login from "../utils/login";
import credentials from "../testingAssets/accountCredentials";
import copyRecipeData from "../utils/copyRecipeData";

function rawHtmlRenderer(htmlString) {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, "");
}

export function runUnitTests() {
  describe("The page works as it did before the edits", () => {

    let recipeData = {}

    beforeEach(() => {
      cy.visit("/");
      cy.get("#homepage-call-to-action").should("exist");
      createRecipe();
      cy.wait(200)
      login();
      cy.wait(200).get("#nav-recipe-book-link").click();
      cy.wait(300).get("#saved-recipes button").eq(0).click();

      recipeData = copyRecipeData();
      
      cy.contains("button", "Make it your Own!").click();
    });


    it("overwrites the title", () => {
      cy.get("#maker-input-title input")
        .should("have.value", `${credentials.testingAccount.userName}'s ${recipeData.title}`);
    });

    it("overwrites the summary", () => {
      cy.get("#maker-input-summary textarea")
        .invoke("val")
        .then((val) => {
          const rendered = rawHtmlRenderer(val);
          expect(rendered).to.eq(recipeData.summary);
        });
    });

    it("overwrites ready in minutes", () => {
      cy.get("#maker-input-ready-in-minutes input")
        .should("have.value", recipeData.readyInMinutes);
    });

    it("overwrites servings", () => {
      cy.get("#maker-input-servings input")
        .should("have.value", recipeData.servings);
    });

    it("overwrites first ingredient", () => {
      cy.get("#maker-input-ingredients input").eq(0)
        .should("have.value", recipeData.firstIngredient);
    });

    it("overwrites instructions", () => {
      cy.get("#maker-input-instructions textarea")
        .invoke("val")
        .then((val) => {
          const rendered = rawHtmlRenderer(val);
          expect(rendered).to.eq(recipeData.instructions);
        });
    });

    it("overwrites first step", () => {
      cy.get("#maker-input-steps input").eq(0)
        .invoke("val")
        .then((val) => {
          const rendered = rawHtmlRenderer(val);
          expect(rendered).to.eq(recipeData.firstStep);
        });
    });

    it("overwrites the image src", () => {
      cy.get("#maker-input-image input")
        .should("have.value", recipeData.src);
    });
  });
};


runUnitTests();
