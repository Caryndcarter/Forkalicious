import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import RecipeBook from "./pages/RecipeBook";
import RecipeShowcaseGraph from "./pages/RecipeShowcaseGraph";
import RecipeMaker from "./pages/RecipeMaker";

import { AccountPage, HomePage, SearchPage, ErrorPage } from "@/pages";

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
        element: <RecipeShowcaseGraph />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
