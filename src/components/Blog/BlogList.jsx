import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Blog from "./Blog";
import BlogFooter from "./BlogFooter";

const BlogList = () => {
  const blogs = useSelector((state) => state.blogs);

  // Memoize sorted blogs to prevent unnecessary re-sorting
  const sortedBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => (a.likes > b.likes ? -1 : 1));
  }, [blogs]);

  return (
    <div>
      <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white min-h-screen">
        <div className="flex justify-between px-4 mx-auto max-w-6xl">
          <article className="mx-auto w-full max-w-6xl format format-sm sm:format-base lg:format-lg format-blue">
            <header className="mb-4 lg:mb-6">
              <h1 className="mb-4 text-4xl tracking-tight font-bold text-gray-900">
                Posts
              </h1>
            </header>
            {sortedBlogs.length > 0 ? (
              sortedBlogs.map((blog) => <Blog key={blog.id} blog={blog} />)
            ) : (
              <article className="p-6 text-base bg-white border-t border-gray-200">
                <footer className="flex justify-between items-center"></footer>
                <p className="text-gray-500">No posts yet... Create one!</p>
              </article>
            )}
          </article>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
};

export default BlogList;
