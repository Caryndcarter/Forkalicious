import { Router, Request, Response } from "express";
import spoonacularService from "../service/spoonacularService.js";
import { searchInput } from "../types/index.js";
import { askQuestion, generateComponent } from "../service/langChainService.js";
import edamamService from "../service/edamamService.js";
import apiHealthService from "../service/apiHealthService.js";

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

// GET /open/random/ - GET random recipes from both sources with fallback
router.get("/random", async (_req: Request, res: Response) => {
  try {
    // Get recipes from both sources with individual error handling
    const [spoonacularRecipes, edamamRecipes] = await Promise.allSettled([
      spoonacularService.findRandomRecipes(6),
      edamamService.findRandomRecipes(6),
    ]);

    // Extract successful results, defaulting to empty arrays for failures
    const spoonacularResults =
      spoonacularRecipes.status === "fulfilled"
        ? Array.isArray(spoonacularRecipes.value)
          ? spoonacularRecipes.value
          : []
        : [];

    const edamamResults =
      edamamRecipes.status === "fulfilled"
        ? Array.isArray(edamamRecipes.value)
          ? edamamRecipes.value
          : []
        : [];

    // Log any failures for monitoring
    if (spoonacularRecipes.status === "rejected") {
      console.error(
        "Spoonacular API failed for random recipes:",
        spoonacularRecipes.reason
      );
    }
    if (edamamRecipes.status === "rejected") {
      console.error(
        "Edamam API failed for random recipes:",
        edamamRecipes.reason
      );
    }

    // Take first 6 from each successful source
    const limitedSpoonacular = spoonacularResults.slice(0, 6);
    const limitedEdamam = edamamResults.slice(0, 6);

    const mixedRecipes = mixRecipes(limitedSpoonacular, limitedEdamam);

    // If we have no recipes from either source, return an error
    if (mixedRecipes.length === 0) {
      console.error("Both APIs failed to provide random recipes");
      return res.status(503).json({
        error: "Recipe services temporarily unavailable",
        message:
          "Unable to fetch recipes from any source. Please try again later.",
      });
    }

    // If we only have recipes from one source, log a warning but continue
    if (limitedSpoonacular.length === 0) {
      console.warn("Only Edamam API provided random recipes");
    } else if (limitedEdamam.length === 0) {
      console.warn("Only Spoonacular API provided random recipes");
    }

    return res.status(200).json(mixedRecipes);
  } catch (error) {
    console.error("Unexpected error in random recipes endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while fetching recipes.",
    });
  }
});

// GET /open/information/:id - GET specific recipe information with enhanced error handling
router.get("/information/:id", async (req: Request, res: Response) => {
  // uses regular expressions to differentiate between the different ID formats:
  const edamamRegex = /^[0-9a-fA-F]{32}$/;
  const spoonacularRegex = /^\d+$/;

  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Recipe ID is required",
      });
    }

    let information = null;
    let apiSource = "";

    if (edamamRegex.test(id)) {
      apiSource = "Edamam";
      try {
        information = await edamamService.findInformation(id);
      } catch (edamamError) {
        console.error(`Error fetching recipe ${id} from Edamam:`, edamamError);
        return res.status(503).json({
          error: "Recipe service unavailable",
          message:
            "Unable to fetch recipe details from Edamam. Please try again later.",
        });
      }
    } else if (spoonacularRegex.test(id)) {
      apiSource = "Spoonacular";
      try {
        information = await spoonacularService.findInformation(parseInt(id));
      } catch (spoonacularError) {
        console.error(
          `Error fetching recipe ${id} from Spoonacular:`,
          spoonacularError
        );
        return res.status(503).json({
          error: "Recipe service unavailable",
          message:
            "Unable to fetch recipe details from Spoonacular. Please try again later.",
        });
      }
    } else {
      return res.status(400).json({
        error: "Invalid recipe ID format",
        message:
          "Recipe ID format not recognized. Please provide a valid recipe ID.",
      });
    }

    if (!information) {
      console.warn(`Recipe ${id} not found in ${apiSource} API`);
      return res.status(404).json({
        error: "Recipe not found",
        message:
          "The requested recipe could not be found. It may have been removed or the ID may be incorrect.",
      });
    }

    return res.status(200).json(information);
  } catch (error) {
    console.error("Unexpected error in recipe information endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      message:
        "An unexpected error occurred while fetching recipe information.",
    });
  }
});

