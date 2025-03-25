type diet =
  | "Gluten Free"
  | "Ketogenic"
  | "Vegetarian"
  | "Lacto-Vegetarian"
  | "Ovo-Vegetarian"
  | "Vegan"
  | "Pescetarian"
  | "Paleo"
  | "Primal"
  | "Low FODMAP"
  | "Whole30";

const dietOptions: diet[] = [
  "Gluten Free",
  "Ketogenic",
  "Vegetarian",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "Vegan",
  "Pescetarian",
  "Paleo",
  "Primal",
  "Low FODMAP",
  "Whole30",
];

export type { diet };
export { dietOptions };
