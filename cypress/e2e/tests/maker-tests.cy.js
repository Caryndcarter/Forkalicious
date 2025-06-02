export default function runMakerTests(){
  // describe("Title tests", () => {
  //   it("Generates a title without a premature submit", () => {

  //     cy.intercept('POST', '**/open/ask/component', {
  //       "component": "Title",
  //       "value": "chochoCake"
  //     }).as('mockedAskComponentSuccess');

  //     // go to the recipe maker page:
  //     cy.visit("/");
  //     cy.get("#homepage-call-to-action").should('exist');
  //     cy.get("#nav-recipe-maker-link").click();

  //     // trigger the AI call (intercepted and replaced with default text)
  //     cy.get("#maker-input-title button")
  //       .trigger('click').wait(200);
  //     cy.get('#maker-input-title p').should('not.exist');

  //   });

  //   it("Generates a title with the correct value", () => {
  //     cy.intercept('POST', '**/open/ask/component', {
  //       "component": "Title",
  //       "value": "chochoCake"
  //     }).as('mockedAskComponentSuccess');

  //     // go to the recipe maker page:
  //     cy.visit("/");
  //     cy.get("#homepage-call-to-action").should('exist');
  //     cy.get("#nav-recipe-maker-link").click();

  //     // trigger the AI call (intercepted and replaced with default text)
  //     cy.get("#maker-input-title button")
  //       .trigger('click').wait(200);
  //     cy.get('#maker-input-title p').should('not.exist');

  //     cy.get("#maker-input-title")
  //       .children("div")
  //       .eq(1)
  //       .find('span')
  //       .should("have.text","chochoCake");

  //   });

  //   it("Copies the title without a premature submit", () => {

  //     cy.intercept('POST', '**/open/ask/component', {
  //       "component": "Title",
  //       "value": "chochoCake"
  //     }).as('mockedAskComponentSuccess');

  //     // go to the recipe maker page:
  //     cy.visit("/");
  //     cy.get("#homepage-call-to-action").should('exist');
  //     cy.get("#nav-recipe-maker-link").click();

  //     // trigger the AI call (intercepted and replaced with default text)
  //     cy.get("#maker-input-title button")
  //       .trigger('click').wait(200);

  //     // check that clicking the copy-to-clipboard button doesn't trigger a submit
  //     cy.get('#maker-input-title button').eq(1).click();
  //     cy.get('#maker-input-title p').should('not.exist');

  //   });

  //   it("Replaces the title without a premature submit", () => {

  //     cy.intercept('POST', '**/open/ask/component', {
  //       "component": "Title",
  //       "value": "chochoCake"
  //     }).as('mockedAskComponentSuccess');

  //     // go to the recipe maker page:
  //     cy.visit("/");
  //     cy.get("#homepage-call-to-action").should('exist');
  //     cy.get("#nav-recipe-maker-link").click();

  //     // trigger the AI call (intercepted and replaced with default text)
  //     cy.get("#maker-input-title button")
  //       .trigger('click').wait(200);

  //     // validating the replace button
  //     cy.get('#maker-input-title button').eq(2).click();
  //     cy.get('#maker-input-title p').should('not.exist');

  //   });

  //   it("Replaces the title correctly", () => {

  //     cy.intercept('POST', '**/open/ask/component', {
  //       "component": "Title",
  //       "value": "chochoCake"
  //     }).as('mockedAskComponentSuccess');

  //     // go to the recipe maker page:
  //     cy.visit("/");
  //     cy.get("#homepage-call-to-action").should('exist');
  //     cy.get("#nav-recipe-maker-link").click();

  //     // trigger the AI call (intercepted and replaced with default text)
  //     cy.get("#maker-input-title button")
  //       .trigger('click').wait(200);

  //     // check that clicking the copy-to-clipboard button doesn't trigger a submit
  //     cy.get('#maker-input-title button').eq(2).click();
  //     cy.get('#maker-input-title input').should("have.value","chochoCake")

  //   });
  // });

  describe("Steps tests", () => {
    it("Generates steps without a premature submit", () => {

      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the recipe maker page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-recipe-maker-link").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#maker-input-steps button")
        .first()
        .click()
        .wait(100);
      cy.get("#editable-recipe-title").should('exist');

    });

    it("Generates steps with the correct values", () => {
      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the recipe maker page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-recipe-maker-link").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#maker-input-steps button")
        .first()
        .click().wait(100);

      cy.get("#maker-input-steps")
        .children("div")
        .eq(1)
        .find('span')
        .should("have.text","step 1;step 2;step 3");

    });

    it("Copies the steps without a premature submit", () => {

      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the recipe maker page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-recipe-maker-link").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#maker-input-steps button")
        .first()
        .trigger('click').wait(100);

      // check that clicking the copy-to-clipboard button doesn't trigger a submit
      cy.get('#maker-input-steps button').eq(1).click();
      cy.get("#editable-recipe-title").should('exist');

    });

    it("Replaces the steps without a premature submit", () => {

      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the recipe maker page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-recipe-maker-link").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#maker-input-steps button")
        .first()
        .trigger('click').wait(100);

      // validating the replace button
      cy.get('#maker-input-steps button').eq(2).click();
      cy.get("#editable-recipe-title").should('exist');

    });

    it("Replaces the steps correctly", () => {

      cy.intercept('POST', '**/open/ask/component', {
        "component": "Title",
        "value": "chochoCake"
      }).as('mockedAskComponentSuccess');

      // go to the recipe maker page:
      cy.visit("/");
      cy.get("#homepage-call-to-action").should('exist');
      cy.get("#nav-recipe-maker-link").click();

      // trigger the AI call (intercepted and replaced with default text)
      cy.get("#maker-input-steps button")
        .first()
        .trigger('click')
        .wait(100);

      // validating the replace button
      cy.get('#maker-input-steps button').eq(2).click();
      cy.get("#editable-recipe-title").should('exist');
      cy.get("#maker-input-steps li")
        .find("input")
        .should("have.value", "step 1;step 2;step 3");

    });
  });
}

runMakerTests();