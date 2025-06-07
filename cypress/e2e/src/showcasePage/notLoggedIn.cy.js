export default function runShowcaseNotLoggedIn() {
  describe("Testing showcase page without logging in", () => {
    it("lets me see the showcase from the home page", () => {
      // visit the page:
      cy.visit("/");

      // find the first recipe on the home page:
      cy.get("#sample-recipies button").first().click();

      // ensure that I can't save recipes or write reviews without loggin in
      cy.get("#save-button-placeholder").should(
        "have.text",
        "Log in to save recipes."
      );
      cy.get("#review-button-placeholder").should(
        "have.text",
        "Log in to write a review."
      );
    });

    it("lets me see the showcase from the search page", () => {
      // visit the page:
      cy.visit("/");

      // navigate to the search page:
      cy.get("#toggle-dropdown-navbar").click();
      cy.get("#dropdown-search-link").click();
      cy.get("#search-input").type("food");

      // find the first recipe on the search page:
      cy.get("#search-results button").first().click();

      // ensure that I can't save recipes or write reviews without loggin in
      cy.get("#save-button-placeholder").should(
        "have.text",
        "Log in to save recipes."
      );
      cy.get("#review-button-placeholder").should(
        "have.text",
        "Log in to write a review."
      );
    });
  });
}

runShowcaseNotLoggedIn();
