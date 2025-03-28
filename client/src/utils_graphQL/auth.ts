// use this to decode a token and get the user's information out of it
import { jwtDecode } from "jwt-decode";
import { DietaryNeeds, profile } from "../types/index.js";
import localStorageService from "./localStorageService.js";

interface UserToken {
  name: string;
  exp: number;
}

// create a new class to instantiate for a user
class AuthService {
  getToken() {
    return localStorageService.getIDToken();
  }

  getProfile() {
    const payLoad: any = jwtDecode(this.getToken() || "");
    return payLoad?.data as profile;
  }

  loggedIn() {
    try {
      const token = this.getToken();

      if (!token) {
        return false;
      }

      if (this.isTokenExpired(token)) {
        this.logout();
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  isTokenExpired(token: string) {
    const decoded = jwtDecode<UserToken>(token);
    if (decoded.exp < Date.now() / 1000) {
      return true;
    }

    return false;
  }

  signUp(idToken: string) {
    localStorageService.setIDToken(idToken);

    window.location.assign("/");
  }

  login(idToken: string, diet: DietaryNeeds) {
    localStorageService.setIDToken(idToken);

    localStorageService.setAccountDiet(diet);

    window.location.assign("/");
  }

  logout() {
    localStorageService.cleanLocalStorage();

    window.location.reload();
  }
}

export default new AuthService();
