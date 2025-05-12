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
}

export default new askService();
