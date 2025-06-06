import { Router, Request, Response } from "express";
import spoonacularService from "../service/spoonacularService.js";
import { searchInput } from "../types/index.js";
import { askQuestion, generateComponent } from "../service/langChainService.js";

const router = Router();

// GET /open/random/ - GET random recipies
router.get("/random", async (_req: Request, res: Response) => {
  try {
    const recipes = await spoonacularService.findRandomRecipes();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET /open/information/:id - GET specific recipe information
router.get("/information/:id", async (req: Request, res: Response) => {
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

// POST /open/recipes - GET specific recipe information
router.post("/recipes", async (req: Request, res: Response) => {
  try {
    const searchTerms: searchInput = req.body;
    console.log(searchTerms);
    const recipes = await spoonacularService.findRecipes(searchTerms);
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/ask", askQuestion);
router.post("/ask/component", generateComponent);

export default router;
