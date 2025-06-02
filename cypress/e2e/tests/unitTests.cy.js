import credentials from "../testingAssets/accountCredentials";

export default function runUnitTests() {
  describe("The edits suceesfully fixed the issues", () => {
    it("sucessfully calls the AI generation route on editing page without a premature submit", () => {

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
        // check that the button click doesn't trigger a submit
        .click().wait(100);

      // check that clicking the copy-to-clipboard button doesn't trigger a submit
      cy.get('#editable-recipe-title button').eq(1).click();
      cy.get("#editable-recipe-image").should('exist')
    });

    it("sucessfully calls the AI generation route on maker page without a premature submit", () => {

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
        .trigger('click').wait(200);


      // check that clicking the copy-to-clipboard button doesn't trigger a submit
      cy.get('#maker-input-title button').eq(1).click();

      cy.get('#maker-input-title p').should('not.exist');

    });
  });
}

runUnitTests();
