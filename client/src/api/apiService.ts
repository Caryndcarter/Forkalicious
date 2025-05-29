import { RecipeDetails } from "@/types";
import { authService } from "./authentication";

const API_URL = import.meta.env.VITE_API_URL;

class apiService {
  async forignRecipeSearch(requestParams: any) {
    const jwtToken = authService.getToken();

    const response = await fetch(`${API_URL}/open/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(requestParams),
    });

    const recipes: any = await response.json();
    return recipes;
  }

  async forignRandomSearch() {
    const response = await fetch(`${API_URL}/open/random`);

    const recipes: any = await response.json();
    return recipes;
  }

  async forignInformationSearch(id: number) {
    const response = await fetch(`${API_URL}/open/information/${id}`);
    const information: RecipeDetails = await response.json();
    return { ...information, author: null, _id: null };
  }

  async getAccountInformation() {
    const jwtToken = authService.getToken();
    const response = await fetch(`${API_URL}/api/users/account`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    const information: any = await response.json();
    return information;
  }

  async setAccountInformation(requestParams: any) {
    const jwtToken = authService.getToken();
    const response = await fetch(`${API_URL}/api/users/account`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(requestParams),
    });

    const information: any = await response.json();
    return information;
  }
}

export default new apiService();
