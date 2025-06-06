export function runUnitTests() {
  describe("The server seamlessly integrates Edamam API", () => {
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
  });
}

runUnitTests();
