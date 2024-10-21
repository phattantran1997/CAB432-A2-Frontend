import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "flowbite-react";
import {
  getBlogById,
  updateBlog,
  deleteBlog,
  commentBlog,
  refreshVideoPresignedUrl, // New action to refresh the URL
} from "../../reducers/blogReducer";
import { setNotification } from "../../reducers/notificationReducer";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlogFooter from "./BlogFooter";
import Comment from "../Comment";

const BlogView = ({ blog, tokenLoaded }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");

  const user = useSelector((state) => state.users);

  useEffect(() => {
    if (!blog && tokenLoaded) {
      dispatch(getBlogById(id));
    }
  }, [dispatch, id, blog, tokenLoaded]);

  if (!blog) {
    return <Spinner />;
  }

  const comments = blog.comments ? blog.comments : [];

  const handleUpdateBlog = async () => {
    if (!user) {
      navigate("/login");
    }
    try {
      const updatedBlog = {
        ...blog,
        likes: blog.likes + 1,
      };
      await dispatch(updateBlog(updatedBlog));
    } catch (error) {
      dispatch(setNotification({ message: error.response.data.error, type: "error" }, 2500));
    }
  };

  const handleDeleteBlog = async () => {
    if (!user) {
      navigate("/login");
    }
    if (window.confirm(`Do you want to delete this post?`)) {
      try {
        await dispatch(deleteBlog(id));
        dispatch(setNotification({ message: "Successfully deleted post", type: "success" }, 2500));
        navigate("/home");
      } catch (error) {
        dispatch(setNotification({ message: error.message, type: "error" }, 2500));
      }
    }
  };

  const handleComment = async (comment) => {
    if (!user) {
      navigate("/login");
    }
    try {
      await dispatch(commentBlog(comment, blog.id));
      setNewComment("");
      dispatch(setNotification({ message: "Comment added successfully", type: "success" }, 2500));
    } catch (error) {
      dispatch(setNotification({ message: error.message, type: "error" }, 2500));
    }
  };

  // Handle the case when the presigned URL has expired
  const handleVideoError = async (videoId) => {
    try {
      // Refresh the presigned URL by calling the refreshVideoPresignedUrl action
      await dispatch(refreshVideoPresignedUrl(videoId));
      dispatch(setNotification({ message: "Video URL refreshed. Please try again.", type: "success" }, 2500));
    } catch (error) {
      dispatch(setNotification({ message: "Unable to refresh video URL.", type: "error" }, 2500));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white bg-gray-100">
        <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
          <article className="mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue">
            <header className="mb-4 lg:mb-6">
              <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl">
                {blog.title}
              </h1>
              <address className="flex items-center mb-6">
                <div className="inline-flex items-center mr-3 text-sm text-gray-900">
                  <div>
                    <p className="text-base font-light text-gray-500">
                      Posted on {new Date(blog.dateCreated).toLocaleDateString("en-GB")}
                    </p>
                    <p className="inline mr-2 text-sm font-light text-gray-500">
                      {blog.likes} {blog.likes === 1 ? "like" : "likes"}
                    </p>
                    <p className="inline text-sm font-light text-gray-500">
                      {comments.length} {comments.length === 1 ? "comment" : "comments"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-6">
                      <IconButton onClick={handleUpdateBlog}>
                        <FavoriteIcon className="h-6 w-6" />
                      </IconButton>
                      {user && user.user.sub === blog.userId ? (
                        <>
                          <IconButton href={`/posts/edit/${blog.id}`} color="warning">
                            <EditIcon className="h-6 w-6" />
                          </IconButton>
                          <IconButton onClick={handleDeleteBlog} color="failure">
                            <DeleteIcon className="h-6 w-6" />
                          </IconButton>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </address>
            </header>
            <p className="text-gray-500 text-lg" align="justify">
              {blog.content}
            </p>
            <br />
            <div>
              {blog.videos &&
                blog.videos.map((video, index) => (
                  <div key={index} className="mb-4">
                    <div className="font-bold mb-1">{video.title}</div>
                    <video
                      width="600"
                      controls
                      onError={() => handleVideoError(video.id)} // Handle expired presigned URL
                    >
                      <source src={video.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
            </div>
            <section className="not-format">
              <div className="flex justify-between items-center mt-8 mb-6">
                <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Discussion</h2>
              </div>
              <form
                className="mb-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment(newComment);
                }}
              >
                <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
                  <label htmlFor="comment" className="sr-only">
                    Your comment
                  </label>
                  <textarea
                    id="comment"
                    rows="6"
                    className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={({ target }) => setNewComment(target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center py-3 px-6 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md focus:ring-4 focus:ring-blue-300 hover:bg-blue-700"
                >
                  Post comment
                </button>
              </form>
              {comments.length > 0 ? (
                comments.map((comment) => <Comment key={comment.id} comment={comment} />)
              ) : (
                <article className="p-6 text-base bg-white border-t border-gray-200">
                  <footer className="flex justify-between items-center"></footer>
                  <p className="text-gray-500">No Comments Yet</p>
                </article>
              )}
            </section>
          </article>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
};

export default BlogView;
