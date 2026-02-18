import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Blogs() {
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { id: userId } = useSelector((state) => state?.user || []);
  const recommandedTopics = blogs.map((tags) => tags.tags).flat();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const params = { page, limit: 2 };
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/blogs`,
          { params },
        );
        setBlogs((prev) => [...prev, ...res.data.blogs] || []);
        setHasMore(res.data.hasMore);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Blog Icon */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-gray-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-gray-400 rounded-full animate-ping mx-auto mt-1"></div>
            <div className="absolute -inset-1 bg-linear-to-r from-gray-500 to-gray-500 rounded-full blur-xl animate-pulse opacity-30"></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold bg-linear-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent animate-pulse">
              Loading your blogs...
            </h2>
            <p className="text-sm text-gray-500 font-medium tracking-wide">
              Just a moment ✨
            </p>
          </div>

          {/* Dots Animation */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
          </div>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-12 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Insights & Stories
          </h1>
        </header>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Blog List */}
          <div className="w-full lg:w-3/4 space-y-6">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3 w-full bg-gray-100 border-t md:border-t-0 md:border-l flex items-center justify-center">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-48 md:h-full object-contain p-3"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 flex flex-col justify-between gap-4 md:w-2/3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2 capitalize">
                        {blog.title}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-3 capitalize">
                        {blog.description}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/9.x/initials/svg?seed=${
                            blog.creator?.name || "Author"
                          }`}
                          alt="user"
                          className="w-9 h-9 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {blog.creator?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(blog.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-md bg-red-50 text-xs sm:text-sm">
                          ❤️ {blog.likes?.length || 0}
                        </span>

                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-xs sm:text-sm">
                          💬 {blog.commentCount ?? blog.comments?.length ?? 0}
                        </span>

                        <Link
                          to={blog.blogId}
                          className="px-3 py-1.5 bg-gray-600 text-white text-xs sm:text-sm rounded-md hover:opacity-80"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Empty State */}
            {blogs?.length === 0 && (
              <>
                <p className="text-2xl sm:text-3xl font-medium text-gray-800 text-center mt-6">
                  No blogs are present yet 😒😒...
                </p>
              </>
            )}

            {/* Load More */}
            {hasMore && blogs?.length !== 0 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition flex items-center gap-2 cursor-pointer"
                >
                  Load More <span className="animate-pulse">↓</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-1/4">
            <p className="font-medium text-gray-700 mb-4">
              Recommended Topics:
            </p>

            <div className="flex flex-wrap gap-3">
              {recommandedTopics.map((tag, index) => (
                <Link key={index} to={`/search?q=${tag}`}>
                  <span className="px-3 py-1 bg-white text-sm rounded-full shadow cursor-pointer hover:bg-gray-700 hover:text-white lowercase transition">
                    {tag}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
