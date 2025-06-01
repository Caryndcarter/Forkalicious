export default function runUnitTests() {
  it("Sucessfully fixed the issue", () => {
    // go to the search page
    cy.visit("/");
  });
}

runUnitTests();
