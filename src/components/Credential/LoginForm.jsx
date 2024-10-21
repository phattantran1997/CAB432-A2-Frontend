import React, { useState } from "react";
import loginService from "../../services/login";
import { useDispatch } from "react-redux";
import { setUser } from "../../reducers/userReducer";
import { setNotification } from "../../reducers/notificationReducer";
import { useNavigate } from "react-router-dom";
import Forum from "@mui/icons-material/Forum";
import MfaVerificationForm from "./MfaVerificationForm";
import axios from 'axios';

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [session, setSession] = useState("");
  const [challengeName, setChallengeName] = useState(""); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await loginService.login({ username, password });
      if (response.mfaType === 'MFA_SETUP') {
        setChallengeName("MFA_SETUP");
        setSession(response.session);
        navigate("/login/setupmfa", { state: { username, session: response.session, challengeName: "MFA_SETUP" } });
      } else if (response.mfaType === 'SOFTWARE_TOKEN_MFA') {
        setChallengeName("SOFTWARE_TOKEN_MFA");
        setMfaRequired(true);
        setSession(response.session);
      } else {
        window.localStorage.setItem("AKAppSessionID", JSON.stringify(response));
        dispatch(setUser(response));
        navigate("/home");
      }
    } catch (exception) {
      dispatch(setNotification({ message: "Wrong credentials", type: "error" }, 2500));
    }
  };

  // Redirect to Cognito Hosted UI for Google login
  const handleGoogleLogin = async () => {
    const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/ssm/paramter?parameter=CognitoHostedUI`);
    if (response.status === 200) {
      const value = response.data;
      window.location.href = value;
    }
  };

  return (
    <>
      <section className="bg-white">
        <div className="flex flex-col items-center justify-center pt-36 pb-44">
          <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
            <Forum className="mr-3 h-6 sm:h-9" />
            Video Utilise
          </a>
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Sign in to your account
              </h1>

              {/* Regular login form */}
              {!mfaRequired && (
                <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">
                      Your username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      onChange={({ target }) => setUsername(target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      onChange={({ target }) => setPassword(target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                      required
                    />
                  </div>
                  <button className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    Sign in
                  </button>
                  <button
                    type="button"
                    className="w-full text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4"
                    onClick={handleGoogleLogin}
                  >
                    Sign in with Google
                  </button>
                  <p className="text-sm font-light text-gray-500">
                    Don’t have an account yet?{" "}
                    <a href="/register" className="font-medium text-primary-600 hover:underline">
                      Sign up
                    </a>
                  </p>
                </form>
              )}

              {mfaRequired && (
                <MfaVerificationForm username={username} session={session} challengeName={challengeName} />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignIn;
