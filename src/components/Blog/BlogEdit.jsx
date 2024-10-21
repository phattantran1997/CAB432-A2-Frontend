import { useState } from "react";
import { updateBlog } from "../../reducers/blogReducer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setNotification } from "../../reducers/notificationReducer";
import { TextInput, Label, Button, Textarea, Spinner } from "flowbite-react";
import BlogFooter from "./BlogFooter";

const BlogEdit = ({ blog }) => {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newVideos, setnewVideos] = useState([]);

  const navigate = useNavigate();
  if (blog === undefined) {
    return <Spinner />;
  }
  if (blog && newTitle === "") {
    setNewTitle(blog.title);
    setNewContent(blog.content);
    setnewVideos(blog.videos);
  }

  const editBlog = (event) => {
    event.preventDefault();
    const blogObject = {
      ...blog,
      title: newTitle,
      content: newContent,
      videos: newVideos,
      dateCreated: new Date(),
    };
    console.log(blogObject);
    editNewBlog(blogObject);
    setNewContent("");
    setNewTitle("");
  };

  const editNewBlog = async (blogObject) => {
    try {
      const notif1 = {
        message: `Post was successfully edited`,
        type: "success",
      };
      await dispatch(updateBlog(blogObject));
      navigate(`/posts/${blog.id}`);

      dispatch(setNotification(notif1, 2500));
    } catch (exception) {
      const notif2 = {
        message: `Cannot edit post`,
        type: "failure",
      };
      dispatch(setNotification(notif2, 2500));
    }
  };

  const handleAddVideo = () => {
    console.log(newVideos);
  };
  const handleEditVideo = (video, index) => {
    let title = prompt("Please enter chapper title", video.title);

    if (title && title !== "") {
      var newItems = [...newVideos];
      var item = { ...newItems[index], title: title };
      console.log(item);
      newItems[index] = item;
      setnewVideos(newItems);
    }
  };
  const handleDeleteVideo = (index) => {
    const newItems = [...newVideos];
    newItems.splice(index, 1);
    setnewVideos(newItems);
  };

  return (
    <>
      <div className="">
        <main className="pt-8 pb-16 lg:pt-16 lg:pb-12 bg-white dark:bg-gray-900 min-h-screen">
          <div className="flex justify-between px-4 mx-auto max-w-6xl ">
            <article className="mx-auto w-full max-w-6xl	 format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
              <header className="mb-4 lg:mb-6 not-format">
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl dark:text-white">
                  Edit Post
                </h1>
                <address className="flex items-center mb-6 not-italic"></address>
              </header>
              <form onSubmit={editBlog} className="flex flex-col gap-4">
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
                  />
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
                  />
                </div>

                <div className="mb-2 block">
                  <Label htmlFor="post-chapper" value="Chappers" />
                </div>
                <div>
                  {newVideos.map((video, index) => (
                    // <div key={index} className="mb-4 h-5 ">
                    //   <img src={video.thumbnail} alt=""  />
                    // </div>
                    <div key={index} className="mb-8 flex">
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="mr-5"
                        style={{ height: 100, width: 200, objectFit: "fill" }}
                      />
                      <div className="flex flex-col  justify-evenly">
                        <div className="text-xl font-bold">{video.title}</div>
                        <div className="flex ">
                          <button
                            onClick={() => handleEditVideo(video, index)}
                            type="button"
                            className="border  bg-white hover:bg-gray-100  border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 me-2 mb-2"
                          >
                            Edit Title
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(index)}
                            type="button"
                            className="border  bg-white hover:bg-gray-100  border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 me-2 mb-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddVideo}
                    style={{ height: 100, width: 200 }}
                    type="button"
                    className=" justify-center bg-white hover:bg-gray-100  border-4 border-dotted border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 me-2 mb-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height={70}
                      viewBox="0 0 48 48"
                      fill="none"
                      stroke="#B8B8B8"
                    >
                      <path
                        d="M24 32L24 16"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 24L16 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <Button className="mt-4 w-24 text-black" type="submit">
                  Submit
                </Button>
              </form>
            </article>
          </div>
        </main>
      </div>

      <BlogFooter />
    </>
  );
};

export default BlogEdit;
