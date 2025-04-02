import { Outlet } from "react-router-dom";
import "./index.css";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";

import Navbar from "@/components/navbar/";

//import Navbar from './components/Navbar';
import { createContext, useState } from "react";
import { setContext } from "@apollo/client/link/context";
import AuthService from "./utils_graphQL/auth.js";
import { RecipeDetails } from "@/types";
import ScrollToTop from "./components/ScrollToTop";
import AuthTracker from "./components/AuthTracker.js";
import { defaultRecipe } from "@/types";

// Apollo Client setup
const httpLink = createHttpLink({
  uri: "/graphql",
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  const token = AuthService.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    },
  };
});

// create the client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const currentRecipeContext = createContext({
  currentRecipeDetails: defaultRecipe,
  setCurrentRecipeDetails: (recipe: RecipeDetails) => {
    console.log(recipe);
  },
});

export const editingContext = createContext({
  isEditing: false,
  setIsEditing: (editing: boolean) => {
    console.log(editing);
  },
});

export const userContext = createContext({
  userStatus: "visiter",
  setUserStatus: (status: string) => {
    console.log(`status: ${status}`);
  },
});

function App() {
  const [currentRecipeDetails, setCurrentRecipeDetails] =
    useState<RecipeDetails>(defaultRecipe);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [userStatus, setUserStatus] = useState<string>("visiter");

  return (
    <userContext.Provider value={{ userStatus, setUserStatus }}>
      <currentRecipeContext.Provider
        value={{ currentRecipeDetails, setCurrentRecipeDetails }}
      >
        <editingContext.Provider value={{ isEditing, setIsEditing }}>
          <ApolloProvider client={client}>
            <ScrollToTop />
            <AuthTracker />
            <Navbar />
            <Outlet />
          </ApolloProvider>
        </editingContext.Provider>
      </currentRecipeContext.Provider>
    </userContext.Provider>
  );
}

export default App;
