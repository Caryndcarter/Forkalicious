import login from "../utils/login";
import createRecipe from "../utils/createRecipe";


export function runP2PTests() {
  describe("The page works as it did before the edits", () => {

    it("Logs in", () => {
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      login();
    });

    it("Lets you use the recipe maker", () => {
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      createRecipe();
    });

    it("Lets you save a recipe", () => {

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      login();
      cy.wait(200);
      createRecipe();

      // intercept "create recipe" request, to avoid clogging the database
      cy.intercept('POST', '/graphql', (req) => {
        const { body } = req;

        if (body.operationName === 'createRecipe') {
          req.reply({
            data: {
              createRecipe: {
                _id: 'fake-id-123'
              }
            }
          });
        }
      }).as('createRecipe');

      // create the recipe
      cy.contains('button', 'Create Recipe').click();
      cy.wait('@createRecipe').then((interception) => {
        // Assert the GraphQL operation was correct
        expect(interception.request.body.operationName).to.eq('createRecipe');

        // Assert the response was mocked as expected
        expect(interception?.response?.body.data.createRecipe._id).to.eq('fake-id-123');
      });
    });

    it("Saves recipe fields using local storage", () => {
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');

      createRecipe();
      cy.wait(200).get("#nav--link").click();

      cy.wait(200).get("#nav-recipe-maker-link").click();

      // verify recipe:
      cy.get("#maker-input-title input").should('have.value', 'title');
      cy.get("#maker-input-summary textarea").should('have.value', 'summary');
      cy.get("#maker-input-ready-in-minutes input").should('have.value', '30');
      cy.get("#maker-input-servings input").should('have.value', '7');
      cy.get("#maker-input-ingredients input").eq(0).should('have.value', '1 cup lettuce');
      cy.get("#maker-input-ingredients input").eq(1).should('have.value', '2 tsp salt');
      cy.get("#maker-input-instructions textarea").should('have.value', 'instructions');
      cy.get("#maker-input-steps input").eq(0).should('have.value', 'step 1');
      cy.get("#maker-input-steps input").eq(1).should('have.value', 'step 2');
      cy.get("#maker-input-image input").should('have.value', 'https://restaurants.com');

    })
  });
}

runP2PTests();
