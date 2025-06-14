// server/src/service/apiHealthService.ts
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

interface ApiStatus {
  isHealthy: boolean;
  lastChecked: Date;
  consecutiveFailures: number;
  lastError?: string;
}

interface HealthCheckResult {
  spoonacular: ApiStatus;
  edamam: ApiStatus;
  overall: boolean;
}

class ApiHealthService {
  private spoonacularStatus: ApiStatus = {
    isHealthy: true,
    lastChecked: new Date(),
    consecutiveFailures: 0,
  };

  private edamamStatus: ApiStatus = {
    isHealthy: true,
    lastChecked: new Date(),
    consecutiveFailures: 0,
  };

  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly RECOVERY_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes for unhealthy APIs

  constructor() {
    // Start periodic health checks
    this.startHealthChecks();
  }

  private startHealthChecks() {
    // Check healthy APIs every 5 minutes
    setInterval(() => {
      this.performHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL);

    // Check unhealthy APIs more frequently for recovery
    setInterval(() => {
      this.performRecoveryChecks();
    }, this.RECOVERY_CHECK_INTERVAL);
  }

  private async performHealthChecks() {
    if (this.spoonacularStatus.isHealthy) {
      await this.checkSpoonacularHealth();
    }
    if (this.edamamStatus.isHealthy) {
      await this.checkEdamamHealth();
    }
  }

  private async performRecoveryChecks() {
    if (!this.spoonacularStatus.isHealthy) {
      await this.checkSpoonacularHealth();
    }
    if (!this.edamamStatus.isHealthy) {
      await this.checkEdamamHealth();
    }
  }

  private async checkSpoonacularHealth(): Promise<boolean> {
    try {
      const baseURL = process.env.API_BASE_URL;
      const apiKey = process.env.SPOONACULAR_API_KEY;

      if (!baseURL || !apiKey) {
        this.updateApiStatus("spoonacular", false, "Missing configuration");
        return false;
      }

      // Simple health check - get a random recipe
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `${baseURL}/recipes/random?number=1&apiKey=${apiKey}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "Dockalicious-Recipe-App/1.0",
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        this.updateApiStatus("spoonacular", true);
        return true;
      } else {
        this.updateApiStatus("spoonacular", false, `HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      this.updateApiStatus(
        "spoonacular",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }

  private async checkEdamamHealth(): Promise<boolean> {
    try {
      const baseURL = process.env.EDAMAM_BASE_URL || "https://api.edamam.com";
      const appId = process.env.EDAMAM_APP_ID;
      const appKey = process.env.EDAMAM_APP_KEY;

      if (!appId || !appKey) {
        this.updateApiStatus("edamam", false, "Missing configuration");
        return false;
      }

      // Simple health check - search for a common term
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `${baseURL}/api/recipes/v2?type=public&field=uri&q=chicken&app_id=${appId}&app_key=${appKey}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "Dockalicious-Recipe-App/1.0",
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        this.updateApiStatus("edamam", true);
        return true;
      } else {
        this.updateApiStatus("edamam", false, `HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      this.updateApiStatus(
        "edamam",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }

  private updateApiStatus(
    api: "spoonacular" | "edamam",
    isHealthy: boolean,
    error?: string
  ) {
    const status =
      api === "spoonacular" ? this.spoonacularStatus : this.edamamStatus;

    status.lastChecked = new Date();

    if (isHealthy) {
      if (!status.isHealthy) {
        console.log(
          `${api} API recovered after ${status.consecutiveFailures} failures`
        );
      }
      status.isHealthy = true;
      status.consecutiveFailures = 0;
      delete status.lastError;
    } else {
      status.consecutiveFailures++;
      status.lastError = error;

      if (status.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        if (status.isHealthy) {
          console.error(
            `${api} API marked as unhealthy after ${status.consecutiveFailures} consecutive failures`
          );
        }
        status.isHealthy = false;
      }
    }
  }

  public getHealthStatus(): HealthCheckResult {
    return {
      spoonacular: { ...this.spoonacularStatus },
      edamam: { ...this.edamamStatus },
      overall: this.spoonacularStatus.isHealthy || this.edamamStatus.isHealthy,
    };
  }

  public isSpoonacularHealthy(): boolean {
    return this.spoonacularStatus.isHealthy;
  }

  public isEdamamHealthy(): boolean {
    return this.edamamStatus.isHealthy;
  }

  public isAnyApiHealthy(): boolean {
    return this.spoonacularStatus.isHealthy || this.edamamStatus.isHealthy;
  }

  public areBothApisHealthy(): boolean {
    return this.spoonacularStatus.isHealthy && this.edamamStatus.isHealthy;
  }

  // Manual health check methods for immediate status verification
  public async checkSpoonacularHealthNow(): Promise<boolean> {
    return await this.checkSpoonacularHealth();
  }

  public async checkEdamamHealthNow(): Promise<boolean> {
    return await this.checkEdamamHealth();
  }

  public async checkAllApisNow(): Promise<HealthCheckResult> {
    await Promise.all([
      this.checkSpoonacularHealth(),
      this.checkEdamamHealth(),
    ]);
    return this.getHealthStatus();
  }

  // Get recommendations for API usage based on health status
  public getApiRecommendations(): {
    preferSpoonacular: boolean;
    preferEdamam: boolean;
    useFailover: boolean;
    skipUnhealthy: boolean;
  } {
    const spoonacularHealthy = this.isSpoonacularHealthy();
    const edamamHealthy = this.isEdamamHealthy();

    return {
      preferSpoonacular: spoonacularHealthy && !edamamHealthy,
      preferEdamam: edamamHealthy && !spoonacularHealthy,
      useFailover: spoonacularHealthy || edamamHealthy,
      skipUnhealthy: !spoonacularHealthy || !edamamHealthy,
    };
  }
}

export default new ApiHealthService();
