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
    // Log environment variables (without sensitive values)
    console.log('Environment check:', {
      hasJwtSecret: !!process.env.JWT_SECRET_KEY,
      hasSpoonacularKey: !!process.env.SPOONACULAR_API_KEY,
      apiBaseUrl: process.env.API_BASE_URL,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasMongoUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    });

    console.log('Starting Apollo Server...');
    await server.start();
    console.log('Apollo Server started successfully');

    console.log('Attempting MongoDB connection...');
    await db.once('open', () => {
      console.log('MongoDB connected successfully');
    });

    // Mount GraphQL middleware
    console.log('Mounting GraphQL middleware...');
    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: graphQLAuthMiddleware,
      })
    );
    console.log('GraphQL middleware mounted');

    // Use your custom routes
    console.log('Mounting custom routes...');
    app.use(routes);
    console.log('Routes mounted successfully');

    // Log all registered routes
    console.log('Registered routes:');
    app._router.stack.forEach((r: any) => {
      if (r.route && r.route.path) {
        console.log(`- ${r.route.path}`);
      }
    });

  } catch (error) {
    console.error('Server initialization error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

let serverInitialized = false;

export const handler = async (event: APIGatewayProxyEvent, context: Context, callback: any) => {
  try {
    console.log('Lambda invocation started');
    console.log('Event:', {
      path: event.path,
      method: event.httpMethod,
      headers: event.headers,
      queryParams: event.queryStringParameters,
      body: event.body ? JSON.parse(event.body) : null
    });
    
    if (!serverInitialized) {
      console.log('Server not initialized, starting initialization...');
      await initializeServer();
      serverInitialized = true;
      console.log('Server initialization completed');
    }

    console.log('Creating serverless express handler...');
    const handler = serverlessExpress({ app });
    console.log('Delegating to serverless express...');
    return await handler(event, context, callback);  
  } catch (error: any) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error?.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
