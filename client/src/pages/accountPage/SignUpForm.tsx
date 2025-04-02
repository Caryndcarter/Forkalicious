import { useState } from "react";
//import UserLogin from "../types/UserLogin";
//import { authService } from "../api/authentication";

//new imports
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

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!checkUsername) {
      return;
    }

    if (!checkEmail) {
      return;
    }

    if (!checkPassword) {
      return;
    }

    if (formValues.userPassword != formValues.confirmPassword) {
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
      setErrorMessage("Failed to create an account. Please try again.");
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
    } else {
      setErrorMessage("");
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

        {/* <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="allergies">
                    Allergies/Intolerances
                </label>
                <input
                    type="text"
                    id="allergies"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#a84e24]"
                    placeholder="List any allergies or intolerances"
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="diet">
                    Dieting (If any)
                </label>
                <input
                    type="text"
                    id="diet"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#a84e24]"
                    placeholder="Specify your diet, e.g., vegan, keto"
                />
            </div> */}
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
