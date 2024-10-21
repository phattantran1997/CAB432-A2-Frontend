import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../reducers/userReducer";
import { jwtDecode } from 'jwt-decode'
import { setNotification } from "../../reducers/notificationReducer";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Extract tokens from the URL fragment (after #)
    const handleHashFragment = () => {
      const urlFragment = window.location.hash.substring(1); // Get everything after the #
      console.log('urlFragment: ' + urlFragment);
      const fragmentParams = new URLSearchParams(urlFragment);
      console.log('fragmentParams: ' + fragmentParams);
      const accessToken = fragmentParams.get('access_token');
      const idToken = fragmentParams.get('id_token');

      console.log("Extracted access token:", accessToken); // Debugging line to check the extracted value

      if (accessToken) {
        const tokenData = {
          accessToken,
          idToken,
          timestamp: new Date().getTime(),
        };
        const user = jwtDecode(accessToken);

        // Check if the token contains essential fields
        if (!user || !user.sub || !user.exp) {
          throw new Error('Invalid JWT structure');
        }

        // Store session and user tokens
        window.localStorage.setItem("AKAppSessionID", JSON.stringify(tokenData));
        dispatch(setUser({ accessToken: tokenData.accessToken, user }));
        navigate("/home");
        dispatch(setNotification({ message: "Login with provider successfully", type: "success" }, 2500));

      } else {
        console.error("Access token not found in URL.");
        navigate("/login");
      }
    };

    handleHashFragment(); // Call the function to handle the fragment
  }, [navigate, dispatch]);

  return (
    <div>
      Processing login, please wait...
    </div>
  );
};

export default AuthCallback;
