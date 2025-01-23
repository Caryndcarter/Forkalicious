import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

if (!secretKey) {
  console.error("JWT_SECRET_KEY is not defined!");
}

export const authenticateToken = ({ req }: any) => {
  // skips authentication process if loging in or signing up
  if (req.body.query.includes("login") || req.body.query.includes("addUser")) {
    return req;
  }

  // Collects token from req.body, req.query, or req.headers
  let token = req.body.token || req.query.token || req.headers.authorization;

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
    req.user = data;
  } catch (err) {
    // If the token is invalid, log an error message
    throw new GraphQLError("Invalid or expired token", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Return the request object after verifying the token
  return req;
};

export const signToken = (
  userName: string,
  userEmail: string,
  _id: unknown
) => {
  // Create a payload with the user information
  const payload = { userName, userEmail, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY; // Get the secret key from environment variables
  console.log(process.env.JWT_SECRET_KEY);
  // Sign the token with the payload and secret key, and set it to expire in 2 hours
  return jwt.sign({ data: payload }, secretKey, { expiresIn: "2h" });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ["UNAUTHENTICATED"]);
    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
