import credentials from "../../assets/accountCredentials";
import login from "../../utils/login";

export default function runLogInTest() {
  describe("Login page works as expected", () => {
    it("gives proper error when logging in with incorrect credentials", () => {
      cy.visit("/");

      const wrongAccount = {
        email: "wrongEmail@inccorect.com",
        password: "notCorrectPassowrd",
      };

      login(wrongAccount);

      cy.get("#login-error-message").should(
        "have.text",
        "Incorrect email or password."
      );
    });

    it("logs in when using correct credentials", () => {
      cy.visit("/");
      login(credentials.testingAccount);

      cy.get("#homepage-call-to-action").should("exist");
      cy.get("#nav-account-link span").should("have.text", "Account Settings");
    });
  });
}

runLogInTest();
