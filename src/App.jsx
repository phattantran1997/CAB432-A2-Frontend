import { useState, useEffect } from "react";
import Notif from "./components/Notif";
import SignIn from "./components/Credential/LoginForm";
import { useSelector, useDispatch } from "react-redux";
import { initializeBlogs } from "./reducers/blogReducer";
import { initializeUsers, setUser } from "./reducers/userReducer";
import BlogList from "./components/Blog/BlogList";
import YoutubeChapterSplitter from "./components/YoutubeSplitter/YoutubeChapterSplitter";
import { BrowserRouter as Router, Routes, Route, useMatch, Navigate, useNavigate } from "react-router-dom";
import NewBlog from "./components/Blog/NewBlog";
import NavigationBar from "./components/Navigation/NavigationBar";
import { initializeAllUsers } from "./reducers/allUsersReducer";
import BlogView from "./components/Blog/BlogView";
import UserView from "./components/UserView";
import VideoTranscoding from "./components/VideoTranscode/VideoTranscoding";
import RegisterUser from "./components/Credential/RegisterUser";
import ErrorPage from "./components/ErrorPage";
import BlogEdit from "./components/Blog/BlogEdit";
import blogService from './services/blogs';
import { jwtDecode } from 'jwt-decode';

import AuthCallback from "./components/Credential/AuthCallback";
import MfaSetupForm from "./components/Credential/MfaSetupForm";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux states
  const user = useSelector((state) => state.users);
  const blogs = useSelector((state) => state.blogs);
  const allUsers = useSelector((state) => state.allUsers);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [blogsInitialized, setBlogsInitialized] = useState(false);

  // Combined useEffect to load user, validate token, and initialize blogs
  useEffect(() => {
    const initialize = async () => {
      const loggedUser = window.localStorage.getItem("AKAppSessionID");

      if (loggedUser) {
        const parsedUser = JSON.parse(loggedUser);
        const accessToken = parsedUser.accessToken;

        if (accessToken) {
          try {
            const decodedUser = jwtDecode(accessToken);

            // Check if the token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedUser.exp < currentTime) {
              console.log("Token expired");
              window.localStorage.removeItem("AKAppSessionID");
              dispatch(setUser(null));
              navigate("/login");
              return;
            } else {
              // Token is valid
              dispatch(setUser({
                accessToken: accessToken,
                user: decodedUser,
              }));

              // Set token for API service
              blogService.setToken(accessToken);
              setTokenLoaded(true);

              // Fetch blogs after token is validated and user is authenticated
              try {
                await dispatch(initializeBlogs());
                setBlogsInitialized(true);
              } catch (error) {
                if (error.response && error.response.status === 401) {
                  console.error("Unauthorized access - token may be expired.");
                  window.localStorage.removeItem("AKAppSessionID");
                  dispatch(setUser(null));
                  navigate("/login");
                }
              }
            }
          } catch (error) {
            console.error("Failed to decode token:", error);
            window.localStorage.removeItem("AKAppSessionID");
            dispatch(setUser(null));
            navigate("/login");
          }
        } else {
          window.localStorage.removeItem("AKAppSessionID");
          dispatch(setUser(null));
          navigate("/login");
        }
      } else {
        setTokenLoaded(true);
      }
    };
    initialize();
  }, [dispatch, navigate]);

  const match = useMatch("/posts/:id");
  const match2 = useMatch("/posts/edit/:id");
  const match1 = useMatch("/users/:id");

  const blog = blogsInitialized && match ? blogs.find((blog) => blog.id === match.params.id) : null;
  const blog1 = blogsInitialized && match2 ? blogs.find((blog) => blog.id === match2.params.id) : null;
  const userInView = match1 ? allUsers.find((user) => user.username === match1.params.id) : null;

  return (
    <div>
      <NavigationBar user={user} />

      {tokenLoaded ? (
        <Routes>
          <Route path="/post/create" element={user ? <NewBlog /> : <Navigate to="/login" />} />
          <Route path="/home" element={user ? <BlogList user={user} setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/splitter" element={user ? <YoutubeChapterSplitter /> : <Navigate to="/login" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={user ? <Navigate replace to="/home" /> : <SignIn />} />
          <Route path="/login/setupmfa" element={<MfaSetupForm />} />
          <Route path="/posts/:id" element={user ? <BlogView blog={blog} tokenLoaded={tokenLoaded} /> : <Navigate to="/login" />} />
          <Route path="/users/:id" element={user ? <UserView userInView={userInView} /> : <Navigate to="/login" />} />
          <Route path="/transcoding" element={user ? <VideoTranscoding /> : <Navigate to="/login" />} />
          <Route path="/register" element={user ? <Navigate replace to="/home" /> : <RegisterUser />} />
          <Route path="/posts/edit/:id" element={user && blogsInitialized ? <BlogEdit blog={blog1} /> : <Navigate to="/login" />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      ) : (
        <div>Loading...</div>
      )}

      <Notif />
    </div>
  );
};

export default App;
