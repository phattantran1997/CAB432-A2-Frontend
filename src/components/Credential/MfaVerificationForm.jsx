import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setNotification } from "../../reducers/notificationReducer";
import { setUser } from "../../reducers/userReducer";
import loginService from "../../services/login";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode' // import dependency

const MfaVerificationForm = ({ username, session, challengeName }) => {
    const [mfaCode, setMfaCode] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleMfaVerification = async (event) => {
        event.preventDefault();
      
        // Ensure all required fields are available before proceeding
        if (!username || !session || !mfaCode || !challengeName) {
          dispatch(setNotification({ message: "Missing required MFA information", type: "error" }, 2500));
          return;
        }
      
        try {
          // Verify MFA using the provided details
          const response = await loginService.verifyMfa({ username, session, mfaCode, challengeName });
      
          // If MFA verification succeeds, store session and tokens
          if (response.status === 200 && response.data && response.data.accessToken) {
            // Decode the JWT token to extract user information
            try {
              const user = jwtDecode(response.data.accessToken);
              
              // Check if the token contains essential fields
              if (!user || !user.sub || !user.exp) {
                throw new Error('Invalid JWT structure');
              }
      
              // Store session and user tokens
              window.localStorage.setItem("AKAppSessionID", JSON.stringify(response.data));
              dispatch(setUser({ accessToken: response.data.accessToken, user }));
      
              // Redirect to home page after successful login
              navigate("/home");
      
              // Show success notification
              dispatch(setNotification({ message: "MFA verified successfully", type: "success" }, 2500));
            } catch (decodeError) {
              console.error('Error decoding token:', decodeError);
              dispatch(setNotification({ message: "Invalid token received from server", type: "error" }, 2500));
            }
          } else {
            // Handle unexpected API responses
            dispatch(setNotification({ message: "Failed to verify MFA", type: "error" }, 2500));
          }
        } catch (exception) {
          // Handle specific errors
          if (exception.response && exception.response.status === 401) {
            dispatch(setNotification({ message: "Invalid MFA code or session expired", type: "error" }, 2500));
          } else if (exception.response && exception.response.status === 500) {
            dispatch(setNotification({ message: "Server error during MFA verification", type: "error" }, 2500));
          } else {
            dispatch(setNotification({ message: "MFA verification failed", type: "error" }, 2500));
          }
        }
      };

    return (
        <form onSubmit={handleMfaVerification} className="space-y-4 md:space-y-6">
            <div>
                <label htmlFor="mfaCode" className="block mb-2 text-sm font-medium text-gray-900">
                    Enter MFA Code
                </label>
                <input
                    type="text"
                    name="mfaCode"
                    id="mfaCode"
                    onChange={({ target }) => setMfaCode(target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    required
                />
            </div>
            <button className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                Verify MFA
            </button>
        </form>
    );
};

export default MfaVerificationForm;
