import { foodQueryResults } from "./assets/expectedSearchResults";

const EMAIL = "test@example.com"; // ensure this is a valid login
const PASSWORD = "test"; // ensure this is a valid login

it("Basic test runthough", () => {
  // visit the page
  cy.visit("/");

  // testing search page without logging in:
  cy.get("#toggle-dropdown-navbar").click();
  cy.get("#dropdown-search-link").click();
  cy.get("#search-input").type("food");

  // verify search results:
  cy.get("#search-results h2").each(($element, index) => {
    // wrap elements so commands can be chained
    cy.wrap($element).should("have.text", foodQueryResults[index]);
  });

  // testing search filters:
  cy.get("#filter-toggle-button").click();
  cy.get("#diet-select").select("Vegetarian");
  cy.get("#submit-search-filters").click();

  // update intolerances:
  cy.get("#filter-toggle-button").click();
  cy.get("#intolerances-select").select("Dairy");
  cy.get("#submit-search-filters").click();

  // testing showcase page without logging in:
  // click on the first recipe:
  cy.get("#search-results button").first().click();
  cy.get("#save-button-placeholder").should(
    "have.text",
    "Log in to save recipes."
  );
  cy.get("#review-button-placeholder").should(
    "have.text",
    "Log in to write a review."
  );

  // testing the login page
  // login using false credentials
  cy.get("#account-nav-button").click();
  cy.get("#userEmail").type("wrong@wrong.com");
  cy.get("#userPassword").type("wrong");
  cy.get("#sign-in-submit").click();

  // check that it gives the correct error message
  cy.get("#login-error-message").should(
    "have.text",
    "Incorrect email or password."
  );

  // login correctly:
  cy.get("#userEmail").clear().type(EMAIL);
  cy.get("#userPassword").clear().type(PASSWORD);
  cy.get("#sign-in-submit").click();

  // check that the login suceeded
  cy.location().should((location) => {
    expect(location.pathname).to.eq("/");
  });

  // log out:
  cy.get("#account-nav-button").click();
  cy.get("#log-out-button").click();

  // testing the signup page:
  cy.get("#navigate-sign-up").click();
  cy.get("#userName").click().type("sign-up-test");
  cy.get("#userEmail").click().type("signUpTest@example.com");
  cy.get("#userPassword").click().type("test");
  cy.get("#confirmPassword").click().type("test");
  // cy.get("#sign-up-submit").click();
  // this is commented out because there's no way to delete your account

  /* 
      Testing the account preferences
    */
  // login
  cy.get("#userEmail").clear().type(EMAIL);
  cy.get("#userPassword").clear().type(PASSWORD);
  cy.get("#sign-in-submit").click();
  cy.get("#account-nav-button").click();

  cy.get("#diet-select").select("Gluten Free");
  cy.get("#intolerances-select").select("Egg");

  // change account preferences:
});

// it("Lets you log in", () => {
//   // cy.visit('/');

//   // login
//   cy.get("#account-nav-button").click();
//   cy.get("#userEmail").type(EMAIL);
//   cy.get("#userPassword").type(PASSWORD);
//   cy.get("#sign-in-submit").click();

//   // check that the login suceeded
//   cy.location().should((location) => {
//     expect(location.pathname).to.eq("/");
//   });
// });
