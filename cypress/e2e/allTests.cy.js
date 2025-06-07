import accountPageTests from "./src/accountPage/index.cy.js";
import homePageTests from "./src/homePage/index.cy.js";
import searchPageTests from "./src/searchPage/index.cy.js";
import showcasePageTests from "./src/showcasePage/index.cy.js";

const runAllTests = () => {
  accountPageTests();
  homePageTests();
  searchPageTests();
  showcasePageTests();
};

runAllTests();
