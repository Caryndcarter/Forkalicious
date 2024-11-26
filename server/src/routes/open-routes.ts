import { Router, Request, Response, } from "express";
import spoonacularService from "../service/spoonacularService.js";

const router = Router();

// GET /open/random/ - GET random recipies
router.get('/random', async (_req: Request, res: Response) => {
    try {
        const recipes = await spoonacularService.findRandomRecipes();
        res.status(200).json(recipes);
    } catch(error) {
        res.status(500).json(error);
    }
});

// GET /open/information/:id - GET specific recipe information
router.get('/information/:id', async (req: Request, res: Response) => {
    try{
        const id: number = parseInt(req.params.id);
        const information = await spoonacularService.findInformation(id);
        res.status(200).json(information);
    } catch(error) {
        res.status(500).json(error);
    }
});

export default router;