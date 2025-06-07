import credentials from "../testingAssets/accountCredentials";

export default function runPreferencesTest() {
  describe("account preferences work as expected", () => {
    it("saves your diet preference", () => {
      // go to the account page:
      cy.visit("/account");

      // login using true credentials
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      cy.contains("Save New Recipes to Your Recipe Book");

      // go back to the account page
      cy.visit("/account");

      // open the edit dialog
      cy.contains("Edit Preferences").click();

      // update diet
      cy.get("#diet-select").select("Ketogenic");

      // submit
      cy.get("#submit-search-filters").click();

      // check that the preference is updated (since no redirect, check the display)
      cy.contains("Ketogenic");
    });
  });
}

runPreferencesTest();
