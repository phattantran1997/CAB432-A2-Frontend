import React, { useState } from "react";
import QRCode from "react-qr-code";
import { setNotification } from "../../reducers/notificationReducer";
import loginService from "../../services/login";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const MfaSetupForm = () => {
  const location = useLocation();
  const { username, session, challengeName } = location.state || {}; // Destructure the values from state
  const [secretCode, setSecretCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [newSession, setNewSession] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMfaSetup = async () => {
    try {
      const response = await loginService.mfaSetup({ session });
      setSecretCode(response.secretCode);
      setNewSession(response.session);
    } catch (exception) {
      console.log(exception);
      dispatch(setNotification({ message: "MFA setup failed", type: "error" }, 2500));
    }
  };

  const handleMfaVerification = async (event) => {
    event.preventDefault();
    try {
      const response = await loginService.verifyMfa({ username, mfaCode, session: newSession, challengeName });

      // Check for status 200 in the response to ensure MFA was successful
      if (response.status === 200) {
        // Show success notification
        dispatch(setNotification({ message: "MFA setup verified successfully. Please log in to continue.", type: "success" }, 2500));

        // Navigate to the login page to prompt the user to log in
        navigate("/login");
      } else {
        // Handle other status codes or error conditions
        dispatch(setNotification({ message: "MFA verification failed", type: "error" }, 2500));
      }
    } catch (exception) {
      // Log exception and show error notification
      console.error("MFA verification error:", exception);
      dispatch(setNotification({ message: "MFA verification failed", type: "error" }, 2500));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:max-w-md">
        <button 
          onClick={handleMfaSetup} 
          className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Setup MFA
        </button>
        {secretCode && (
          <div className="mt-4">
            <p>
              Enter this secret into your Authenticator app: <strong>{secretCode}</strong>
            </p>
            <p>Or scan this QR code:</p>
            <QRCode value={`otpauth://totp/${username}?secret=${secretCode}&issuer=VideoUtilise`} />
            <p>After setting it up, enter the code below to verify.</p>
            <form onSubmit={handleMfaVerification}>
              <input
                type="text"
                value={mfaCode}
                onChange={({ target }) => setMfaCode(target.value)}
                placeholder="Enter MFA Code"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                required
              />
              <button className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                Verify MFA
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MfaSetupForm;
