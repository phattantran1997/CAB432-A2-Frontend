import { createSlice } from "@reduxjs/toolkit";
import blogService from "../services/blogs";

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    create(state, action) {
      const blog = action.payload;
      state.push(blog);
    },
    setBlogs(state, action) {
      return action.payload;
    },
    edit(state, action) {
      const updatedBlog = action.payload;
      return state.map((item) =>
        item.id === updatedBlog.id ? updatedBlog : item
      );
    },
    remove(state, action) {
      const id = action.payload;
      return state.filter((blogs) => blogs.id !== id);
    },
    comment(state, action) {
      const updatedBlog = action.payload;
      return state.map((item) =>
        item.id === updatedBlog.id ? updatedBlog : item
      );
    },
    setSingleBlog(state, action) {
      const blog = action.payload;
      // Check if the blog is already in the state, and update it if necessary
      const exists = state.find((item) => item.id === blog.id);
      if (exists) {
        return state.map((item) =>
          item.id === blog.id ? blog : item
        );
      } else {
        return [...state, blog];
      }
    },
  },
});

export const { create, setBlogs, edit, remove, comment, setSingleBlog } = blogSlice.actions;

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll();
    dispatch(setBlogs(blogs));
  };
};

export const createBlog = (blog) => {
  return async (dispatch) => {
    const newBlog = await blogService.create(blog);
    dispatch(create(newBlog));
  };
};

export const updateBlog = (updatedBlog) => {
  return async (dispatch) => {
    const updatedBlog1 = await blogService.update(updatedBlog);
    dispatch(edit(updatedBlog1));
  };
};

export const deleteBlog = (id) => {
  return async (dispatch) => {
    await blogService.remove(id);
    dispatch(remove(id));
  };
};

export const commentBlog = (comment, id) => {
  const formattedComment = {
    content: comment,
  };
  return async (dispatch) => {
    const response = await blogService.postComment(formattedComment, id);
    dispatch(edit(response));
  };
};


// Async action to get a blog by its ID
export const getBlogById = (id) => {
  return async (dispatch) => {
    const blog = await blogService.getById(id);
    dispatch(setSingleBlog(blog)); // Update the state with the fetched blog
  };
};

// New async action to refresh the presigned URL of a video
export const refreshVideoPresignedUrl = (blogId,userid, videoId) => {
  return async (dispatch) => {
    try {
      // Call the backend to refresh the presigned URL for the given video
      const newUrl = await blogService.refreshPresignedUrl(userid,videoId);
      dispatch(updateVideoUrl({ blogId, userid,videoId, newUrl }));
    } catch (error) {
      console.error("Error refreshing video presigned URL:", error);
    }
  };
};

export default blogSlice.reducer;
