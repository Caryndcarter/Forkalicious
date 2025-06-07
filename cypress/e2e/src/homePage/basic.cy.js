export function runBasicTests() {
  it("visits the page", () => {
    // go to the search page
    cy.visit("/");
  });
}

runBasicTests();
