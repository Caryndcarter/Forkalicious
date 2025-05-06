// server/src/lambda.ts
import express from "express";
import dotenv from "dotenv";
import { APIGatewayProxyEvent, Context} from 'aws-lambda';
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

// Add error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Add a test endpoint
app.get('/test', (_req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Lambda-specific CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Apollo-Require-Preflight, x-apollo-operation-name, x-apollo-operation-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(200).end();
  }
  next();
  return;
});

// Add request logging
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
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
  try {
    await server.start();
    console.log('Apollo Server started');

     // Mount GraphQL middleware with a custom context function
     app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => {
          try {
            // Call your authentication middleware
            const result = graphQLAuthMiddleware({ req });
            
            // Extract user data from the result
            const user = result.user || null;
            
            // Return a simple context object with just the user data
            return { user };
          } catch (error) {
            console.error('Error in context function:', error);
            return { user: null }; // Default context to avoid breaking the request
          }
        },
      })
    );

    // Use your custom routes
    app.use(routes);
    console.log('Routes mounted:', Object.keys(routes).join(', '));

    // Log all registered routes
    app._router.stack.forEach((r: any) => {
      if (r.route && r.route.path) {
        console.log('Registered route:', r.route.path);
      }
    });

    // MongoDB Connection Error Handling
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
  } catch (error) {
    console.error('Server initialization error:', error);
    throw error;
  }
};

let serverInitialized = false;

export const handler = async (event: APIGatewayProxyEvent, context: Context, callback: any) => {
  try {
    console.log('Lambda event:', JSON.stringify(event, null, 2));
    console.log('Event path:', event.path);
    console.log('Event httpMethod:', event.httpMethod);
    console.log('Event headers:', JSON.stringify(event.headers, null, 2));
    
    if (!serverInitialized) {
      console.log('Initializing server...');
      await initializeServer();
      serverInitialized = true;
      console.log('Server initialized successfully');
    }

    const handler = serverlessExpress({ app });
    return await handler(event, context, callback);  
  } catch (error: any) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error?.message || 'Unknown error occurred'
      })
    };
  }
};
