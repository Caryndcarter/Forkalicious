import { useState, useContext } from "react";
import { userContext } from "@/App";
import SignUpFormGraph from "./SignUpForm";
import LoginFormGraph from "./LoginForm";
import DashBoard from "./DashBoard";
import { Toaster } from "sonner";

const UserInfo = () => {
  const { userStatus } = useContext(userContext);
  const loggedIn = userStatus !== "visiter";
  const [signIn, setSignIn] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef3d0]">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {loggedIn ? (
          <DashBoard></DashBoard>
        ) : signIn ? (
          <LoginFormGraph setSignIn={setSignIn}></LoginFormGraph>
        ) : (
          <SignUpFormGraph setSignIn={setSignIn}></SignUpFormGraph>
        )}
      </div>
      <Toaster
        position="bottom-right"
        closeButton
        theme="light"
        toastOptions={{
          style: {
            background: "#fef3d0",
            border: "1px solid #a84e24",
            color: "#6B2A29",
          },
          duration: 4000,
        }}
      />
    </div>
  );
};

export default UserInfo;
