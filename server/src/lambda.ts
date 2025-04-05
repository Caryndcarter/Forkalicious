// server/src/lambda.ts
import express from "express";
import dotenv from "dotenv";
import serverlessExpress from '@vendia/serverless-express';

// MongoDB and GraphQL
import db from "./config/connection_mongo.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas_graphQL/index.js";
import routes from "./routes/index.js";
import { authenticateToken as graphQLAuthMiddleware } from "./middleware/auth_graphQL.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Lambda-specific CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
  return;
});


// Apollo Server for GraphQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return error;
  },
});

// Initialize Apollo Server and set up routes
const initializeServer = async () => {
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: graphQLAuthMiddleware,
    })
  );

  // Use your custom routes
  app.use(routes);

  // MongoDB Connection Error Handling
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
};

// Initialize the server
await initializeServer();

// Export the Lambda handler
export const handler = serverlessExpress({ app });
