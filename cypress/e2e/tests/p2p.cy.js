import credentials from "../testingAssets/accountCredentials";

export function runP2PTests() {
  describe("The page works as it did before the edits", () => {

    it("Logs in", () => {
      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

    });

    it("Can edit recipies", () => {

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

    });

    it("sucessfully calls the AI generation route on editing page", () => {

      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');


      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-recipe-image").scrollIntoView();
      cy.get("#editable-recipe-title button")
        .trigger('click');

      // check that it suceeded
      cy.get('#editable-recipe-title')
        .children('div')
        .eq(1)
        .find('span')
        .should('contain', 'chochoCake');

    });

    it("sucessfully calls the AI generation route on maker page", () => {

      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');


      // go to the recipe maker page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-recipe-maker-link").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#maker-input-title button")
        .trigger('click');

      cy.get("#maker-input-title")
        .children('div')
        .eq(1)
        .find('span')
        .should('contain', 'chochoCake');

    });
  });
}

runP2PTests();