// POST /open/recipes - Search recipes from both sources with fallback
router.post("/recipes", async (req: Request, res: Response) => {
  try {
    const searchTerms: searchInput = req.body;

    // Validate search input
    if (!searchTerms || typeof searchTerms !== "object") {
      return res.status(400).json({
        error: "Invalid search parameters",
        message: "Search parameters are required and must be a valid object.",
      });
    }

    if (
      !searchTerms.query ||
      typeof searchTerms.query !== "string" ||
      searchTerms.query.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Invalid search query",
        message: "A search query is required and must be a non-empty string.",
      });
    }

    // Get recipes from both sources with individual error handling
    const [spoonacularResults, edamamResults] = await Promise.allSettled([
      spoonacularService.findRecipes({ ...searchTerms }),
      edamamService.findRecipes(searchTerms.query.trim()),
    ]);

    // Extract successful results, defaulting to empty arrays for failures
    const spoonacularRecipes =
      spoonacularResults.status === "fulfilled"
        ? Array.isArray(spoonacularResults.value)
          ? spoonacularResults.value
          : []
        : [];

    const edamamRecipes =
      edamamResults.status === "fulfilled"
        ? Array.isArray(edamamResults.value)
          ? edamamResults.value
          : []
        : [];

    // Log any failures for monitoring
    if (spoonacularResults.status === "rejected") {
      console.error(
        "Spoonacular API failed for recipe search:",
        spoonacularResults.reason
      );
    }
    if (edamamResults.status === "rejected") {
      console.error(
        "Edamam API failed for recipe search:",
        edamamResults.reason
      );
    }

    // Take first 5 from each successful source
    const limitedSpoonacular = spoonacularRecipes.slice(0, 5);
    const limitedEdamam = edamamRecipes.slice(0, 5);

    const mixedResults = mixRecipes(limitedSpoonacular, limitedEdamam).slice(
      0,
      9
    );

    // If we have no recipes from either source, return an appropriate response
    if (mixedResults.length === 0) {
      // Check if both APIs failed vs no results found
      const bothApiFailed =
        spoonacularResults.status === "rejected" &&
        edamamResults.status === "rejected";

      if (bothApiFailed) {
        console.error("Both APIs failed for recipe search");
        return res.status(503).json({
          error: "Recipe services temporarily unavailable",
          message:
            "Unable to search recipes from any source. Please try again later.",
        });
      } else {
        // APIs worked but no results found
        return res.status(200).json({
          results: [],
          message:
            "No recipes found matching your search criteria. Try different keywords or filters.",
        });
      }
    }

    // If we only have recipes from one source, log a warning but continue
    if (
      limitedSpoonacular.length === 0 &&
      spoonacularResults.status === "rejected"
    ) {
      console.warn("Only Edamam API provided search results");
    } else if (
      limitedEdamam.length === 0 &&
      edamamResults.status === "rejected"
    ) {
      console.warn("Only Spoonacular API provided search results");
    }

    return res.status(200).json(mixedResults);
  } catch (error) {
    console.error("Unexpected error in recipe search endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while searching for recipes.",
    });
  }
});

// GET /open/health - Check API health status
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const healthStatus = apiHealthService.getHealthStatus();

    // Determine overall HTTP status based on API health
    let httpStatus = 200;
    if (!healthStatus.overall) {
      httpStatus = 503; // Service Unavailable
    } else if (
      !healthStatus.spoonacular.isHealthy ||
      !healthStatus.edamam.isHealthy
    ) {
      httpStatus = 207; // Multi-Status (partial success)
    }

    res.status(httpStatus).json({
      status: healthStatus.overall ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        spoonacular: {
          status: healthStatus.spoonacular.isHealthy ? "healthy" : "unhealthy",
          lastChecked: healthStatus.spoonacular.lastChecked,
          consecutiveFailures: healthStatus.spoonacular.consecutiveFailures,
          lastError: healthStatus.spoonacular.lastError,
        },
        edamam: {
          status: healthStatus.edamam.isHealthy ? "healthy" : "unhealthy",
          lastChecked: healthStatus.edamam.lastChecked,
          consecutiveFailures: healthStatus.edamam.consecutiveFailures,
          lastError: healthStatus.edamam.lastError,
        },
      },
      recommendations: apiHealthService.getApiRecommendations(),
    });
  } catch (error) {
    console.error("Error checking API health:", error);
    res.status(500).json({
      status: "error",
      message: "Unable to check API health status",
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /open/health/check - Force immediate health check
router.get("/health/check", async (_req: Request, res: Response) => {
  try {
    const healthStatus = await apiHealthService.checkAllApisNow();

    let httpStatus = 200;
    if (!healthStatus.overall) {
      httpStatus = 503;
    } else if (
      !healthStatus.spoonacular.isHealthy ||
      !healthStatus.edamam.isHealthy
    ) {
      httpStatus = 207;
    }

    res.status(httpStatus).json({
      status: healthStatus.overall ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      message: "Health check completed",
      services: {
        spoonacular: {
          status: healthStatus.spoonacular.isHealthy ? "healthy" : "unhealthy",
          lastChecked: healthStatus.spoonacular.lastChecked,
          consecutiveFailures: healthStatus.spoonacular.consecutiveFailures,
          lastError: healthStatus.spoonacular.lastError,
        },
        edamam: {
          status: healthStatus.edamam.isHealthy ? "healthy" : "unhealthy",
          lastChecked: healthStatus.edamam.lastChecked,
          consecutiveFailures: healthStatus.edamam.consecutiveFailures,
          lastError: healthStatus.edamam.lastError,
        },
      },
      recommendations: apiHealthService.getApiRecommendations(),
    });
  } catch (error) {
    console.error("Error performing immediate health check:", error);
    res.status(500).json({
      status: "error",
      message: "Unable to perform health check",
      timestamp: new Date().toISOString(),
    });
  }
});

router.post("/ask", askQuestion);
router.post("/ask/component", generateComponent);

export default router;
