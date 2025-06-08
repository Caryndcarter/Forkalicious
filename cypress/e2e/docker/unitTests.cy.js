export function runUnitTests() {
  describe("It serves images from the Edamam API", () => {
    it("should load all images on the home page sucessfully", () => {
      cy.visit("/");

      cy.wait(10000);

      cy.get("#sample-recipies img").each(($img) => {
        const img = new Image();
        const src = $img.attr("src");

        expect(src).to.be.a("string").and.not.be.empty;

        return new Cypress.Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
          img.src = src;
        });
      });
    });

    it("should load all images on the search page sucessfully", () => {
      cy.visit("/");

      cy.get("#search-bar").type("chicken{enter}");

      cy.wait(10000);

      cy.get("#search-results img").each(($img) => {
        const img = new Image();
        const src = $img.attr("src");

        expect(src).to.be.a("string").and.not.be.empty;

        return new Cypress.Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
          img.src = src;
        });
      });
    });
  });
}

runUnitTests();
