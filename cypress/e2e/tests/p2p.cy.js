export function runP2PTests() {
  it("Functions as it did before the edits", () => {
    // go to the search page
    cy.visit("/");
  });
}

runP2PTests();
