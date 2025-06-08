import { Router, Request, Response } from "express";
import spoonacularService from "../service/spoonacularService.js";
import { searchInput } from "../types/index.js";
import { askQuestion, generateComponent } from "../service/langChainService.js";
import edamamService from "../service/edamamService.js";

const router = Router();

// Helper function to mix recipes from both sources
function mixRecipes(spoonacularRecipes: any[], edamamRecipes: any[]) {
  const mixed = [];
  const maxLength = Math.max(spoonacularRecipes.length, edamamRecipes.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < spoonacularRecipes.length) {
      mixed.push({ ...spoonacularRecipes[i] });
    }
    if (i < edamamRecipes.length) {
      mixed.push({ ...edamamRecipes[i] });
    }
  }

  return mixed;
}

// GET /open/random/ - GET random recipes from both sources
router.get("/random", async (_req: Request, res: Response) => {
  try {
    const recipes = await spoonacularService.findRandomRecipes();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET /open/information/:source/:id - GET specific recipe information
router.get("/information/:id", async (req: Request, res: Response) => {
  // uses regular expressions to differentiat between the different ID formats:
  const edamamRegex = /^[0-9a-fA-F]{32}$/;
  const spoonacularRegex = /^\d+$/;

  try {
    const { id } = req.params;

    let information;

    if (edamamRegex.test(id)) {
      information = await edamamService.findInformation(id);
    } else if (spoonacularRegex.test(id)) {
      information = await spoonacularService.findInformation(parseInt(id));
    } else {
      res.status(400).json({ error: "Unrecognized ID value" });
    }

    if (!information) {
      res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(information);
  } catch (error) {
    res.status(500).json(error);
  }
});

// POST /open/recipes - GET specific recipe information
router.post("/recipes", async (req: Request, res: Response) => {
  try {
    const searchTerms: searchInput = req.body;

    // // Get 5 from each to make up to 10, then limit to 9 after mixing
    const spoonacularResults = await spoonacularService.findRecipes({
      ...searchTerms,
    });

    const edamamResults = await edamamService.findRecipes(searchTerms.query);

    // // Take first 5 from each
    const limitedSpoonacular = spoonacularResults.slice(0, 5);
    const limitedEdamam = edamamResults.slice(0, 5);

    const mixedResults = mixRecipes(limitedSpoonacular, limitedEdamam).slice(
      0,
      9
    );
    res.status(200).json(mixedResults);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/ask", askQuestion);
router.post("/ask/component", generateComponent);

export default router;
