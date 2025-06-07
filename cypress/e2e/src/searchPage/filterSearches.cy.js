import { foodVeggetarianResults } from "./../testingAssets/expectedSearchResults";

export function runFilterSearches() {
  describe("Filter tests", () => {
    it("updates the search to reflect vegetarian filter", () => {
      // go to the search page
      cy.visit("/");
      cy.get("#toggle-dropdown-navbar").click();
      cy.get("#dropdown-search-link").click();

      // type "food" into the search field:
      cy.get("#search-input").type("food");

      // update filters to include vegetarian:
      cy.get("#filter-toggle-button").click();
      cy.get("#diet-select").select("Vegetarian");
      cy.get("#submit-search-filters").click();
      cy.wait(2000); // allow for search to finish

      // verify search results:
      cy.get("#search-results h2").each(($element, index) => {
        // wrap elements so commands can be chained
        cy.wrap($element).should("have.text", foodVeggetarianResults[index]);
      });
    });

    it("adds vegetarian filter to the search", () => {
      //Go to the search page
      cy.visit("/");
      cy.get("#toggle-dropdown-navbar").click();
      cy.get("#dropdown-search-link").click();

      // update filters to include vegetarian:
      cy.get("#filter-toggle-button").click();
      cy.get("#diet-select").select("Vegetarian");
      cy.get("#submit-search-filters").click();

      // verify search results:
      cy.get("#search-input").type("food"); // type "food" after the filter is updated
      cy.wait(2000); // allow for search to finish
      cy.get("#search-results h2").each(($element, index) => {
        // wrap elements so commands can be chained
        cy.wrap($element).should("have.text", foodVeggetarianResults[index]);
      });
    });
  });
}

runFilterSearches();
