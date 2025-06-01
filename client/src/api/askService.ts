import auth from "@/utils_graphQL/auth";

const API_URL = import.meta.env.VITE_API_URL;

class askService {
  async askForRecipe(question: string) {
    const jwtToken = auth.getToken();

    const response = await fetch(`${API_URL}/open/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ question: question }),
    });

    const recipe: any = await response.json();
    return recipe;
  }

  async generateComponent(component: string, recipe: Record<string, any>) {
    const jwtToken = auth.getToken();

    const response = await fetch(`${API_URL}/open/ask/component`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ component, recipe }),
    });

    const result: any = await response.json();
    return result.value;
  }
}

export default new askService();
