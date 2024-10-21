import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setNotification } from "../../reducers/notificationReducer";
import BlogFooter from "../Blog/BlogFooter";
import users from "../../services/users"; // API for handling registration
import Forum from "@mui/icons-material/Forum";

const RegisterUser = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState(""); // MFA code input
  const [mfaRequired, setMfaRequired] = useState(false); // Flag to check if MFA is required
  const [session, setSession] = useState(null); // Store session for MFA verification
  const navigate = useNavigate();

  const addUser = async (event) => {
    event.preventDefault();
    const newUser = { username, email, password };

    try {
      // Call your API to register the user in AWS Cognito
      const response = await users.addUser(newUser);

      if (response.mfaRequired) {
        // MFA required, set the session and show MFA input
        setMfaRequired(true);
        setSession(response.session);
        const notif1 = {
          message: `Account registered. Please enter the MFA code.`,
          type: "success",
        };
        dispatch(setNotification(notif1, 4000));
      } else {
        // Registration success, no MFA required
        const notif1 = {
          message: `Account registered. Please check your email to confirm your registration.`,
          type: "success",
        };
        dispatch(setNotification(notif1, 4000));
        setUsername("");
        setPassword("");
        navigate("/login");
      }
    } catch (error) {
      const notif2 = {
        message: `Unable to register account. Please try again later.`,
        type: "failure",
      };
      dispatch(setNotification(notif2, 4000));
    }
  };

  const verifyMfa = async (event) => {
    event.preventDefault();

    try {
      // Call your API to verify MFA code
      const response = await users.verifyMfa({ session, mfaCode });
      const notif = {
        message: `MFA verified successfully. You may now login.`,
        type: "success",
      };
      dispatch(setNotification(notif, 4000));
      navigate("/login");
    } catch (error) {
      const notif2 = {
        message: `MFA verification failed. Please try again.`,
        type: "failure",
      };
      dispatch(setNotification(notif2, 4000));
    }
  };

  return (
    <>
      <section className="bg-white">
        <div className="flex flex-col items-center justify-center pt-36 pb-56">
          <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
            <Forum className="mr-3 h-6 sm:h-9" />
            Video Utilise
          </a>
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                {mfaRequired ? "Enter MFA Code" : "Create an account"}
              </h1>

              {/* Regular Registration Form */}
              {!mfaRequired && (
                <form className="space-y-4 md:space-y-6" onSubmit={addUser}>
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">
                      Your username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={({ target }) => setUsername(target.value)}
                      id="username"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                      placeholder=""
                      required={true}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                      Your email
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={email}
                      onChange={({ target }) => setEmail(target.value)}
                      id="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                      placeholder=""
                      required={true}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={({ target }) => setPassword(target.value)}
                      id="password"
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                      required={true}
                    />
                  </div>
                  <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">
                    Create an account
                  </button>
                  <div className="mt-4 text-center">
                    <a
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition duration-200 ease-in-out"
                    >
                      Back to Login
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        <BlogFooter/>
      </section>
    </>
  );
};

export default RegisterUser;
