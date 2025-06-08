import { exampleRecipeResponse } from "../testingAssets/recipeExample";

export function runP2PTests() {
  describe("The page works as well as it did before the edits", () => {
    it("should retrieve information for Buttermilk Skillet Fried Chicken (ID 636574) from Spoonacular", () => {
      const getURL = `/open/information/${exampleRecipeResponse.id}`;

      cy.request("GET", getURL).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(exampleRecipeResponse.recipe);
      });
    });

    it("should return random recipes with image and title as strings", () => {
      cy.request("/open/random/").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        response.body.forEach((recipe) => {
          expect(recipe).to.have.property("image");
          expect(recipe.image).to.be.a("string");
          expect(recipe).to.have.property("title");
          expect(recipe.title).to.be.a("string");
        });
      });
    });

    it("should retrieve information from Edamam", () => {
      const endpoint = "/open/information/0f8a23d14847480ceff80d20ae05101e";

      cy.request("GET", endpoint).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("title");
        expect(response.body.title).to.eq(
          "Mint Chocolate Shortbread Snowflakes"
        );
      });
    });

    it("should retrieve specific recipies from Spoonacular and Edamam", () => {
      const endpoint = "/open/recipes";

      const requestBody = {
        query: "chicken",
      };

      const spoonacularRegex = /^\d+$/;
      const edamamRegex = /^[0-9a-fA-F]{32}$/;

      cy.request("POST", endpoint, requestBody).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.length.of.at.least(2);

        cy.log(JSON.stringify(response.body[0]));
        cy.log(JSON.stringify(response.body[1]));

        const firstItem = response.body[0];
        expect(firstItem).to.have.property("spoonacularId");
        expect(firstItem.spoonacularId).to.match(spoonacularRegex);
        expect(firstItem).to.have.property("title");
        expect(firstItem.title).to.eq("Boozy Bbq Chicken");

        const secondItem = response.body[1];
        expect(secondItem).to.have.property("spoonacularId");
        expect(secondItem.spoonacularId).to.match(edamamRegex);
        expect(secondItem).to.have.property("title");
        expect(secondItem.title).to.eq("Chicken Chashu");
      });
    });

    it("should randomly retrieve from both Spoonacular and Edamam", () => {
      const endpoint = "/open/random/";
      const spoonacularRegex = /^\d+$/;
      const edamamRegex = /^[0-9a-fA-F]{32}$/;

      cy.request("GET", endpoint).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.length.of.at.least(2);

        const firstItem = response.body[0];
        expect(firstItem).to.have.property("spoonacularId");
        expect(firstItem.spoonacularId).to.match(spoonacularRegex);

        const secondItem = response.body[1];
        expect(secondItem).to.have.property("spoonacularId");
        expect(secondItem.spoonacularId).to.match(edamamRegex);
      });
    });

    it('should confirm the "chicken" query takes both spoonacular and edaman', () => {
      const requestBody = {
        query: "chicken",
      };

      const expectedFirstItem = {
        spoonacularId: 635675,
        image: "https://img.spoonacular.com/recipes/635675-312x231.jpg",
        title: "Boozy Bbq Chicken",
      };

      const expectedSecondItem = {
        spoonacularId: "fac0fed123103b648c8d6c46353cf8a5",
        title: "Chicken Chashu",
      };

      cy.request("POST", "/open/recipes", requestBody).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.not.be.empty;
        expect(response.body[0]).to.deep.equal(expectedFirstItem);

        expect(response.body[1].spoonacularId).to.equal(
          expectedSecondItem.spoonacularId
        );

        expect(response.body[1].title).to.equal(expectedSecondItem.title);
      });
    });
  });
}

runP2PTests();
