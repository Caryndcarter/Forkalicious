import credentials from "../testingAssets/accountCredentials";

export default function runSignUpTest() {
  describe("Sign up page works as expected", () => {
    it("gives error when using a duplicate email", () => {
      // go to the sign-up page:
      cy.visit("/account");
      cy.get("#navigate-sign-up").click();

      // write redundant details:
      cy.get("#userName").click().type("sign-up-test");
      cy.get("#userEmail").click().type(credentials.testingAccount.email);
      cy.get("#userPassword").click().type("test");
      cy.get("#confirmPassword").click().type("test");
      cy.get("#sign-up-submit").click();

      // check that it gives the correct error message
      cy.get("#sign-up-error-message").should(
        "have.text",
        "Failed to create an account. Please try again."
      );
    });
  });
}

runSignUpTest();
