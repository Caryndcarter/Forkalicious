import credentials from "../testingAssets/accountCredentials";

export function runUnitTests() {
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
  });
}

runUnitTests();
