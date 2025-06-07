export default function login(account) {
  // go to the account page:
  cy.get("#nav-account-link").click();

  // login
  cy.get("#userEmail").type(account.email);
  cy.get("#userPassword").type(account.password);
  cy.get("#sign-in-submit").click();
}
