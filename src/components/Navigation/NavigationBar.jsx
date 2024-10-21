import React, { useState } from "react";
import { NavLink, Navigate } from "react-router-dom"; // Import NavLink for navigation
import { useDispatch } from "react-redux";
import { setUser } from "../../reducers/userReducer";
import { useNavigate } from "react-router-dom";
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import '../Navigation/NavigationBar.css'; // Assuming custom CSS styles are here

const NavigationBar = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false); // Track dropdown visibility

  const logout = (event) => {
    if (event) event.preventDefault();
    window.localStorage.removeItem("AKAppSessionID");
    dispatch(setUser(null));
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown visibility
  };

  // If user is null, redirect to login page
  if (!user) {
    return null;
  }

  return (
    <nav className="navbar-style">
      <div className="navbar-brand">
        <VideoSettingsIcon className="icon-style" />
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          Video Ultilise
        </span>
      </div>

      <div className="navbar-links">
        <NavLink 
          to="/home" 
          className={({ isActive }) => isActive ? "link-style active" : "link-style"}>
          Home Page
        </NavLink>
        <>
          <NavLink 
            to="/post/create" 
            className={({ isActive }) => isActive ? "link-style active" : "link-style"}>
            Create Post
          </NavLink>
          <NavLink 
            to="/transcoding" 
            className={({ isActive }) => isActive ? "link-style active" : "link-style"}>
            Transcode
          </NavLink>
          <NavLink 
            to="/splitter" 
            className={({ isActive }) => isActive ? "link-style active" : "link-style"}>
            Youtube Splitter
          </NavLink>

          {/* Avatar and Dropdown Menu */}
          <div className="profile-section" onClick={toggleDropdown}>
            <img 
              src="https://flowbite.com/docs/images/people/profile-picture-2.jpg" 
              alt="User Avatar" 
              className="avatar-style"
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <NavLink 
                  to={`/users/${user.username}`} 
                  className="dropdown-item">
                  My Profile
                </NavLink>
                <div onClick={logout} className="dropdown-item">
                  Sign out
                </div>
              </div>
            )}
          </div>
        </>
      </div>
    </nav>
  );
};

export default NavigationBar;
