import { Router, Request, Response } from "express";
import spoonacularService from "../service/spoonacularService.js";
import { searchInput } from "../types/index.js";
import { askQuestion } from "../service/langChainService.js";

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
    const id: number = parseInt(req.params.id);
    const information = await spoonacularService.findInformation(id);
    res.status(200).json(information);
  } catch (error) {
    res.status(500).json(error);
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

// post /open/ask
router.post("/ask", askQuestion);

export default router;
