import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import RecipeBook from "./pages/RecipeBook";
import RecipeMaker from "./pages/RecipeMaker";
import TopTenRecipes from "./pages/topTenRecipes/TopTenRecipes"; 

import {
  AccountPage,
  HomePage,
  RecipeShowcase,
  SearchPage,
  ErrorPage,
} from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "recipe-book",
        element: <RecipeBook />,
      },
      {
        path: "recipe-maker",
        element: <RecipeMaker />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
      {
        path: "recipe-showcase",
        element: <RecipeShowcase />,
      },
      {
        path: "top-recipes",
        element: <TopTenRecipes />, 
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
