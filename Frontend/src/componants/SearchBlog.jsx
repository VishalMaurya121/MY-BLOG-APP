import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { formateDate } from "../../utils/formateDate";
import toast from "react-hot-toast";

const SearchBlog = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { tag } = useParams();
  const [blogs, setBlogs] = useState([]);
  const q = searchParams.get("q");

  const query = tag ? { tag: tag.toLowerCase().replace(" ", "-") } : q;

  useEffect(() => {
    if (q) {
      async function SearchBlogs() {
        const params = { search: query, page, limit: 2 };
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/search-blogs?`,
            {
              params,
            },
          );
          setBlogs((prev) => [...prev, ...response.data.blogs] || []);
          setHasMore(response.data.hasMore);
          toast.success(response.data.message);
        } catch (error) {
          setBlogs([]);
          console.log(error);
          toast.error("error in searching the blogs");
        }
      }
      SearchBlogs();
    }
  }, [q, page]);
  return (
    <main className="min-h-screen bg-gray-50 py-12 font-serif ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Results For : {tag ? tag : q}
          </h1>
        </header>

        <div className="flex flex-row">
          <div className="max-w-2xl mx-auto space-y-6 px-2 sm:px-0">
            {blogs?.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row items-stretch md:gap-6">
                  <div className="p-4 sm:p-6 flex flex-col justify-between gap-3 md:w-2/3 order-1">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug line-clamp-2 capitalize">
                        {blog.title}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-3 capitalize">
                        {blog.description}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/9.x/initials/svg?seed=${
                            blog.creator?.name || "Author"
                          }`}
                          alt="user"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {blog.creator?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formateDate(blog.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 text-xs sm:text-sm">
                          ❤️ {blog.likes?.length || 0}
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 text-xs sm:text-sm">
                          💬 {blog.commentCount ?? blog.comments?.length ?? 0}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 text-xs sm:text-sm">
                          😎
                        </div>

                        <Link
                          to={blog.blogId}
                          className="px-3 py-1.5 bg-gray-600 text-white text-xs sm:text-sm rounded-md hover:bg-gray-400 cursor-pointer"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border border-gray-200 md:w-1/3 w-full flex items-center justify-center overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-48 md:h-full object-contain p-2"
                    />
                  </div>
                </div>
              </article>
            ))}

            {blogs?.length == 0 && (
              <div>
                <p className="text-4xl font-medium text-gray-800 text-center mt-2">
                  No blogs are present yet 😒😒!
                </p>
              </div>
            )}

            {hasMore && blogs?.length != 0 && (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                class="px-5 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium border border-slate-200 hover:bg-gray-400 flex items-center gap-2 transition cursor-pointer"
              >
                Load More
                <span class="animate-pulse">↓</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SearchBlog;
