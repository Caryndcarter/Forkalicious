import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation } from "@apollo/client";
import { SIGN_UP } from "@/utils_graphQL/mutations";
import Auth from "@/utils_graphQL/auth";

interface loginFormProps {
  setSignIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SignUpForm({ setSignIn }: loginFormProps) {
  const [formValues, setFormValues] = useState({
    userName: "",
    userEmail: "",
    userPassword: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  //using mutation hook
  const [signUp] = useMutation(SIGN_UP);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  // Helper function to parse GraphQL errors and provide specific messages
  const getSpecificErrorMessage = (error: any): string => {
    // Function to check for MongoDB duplicate key errors
    const parseMongoDuplicateError = (message: string): string | null => {
      if (message.includes('E11000 duplicate key error')) {
        if (message.includes('userEmail_1') || message.includes('userEmail:')) {
          return "An account with this email already exists. Please use a different email or try signing in.";
        }
        if (message.includes('userName_1') || message.includes('userName:')) {
          return "This username is already taken. Please choose a different username.";
        }
        // Generic duplicate key error
        return "An account with this information already exists. Please try different details.";
      }
      return null;
    };

    // Check if it's a GraphQL error with extensions
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      
      // First check for MongoDB duplicate key errors in the message
      if (graphQLError.message) {
        const mongoError = parseMongoDuplicateError(graphQLError.message);
        if (mongoError) {
          return mongoError;
        }
      }
      
      // Check for specific error codes or messages from your backend
      if (graphQLError.extensions?.code === 'EMAIL_EXISTS' || 
          graphQLError.message?.toLowerCase().includes('email already exists') ||
          graphQLError.message?.toLowerCase().includes('email is already registered')) {
        return "An account with this email already exists. Please use a different email or try signing in.";
      }
      
      if (graphQLError.extensions?.code === 'USERNAME_EXISTS' || 
          graphQLError.message?.toLowerCase().includes('username already exists') ||
          graphQLError.message?.toLowerCase().includes('username is already taken')) {
        return "This username is already taken. Please choose a different username.";
      }
      
      // Check for validation errors
      if (graphQLError.extensions?.code === 'VALIDATION_ERROR') {
        return graphQLError.message || "Please check your input and try again.";
      }
      
      // Return the specific GraphQL error message if available (but avoid showing raw MongoDB errors)
      if (graphQLError.message && !graphQLError.message.includes('E11000')) {
        return graphQLError.message;
      }
    }
    
    // Check the main error message for MongoDB duplicate key errors
    if (error.message) {
      const mongoError = parseMongoDuplicateError(error.message);
      if (mongoError) {
        return mongoError;
      }
    }
    
    // Check for network errors
    if (error.networkError) {
      return "Network error. Please check your connection and try again.";
    }
    
    // Fallback to generic error
    return "Failed to create an account. Please try again.";
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!checkUsername()) {
      return;
    }

    if (!checkEmail()) {
      return;
    }

    if (!checkPassword()) {
      return;
    }

    if (formValues.userPassword !== formValues.confirmPassword) {
      setErrorMessage("Your passwords do not match");
      return;
    }

    try {
      const { data } = await signUp({
        variables: {
          userName: formValues.userName,
          userEmail: formValues.userEmail,
          userPassword: formValues.userPassword,
        },
      });

      if (!data) {
        throw new Error("Something went wrong!");
      }

      const { token } = data.signUp;
      Auth.signUp(token);
    } catch (error) {
      console.error('Sign up error:', error); // For debugging
      const specificErrorMessage = getSpecificErrorMessage(error);
      setErrorMessage(specificErrorMessage);
    }
  };

  const checkEmail = () => {
    const inputEmail = formValues.userEmail;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (inputEmail === "") {
      setErrorMessage("Please enter an email.");
      return false;
    }

    if (!emailRegex.test(inputEmail)) {
      setErrorMessage("Please enter a valid email.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const checkUsername = () => {
    const inputUserName = formValues.userName;
    if (inputUserName === "") {
      setErrorMessage("Please enter a username.");
      return false;
    }

    if (inputUserName.length < 3) {
      setErrorMessage("Usernames must be longer than 3 characters.");
      return false;
    }

    if (inputUserName.length > 50) {
      setErrorMessage("Usernames must be shorter than 50 characters.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const checkPassword = () => {
    const inputPassword = formValues.userPassword;
    if (inputPassword === "") {
      setErrorMessage("Please enter a password.");
      return false;
    } else {
      setErrorMessage("");
      return true;
    }
  };

  return (
    <>
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="userName"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#a84e24]"
            placeholder="Enter your username"
            onChange={handleChange}
            onBlur={checkUsername}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Email
          </label>
          <input
            type="email"
            id="userEmail"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#a84e24]"
            placeholder="Enter your email"
            onChange={handleChange}
            onBlur={checkEmail}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="userPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#a84e24]"
            placeholder="Enter your password"
            onChange={handleChange}
            onBlur={checkPassword}
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#a84e24]"
            placeholder="Confirm your password"
            onChange={handleChange}
            onBlur={checkPassword}
          />
        </div>

        <button
          type="submit"
          id="sign-up-submit"
          className="w-full bg-[#ff9e40] text-white py-2 rounded hover:bg-[#e7890c]"
        >
          Sign Up
        </button>
        <p
          id="sign-up-error-message"
          className="text-red-500 font-medium mt-2 text-sm"
        >
          {errorMessage}
        </p>
      </form>
      <button
        id="naviate-sign-in"
        className="mt-4 text-[#ff9e40] hover:underline focus:outline-none"
        onClick={() => setSignIn(true)}
      >
        Already have an account? Sign In
      </button>
    </>
  );
}