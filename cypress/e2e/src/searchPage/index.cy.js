import { runBasicSearches } from "./basicSearches.cy";
import { runFilterSearches } from "./filterSearches.cy";

export default function searchPageTests() {
  runBasicSearches();
  runFilterSearches();
}

searchPageTests();
