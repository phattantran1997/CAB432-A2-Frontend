import axios from "axios";

// Set base URL from environment variables
const baseUrl = import.meta.env.VITE_BE_SIDE_URL + "/blogs";

// Token variable to store the authorization token
let token = null;

// Function to set the token
const setToken = (newToken) => {
  token = `Bearer ${newToken}`;  // Capitalize "Bearer"
};

// Function to get all blogs
const getAll = async () => {
  console.log("Token used for request:", token);  // Log token for debugging
  const config = {
    headers: { Authorization: token },  // Attach token in headers
  };
  const response = await axios.get(baseUrl, config);  // Send request with config
  return response.data;
};

// Function to get a blog by ID
const getById = async (id) => {
  console.log("Token used for request:", token);  // Log token for debugging
  const config = {
    headers: { Authorization: token },  // Attach token in headers
  };
  const response = await axios.get(`${baseUrl}/${id}`, config);  // GET blog by ID
  return response.data;
};

// Function to create a new blog
const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },  // Attach token in headers
  };
  const response = await axios.post(baseUrl, newObject, config);  // POST request to create blog
  return response.data;
};

// Function to update an existing blog
const update = async (newObject) => {
  const config = {
    headers: { Authorization: token },  // Attach token in headers
  };
  const response = await axios.put(`${baseUrl}/${newObject.id}`, newObject, config);  // PUT request to update blog
  return response.data;
};

// Function to delete a blog by ID
const remove = async (id) => {
  const config = {
    headers: { Authorization: token },  // Attach token in headers
  };
  const response = await axios.delete(`${baseUrl}/${id}`, config);  // DELETE request to remove blog
  return response.data;
};

// Function to post a comment on a blog
const postComment = async (comment, id) => {
  const config = {
    headers: { Authorization: token },  // Attach token in headers
  };
  const response = await axios.post(`${baseUrl}/${id}/comments`, comment, config);  // POST comment
  return response.data;
};

// Function to refresh a pre-signed URL
const refreshPresignedUrl = async (userId, videoId) => {
  const response = await axios.get(`${baseUrl}/refresh-url/${videoId}`);  // No token needed for this?
  return response.data.newUrl;
};

// Export the service functions
export default { getAll, getById, create, update, remove, setToken, postComment, refreshPresignedUrl };
