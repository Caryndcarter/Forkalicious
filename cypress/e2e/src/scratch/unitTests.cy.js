import createRecipe from "./utils/createRecipe";
import login from "./utils/login";
import credentials from "./assets/accountCredentials";

function rawHtmlRenderer(htmlString) {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, "");
}

export function runUnitTests() {
  describe("The page works as it did before the edits", () => {
    it("Overwrites the stored recipe", () => {
      cy.visit("/");
      cy.get("#homepage-call-to-action").should("exist");

      createRecipe();
      cy.wait(200);
      login();

      cy.wait(200).get("#nav-recipe-book-link").click();

      cy.wait(300).get("#saved-recipes button").eq(0).click();

      const recipeData = {};

      cy.get("img")
        .invoke("attr", "src")
        .then((imgSrc) => {
          recipeData.src = imgSrc;
        });

      cy.get("h2")
        .invoke("text")
        .then((val) => {
          recipeData.title = val;
        });

      cy.get("h4 span")
        .eq(0)
        .invoke("text")
        .then((val) => {
          const cleaned = val.replace(" minutes", "").trim();
          recipeData.readyInMinutes = cleaned;
        });

      cy.get("h4 span")
        .eq(1)
        .invoke("text")
        .then((val) => {
          recipeData.servings = val;
        });

      cy.get("div.mb-8 span")
        .eq(0)
        .invoke("text")
        .then((val) => {
          recipeData.summary = val;
        });

      cy.get("div.mb-8 li")
        .eq(0)
        .invoke("text")
        .then((val) => {
          recipeData.firstIngredient = val;
        });

      cy.get("div.mb-8 span")
        .eq(1)
        .invoke("text")
        .then((val) => {
          recipeData.instructions = val;
        });

      cy.get("ol li")
        .eq(0)
        .invoke("text")
        .then((val) => {
          recipeData.firstStep = val;
        });

      cy.contains("button", "Make it your Own!").click();

      cy.then(() => {
        cy.get("#maker-input-title input").should(
          "have.value",
          `${credentials.testingAccount.userName}'s ${recipeData.title}`
        );

        cy.get("#maker-input-summary textarea")
          .invoke("val")
          .then((val) => {
            const rendered = rawHtmlRenderer(val);
            expect(rendered).to.eq(recipeData.summary);
          });

        cy.get("#maker-input-ready-in-minutes input").should(
          "have.value",
          recipeData.readyInMinutes
        );

        cy.get("#maker-input-servings input").should(
          "have.value",
          recipeData.servings
        );

        cy.get("#maker-input-ingredients input")
          .eq(0)
          .should("have.value", recipeData.firstIngredient);

        cy.get("#maker-input-instructions textarea")
          .invoke("val")
          .then((val) => {
            const rendered = rawHtmlRenderer(val);
            expect(rendered).to.eq(recipeData.instructions);
          });

        cy.get("#maker-input-steps input")
          .eq(0)
          .invoke("val")
          .then((val) => {
            const rendered = rawHtmlRenderer(val);
            expect(rendered).to.eq(recipeData.firstStep);
          });

        cy.get("#maker-input-image input").should("have.value", recipeData.src);
      });
    });
  });
}

runUnitTests();
