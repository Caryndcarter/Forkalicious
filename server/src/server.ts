import express from "express";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

//PostgreSQL
//import sequelize from "./config/connection.js";
import routes from "./routes/index.js";

// MongoDB and GraphQL
import db from "./config/connection_mongo.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas_graphQL/index.js";
//import { GraphQLError } from "graphql";
 
//Authentication Middleware
import { authenticateToken as graphQLAuthMiddleware } from "./middleware/auth_graphQL.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Apollo Server for GraphQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  //context: ({ req }: { req: Request }) => graphQLAuthMiddleware({ req }), 
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return error;
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files for the client
app.use(express.static(path.join(__dirname, "../../client/dist")));

//create Apollo Server
const startApolloServer = async () => {
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
       context: graphQLAuthMiddleware,
    })
  );
};

// Start servers
const startServers = async () => {
  // Start GraphQL Server
  await startApolloServer();

  // Use your custom routes
  app.use(routes);

  // Default fallback route for client
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });

  // MongoDB Connection Error Handling
  db.on("error", console.error.bind(console, "MongoDB connection error:"));


  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
   
};

startServers();
