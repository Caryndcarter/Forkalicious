import runLogInTest from "./logIn.cy";
import runPreferencesTest from "./preferences.cy";
import runSignUpTest from "./signUp.cy";
import runUserDeleteTest from "./deleteUser.cy";

export default function accountPageTests() {
  runLogInTest();
  runPreferencesTest();
  runSignUpTest();
  runUserDeleteTest();
}

accountPageTests();
