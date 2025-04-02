import auth from "@/utils_graphQL/auth";

class askService {
  async askForRecipe(question: string) {
    const jwtToken = auth.getToken();

    const response = await fetch("/api/ask", {
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
