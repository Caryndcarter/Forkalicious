import { Router, Request, Response } from "express";
import spoonacularService from "../service/spoonacularService.js";
import edamamService from "../service/edamamService.js";
import { searchInput } from "../types/index.js";
import { askQuestion, generateComponent } from "../service/langChainService.js";

const router = Router();

// Helper function to mix recipes from both sources
function mixRecipes(spoonacularRecipes: any[], edamamRecipes: any[]) {
  const mixed = [];
  const maxLength = Math.max(spoonacularRecipes.length, edamamRecipes.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < spoonacularRecipes.length) {
      mixed.push({ ...spoonacularRecipes[i], source: "spoonacular" });
    }
    if (i < edamamRecipes.length) {
      mixed.push({ ...edamamRecipes[i], source: "edamam" });
    }
  }

  return mixed;
}

// GET /open/random/ - GET random recipes from both sources
router.get("/random", async (_req: Request, res: Response) => {
  try {
    // Get 6 from each to make 12 total after mixing
    const spoonacularRecipes = await spoonacularService.findRandomRecipes();
    const edamamRecipes = await edamamService.findRandomRecipes();

    // Take first 6 from each
    const limitedSpoonacular = spoonacularRecipes.slice(0, 6);
    const limitedEdamam = edamamRecipes.slice(0, 6);

    const mixedRecipes = mixRecipes(limitedSpoonacular, limitedEdamam);
    res.status(200).json(mixedRecipes);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET /open/information/:source/:id - GET specific recipe information
router.get("/information/:source/:id", async (req: Request, res: Response) => {
  try {
    const { source, id } = req.params;
    let information;

    if (source === "spoonacular") {
      information = await spoonacularService.findInformation(parseInt(id));
    } else if (source === "edamam") {
      information = await edamamService.findInformation(id);
    } else {
      return res.status(400).json({ error: "Invalid source specified" });
    }

    if (!information) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    return res.status(200).json(information);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// POST /open/recipes - Search recipes from both sources
router.post("/recipes", async (req: Request, res: Response) => {
  try {
    const searchTerms: searchInput = req.body;

    // Get 5 from each to make up to 10, then limit to 9 after mixing
    const spoonacularResults = await spoonacularService.findRecipes({
      ...searchTerms,
      number: 5,
    });
    const edamamResults = await edamamService.findRecipes(searchTerms);

    // Take first 5 from each
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
