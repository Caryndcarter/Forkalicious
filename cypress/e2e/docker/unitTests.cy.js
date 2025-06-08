export function runUnitTests() {
  describe("It serves images from the Edamam API", () => {
    it("", () => {
      cy.visit("/");
      cy.get("#sample-recipies img")
        .eq(1)
        .then(($img) => {
          const img = new Image();
          const src = $img.attr("src");

          expect(src).to.be.a("string").and.not.be.empty;

          return new Cypress.Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(`Image failed to load: ${src}`);
            img.src = src;
          });
        });
    });
  });
}

runUnitTests();
