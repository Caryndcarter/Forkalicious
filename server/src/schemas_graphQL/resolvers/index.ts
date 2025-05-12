import queries from "./queries/index.js";
import mutations from "./mutations/index.js";

const resolvers = {
  Query: queries,
  Mutation: mutations,
};

export default resolvers;
