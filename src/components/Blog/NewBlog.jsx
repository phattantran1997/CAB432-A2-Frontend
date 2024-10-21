import React, { useState, useEffect } from "react";
import { createBlog } from "../../reducers/blogReducer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setNotification } from "../../reducers/notificationReducer";
import { TextInput, Label, Textarea, Button } from "flowbite-react";
import BlogFooter from "./BlogFooter";
import axios from "axios";

const NewBlog = () => {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [tempFileName, setTempFileName] = useState(null);
  const [videos, setVideos] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users); // Get the user data from Redux

  const userId = user ? user.user : null; // Extract userId (sub) from user token

  useEffect(() => {
    if (location.state && location.state.videos && userId) {
      const fetchPresignedUrls = async () => {
        try {
       
          setVideos(location.state.videos.map((video) => video.videoId));
          const videosContent = videos.join("\n");
          const newContent = `VideoIds: will share:\n${videosContent}`;
          setNewContent(newContent);
        } catch (error) {
          console.error('Error fetching presigned URLs:', error);
        }
      };

      fetchPresignedUrls();
    }
  }, [location.state, userId]);

  const handleBlogSubmit = async (event) => {
    event.preventDefault();

    try {
      const blogObject = {
        title: newTitle,
        content: newContent,
        videos: videos,
        dateCreated: new Date(),
        userId: userId
      };
      // Dispatch action to create the blog
      await dispatch(createBlog(blogObject));

      // Reset form fields and notify the user
      setNewContent("");
      setNewTitle("");
      navigate("/home");

      dispatch(setNotification({
        message: `Post was successfully added`,
        type: "success",
      }, 2500));
    } catch (error) {
      console.error('Error while adding post:', error);
      dispatch(setNotification({
        message: `Cannot add post`,
        type: "failure",
      }, 2500));
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_BE_SIDE_URL}/video/upload/temp`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          console.log("Video uploaded to temp successfully:", response.data);
          setTempFileName(response.data.fileName);
        }
        else{
          console.error("Error upload video to temp folder:", response.data);
        }
      } catch (error) {
        console.error("Error uploading video:", error.response?.data?.message || error.message);
      }
    }
  };

  const handleUploadToS3 = async () => {
    if (!tempFileName) return;

    try {
      const response = await axios.post(`${import.meta.env.VITE_BE_SIDE_URL}/video/upload/s3`, {
        userId: userId.sub,
        fileName: tempFileName,
      });
      setTempFileName(null);

      if (response.status === 200) {
        console.log("Video uploaded to S3 successfully:", response.data);
        setNotification({ message: 'Video uploaded to S3 successfully.', type: 'success' });
        setVideos((prevVideos) => [
          ...prevVideos, response.data.videoId
        ]);
      }
    } catch (error) {
      console.error("Error uploading video to S3:", error.response?.data?.message || error.message);
    }
  };

  const handleCancelUpload = () => {
    setTempFileName(null);
  };

  return (
    <>
      <div className="">
        <main className="pt-8 pb-16 lg:pt-16 lg:pb-12 bg-gray-50 min-h-screen">
          <div className="flex justify-between px-4 mx-auto max-w-6xl">
            <article className="mx-auto w-full max-w-6xl format format-sm sm:format-base lg:format-lg format-blue">
              <header className="mb-4 lg:mb-6 not-format">
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl">
                  Create a Post
                </h1>
              </header>
              <form onSubmit={handleBlogSubmit} className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="post-title" value="Title of Post" />
                  </div>
                  <TextInput
                    id="post-title"
                    type="text"
                    placeholder="An Amazing Post"
                    required={true}
                    value={newTitle}
                    onChange={({ target }) => setNewTitle(target.value)}
                    className="!bg-gray-50 border border-gray-300 !text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition duration-200 ease-in-out"
                    style={{ backgroundColor: '#f9fafb', color: '#1f2937' }} />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="post-content" value="Content of Post" />
                  </div>
                  <Textarea
                    required={true}
                    value={newContent}
                    placeholder="Text"
                    onChange={({ target }) => setNewContent(target.value)}
                    rows={10}
                    className="!bg-gray-50 border border-gray-300 !text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition duration-200 ease-in-out"
                    style={{ backgroundColor: '#f9fafb', color: '#1f2937' }}
                  />
                </div>
                {/* Video Upload Section */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="video-upload" value="Upload Video" />
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {/* Show Upload to S3 and Cancel button if file is uploaded to temp */}
                  {tempFileName && (
                    <div className="flex gap-4 mt-4">
                      <Button onClick={handleUploadToS3} className="bg-green-500 text-white hover:bg-green-600">
                        Upload to S3
                      </Button>
                      <Button onClick={handleCancelUpload} className="bg-red-500 text-white hover:bg-red-600">
                        Cancel Upload
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  {videos.map((video, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{video}</h3>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                    Submit Post
                  </Button>
                </div>
              </form>
            </article>
          </div>
        </main>
      </div>
      <BlogFooter />
    </>
  );
};

export default NewBlog;
