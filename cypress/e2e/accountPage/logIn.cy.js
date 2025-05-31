import credentials from "../testingAssets/accountCredentials";

export default function runLogInTest() {
  describe("Login page works as expected", () => {
    it("gives proper error when logging in with incorrect credentials", () => {
      // go to the account page:
      cy.visit("/");
      cy.get("#nav-account-link").click();

      // login using false credentials
      cy.get("#userEmail").type("wrong@wrong.com");
      cy.get("#userPassword").type("wrong");
      cy.get("#sign-in-submit").click();

      // check that it gives the correct error message
      cy.get("#login-error-message").should(
        "have.text",
        "Incorrect email or password."
      );
    });

    it("logs in when using correct credentials", () => {

    cy.intercept('POST', '/graphql', (req) => {
      console.log('Intercepted GraphQL operationName:', req.body.operationName); // Add this
      if (req.body.operationName === 'loginUser') {
        req.alias = 'loginGQL';
      }
    });

      // go to the account page:
      cy.visit("/");
      cy.get("#nav-account-link").click();

      // login using true credentials
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      cy.wait('@loginGQL');

    });
  });
}

runLogInTest();
