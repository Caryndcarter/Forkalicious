import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "@/utils_graphQL/mutations";
import type { ChangeEvent, FormEvent } from "react";
import AuthService from "@/utils_graphQL/auth";
import { useNavigate } from "react-router-dom";

interface loginFormProps {
  setSignIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoginForm({ setSignIn }: loginFormProps) {
  const [formValues, setFormValues] = useState({
    userName: "",
    userPassword: "",
    userEmail: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  
  // Use React Router's navigate hook
  const navigate = useNavigate();

  // Set up mutation hook
  const [login] = useMutation(LOGIN_USER);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!checkEmail()) {
      return;
    }

    if (!checkPassword()) {
      return;
    }

    try {
      const { data } = await login({
        variables: {
          userEmail: formValues.userEmail,
          userPassword: formValues.userPassword,
        },
      });

      // Check if the token exists
      if (!data || !data.login || !data.login.token) {
        throw new Error("Login failed: Token is missing!");
      }

      const { token, user } = data.login;
      AuthService.login(token, user);
      
      // Simply navigate back to the previous page in history
      navigate(-1);
      
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Wrong password")) {
          setErrorMessage("Incorrect email or password.");
        } else if (err.message.includes("Wrong email")) {
          setErrorMessage("Incorrect email or password.");
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
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
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="text"
            id="userEmail"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#ff9e40]"
            placeholder="Enter your username"
            onChange={handleChange}
            onBlur={checkEmail}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="userPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#ff9e40]"
            placeholder="Enter your password"
            onChange={handleChange}
            onBlur={checkPassword}
          />
        </div>

        <button
          type="submit"
          id="sign-in-submit"
          className="w-full bg-[#ff9e40] text-white py-2 rounded hover:bg-[#e7890c]"
        >
          Sign In
        </button>

        <p
          id="login-error-message"
          className="text-red-500 font-medium mt-2 text-sm"
        >
          {errorMessage}
        </p>
      </form>

      <button
        id="navigate-sign-up"
        className="mt-4 text-[#ff9e40] hover:underline focus:outline-none"
        onClick={() => setSignIn(false)}
      >
        Need an account? Sign Up
      </button>
    </>
  );
}