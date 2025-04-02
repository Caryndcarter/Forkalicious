import UserLogin from "../types/UserLogin";
import { getAccountInformation } from "./usersAPI";

class AuthService {
  login = async (userInfo: UserLogin) => {
    try {
      const response = await fetch("auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message}`);
      }

      const data = await response.json();
      console.log(data);
      localStorage.setItem("id_token", data.token);
      window.location.assign("/");
      return data;
    } catch (error) {
      return { error: error };
    }
  };

  signUp = async (userInfo: UserLogin) => {
    try {
      const response = await fetch("auth/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message}`);
      }

      const data = await response.json();
      localStorage.setItem("id_token", data.token);
      window.location.assign("/");
      return data;
    } catch (error) {
      return { error: error };
    }
  };

  // Check if the user is logged in by retrieving the token from localStorage
  loggedIn = async () => {
    const response = await getAccountInformation();

    if (response.status === 403) {
      return false;
    } else if (response.status === 200) {
      return true;
    } else {
      console.log("error!");
      return false;
    }
  };

  // Retrieve the JWT token from localStorage
  getToken(): string {
    const loggedUser = localStorage.getItem("id_token") || "";
    return loggedUser;
  }

  // Remove the JWT token from localStorage and redirect to the home page
  logout() {
    localStorage.removeItem("id_token");
    //   window.location.assign('/account');
  }
}

const authService = new AuthService();
export { authService };
