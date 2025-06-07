export function runP2PTests() {
  describe("The page works as it did before the edits", () => {
    it("should retrieve information for Buttermilk Skillet Fried Chicken (ID 636574) from Spoonacular", () => {
      const expectedResponse = {
        title: "Buttermilk Skillet Fried Chicken",
        summary:
          'You can never have too many Southern recipes, so give Buttermilk Skillet Fried Chicken a try. One portion of this dish contains roughly <b>49g of protein</b>, <b>43g of fat</b>, and a total of <b>657 calories</b>. For <b>$1.36 per serving</b>, this recipe <b>covers 26%</b> of your daily requirements of vitamins and minerals. This recipe serves 4. 5 people found this recipe to be yummy and satisfying. It works well as a rather cheap main course. It is brought to you by Foodista. Head to the store and pick up egg, paprika, pepper, and a few other things to make it today. From preparation to the plate, this recipe takes about <b>45 minutes</b>. Overall, this recipe earns a <b>good spoonacular score of 66%</b>. If you like this recipe, take a look at these similar recipes: <a href="https://spoonacular.com/recipes/buttermilk-skillet-fried-chicken-1350573">Buttermilk Skillet Fried Chicken</a>, <a href="https://spoonacular.com/recipes/buttermilk-skillet-fried-chicken-1275131">Buttermilk Skillet Fried Chicken</a>, and <a href="https://spoonacular.com/recipes/favorite-buttermilk-skillet-fried-chicken-from-mastering-the-art-of-southern-cooking-149110">Favorite Buttermilk Skillet-Fried Chicken from \'Mastering the Art of Southern Cooking</a>.',
        readyInMinutes: 45,
        servings: 4,
        ingredients: [
          "2 cups buttermilk",
          "3 pounds chicken pieces : drumsticks",
          "1 tablespoon cornstarch",
          "1  egg",
          "1 tablespoon paprika",
          "1 tablespoon pepper",
          "0.25 c flour",
          "0.5 teaspoon salt",
          "4 servings vegetable oil",
        ],
        instructions:
          "<ol><li>Clean all the chicken pieces well, remove skin if desired. Using 1 tablespoon salt and  tablespoon pepper, season the chicken well all over.</li><li>In a medium bowl whisk the buttermilk, egg and  cup of water.</li><li>In a large glass baking pan mix together: flour,1 tablespoon salt,  tablespoon pepper, paprika and cornstarch. Mix well.</li><li>Dip chicken in buttermilk then on flour mixture.  shaking off any excess flour.</li><li>In a large heavy bottom skillet heat the oil to a depth of . When oil is hot but not burning add the chicken to the skillet making sure that it is not crowding the pan. Fry chicken turning with thongs so it brown evenly. About 10 to 13 minutes.</li><li>When the chicken is done place on a paper plate and serve immediately.</li></ol>",
        steps: [
          "<ol><li>Clean all the chicken pieces well, remove skin if desired",
          " Using 1 tablespoon salt and  tablespoon pepper, season the chicken well all over",
          "</li><li>In a medium bowl whisk the buttermilk, egg and  cup of water",
          "</li><li>In a large glass baking pan mix together: flour,1 tablespoon salt,  tablespoon pepper, paprika and cornstarch",
          " Mix well",
          "</li><li>Dip chicken in buttermilk then on flour mixture",
          "  shaking off any excess flour",
          "</li><li>In a large heavy bottom skillet heat the oil to a depth of ",
          " When oil is hot but not burning add the chicken to the skillet making sure that it is not crowding the pan",
          " Fry chicken turning with thongs so it brown evenly",
          " About 10 to 13 minutes",
          "</li><li>When the chicken is done place on a paper plate and serve immediately",
          "</li></ol>",
        ],
        diet: [],
        image: "https://img.spoonacular.com/recipes/636574-556x370.jpg",
        sourceUrl:
          "https://www.foodista.com/recipe/4T7XHVTV/buttermild-skillet-fried-chicken",
        spoonacularSourceUrl:
          "https://spoonacular.com/buttermilk-skillet-fried-chicken-636574",
        spoonacularId: 636574,
      };

      cy.request("GET", "/open/information/636574").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResponse);
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

    it('should confirm the first item for "chicken" query', () => {
      const requestBody = {
        query: "chicken",
      };

      const expectedFirstItem = {
        spoonacularId: 635675,
        image: "https://img.spoonacular.com/recipes/635675-312x231.jpg",
        title: "Boozy Bbq Chicken",
      };

      cy.request("POST", "/open/recipes", requestBody).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.not.be.empty;
        expect(response.body[0]).to.deep.equal(expectedFirstItem);
      });
    });

    it("should confirm search results give 9 recipes", () => {
      const requestBody = {
        query: "chicken",
      };

      cy.request("POST", "/open/recipes", requestBody).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.not.be.empty;
        expect(response.body).to.have.lengthOf(9);
      });
    });
  });
}

runP2PTests();
