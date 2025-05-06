import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { user } from "../types";

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

if (!secretKey) {
  console.error("JWT_SECRET_KEY is not defined!");
}

export const authenticateToken = ({ req }: any) => {
    // Check if we're in production (AWS)
    const isProduction = process.env.NODE_ENV === 'production';
  
    // For debugging
    console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

  // skips authentication process if loging in or signing up
  if (
    req.body.query.includes("loginUser") ||
    req.body.query.includes("signUp")
  ) {
    return isProduction ? { user: null } : req;
  }

  // Collects token from req.body, req.query, or req.headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  // check for the token's existance:
  if (!token) {
    throw new GraphQLError("Authorization token is missing", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Try to verify the token
  try {
    // If the token is valid, attach the user data to the request object
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || "");
     // In production, return a context object with the user data
    // In development, return the request object as before
    if (isProduction) {
      return { user: data };
    } else {
      req.user = data;  // Attach the user data to req
      return req;
  }
  } catch (err) {
    // If the token is invalid, log an error message
    throw new GraphQLError("Invalid or expired token", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

export const signToken = (
  userName: string,
  userEmail: string,
  _id: unknown
) => {
  // Create a payload with the user information
  const payload: user = { userName, userEmail, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY; // Get the secret key from environment variables
  // Sign the token with the payload and secret key, and set it to expire in 2 hours
  return jwt.sign({ data: payload }, secretKey, { expiresIn: "2h" });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ["UNAUTHENTICATED"]);
    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
