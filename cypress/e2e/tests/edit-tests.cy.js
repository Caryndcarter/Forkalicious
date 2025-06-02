import credentials from "../testingAssets/accountCredentials";

export default function runEditTests() {
  describe("Title tests", () => {
    it("Generates a title without a premature submit", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');
      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-recipe-title button")
        .click().wait(100);
      cy.get("#editable-recipe-title").should('exist');
    });

    it("Generates a title with the correct value", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-recipe-title button")
        .click().wait(100);

      cy.get("#editable-recipe-title")
        .children("div")
        .eq(1)
        .find('span')
        .should("have.text","chochoCake");
    });

    it("Copies the title without a premature submit", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-recipe-title button")
        // check that the button click doesn't trigger a submit
        .trigger('click').wait(100);

      // check that clicking the copy-to-clipboard button doesn't trigger a submit
      cy.get('#editable-recipe-title button').eq(1).click();
      cy.get("#editable-recipe-title").should('exist')
    });

    it("Replaces the title without a premature submit", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-recipe-title button")
        .trigger('click').wait(100);

      // validating the replace button
      cy.get('#editable-recipe-title button').eq(2).click();
      cy.get("#editable-recipe-title").should('exist');
    });

    it("Correctly replaces the title", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-recipe-title button")
        .trigger('click').wait(100);

      // validating the replace button
      cy.get('#editable-recipe-title button').eq(2).click();
      cy.get("#editable-recipe-title").should('exist');
      cy.get("#editable-recipe-title input").should("have.value", "chochoCake")
    });
  });

  describe("Steps tests", () => {
    it("Generates steps without a premature submit", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "step 1;step 2;step 3"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-steps button")
        .first()
        .click()
        .wait(100);
      cy.get("#editable-recipe-title").should('exist');
    });

    it("Generates steps with the correct values", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "step 1;step 2;step 3"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-steps button")
        .first()
        .click().wait(100);

      cy.get("#editable-steps")
        .children("div")
        .eq(1)
        .find('span')
        .should("have.text","step 1;step 2;step 3");
    });

    it("Copies the steps without a premature submit", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "step 1;step 2;step 3"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-steps button")
        .first()
        .trigger('click').wait(100);

      // check that clicking the copy-to-clipboard button doesn't trigger a submit
      cy.get('#editable-steps button').eq(1).click();
      cy.get("#editable-recipe-title").should('exist');
    });

    it("Replaces the steps without a premature submit", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "step 1;step 2;step 3"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-steps button")
        .first()
        .trigger('click').wait(100);

      // validating the replace button
      cy.get('#editable-steps button').eq(2).click();
      cy.get("#editable-recipe-title").should('exist');
    });

    it("Correctly replaces the steps", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "step 1;step 2;step 3"
      }).as('mockedAskComponentSuccess');

      // go to the account page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-account-link").click();

      // login
      cy.get("#userEmail").type(credentials.testingAccount.email);
      cy.get("#userPassword").type(credentials.testingAccount.password);
      cy.get("#sign-in-submit").click();

      // check that it redirected to the home page
      cy.get("#homepage-call-to-action").should('exist');

      // navigate to editing seciton
      cy.get("#nav-recipe-book-link").click();
      cy.get("#saved-recipes Button").click();
      cy.get("#edit-button").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#editable-steps button")
        .first()
        .trigger('click')
        .wait(100);

      // validating the replace button
      cy.get('#editable-steps button').eq(2).click();
      cy.get("#editable-recipe-title").should('exist');
      cy.get("#editable-steps li")
        .find("input")
        .should("have.value", "step 1;step 2;step 3");
    });
  })
}

runEditTests();