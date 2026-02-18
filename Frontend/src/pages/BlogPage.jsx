import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Comment from "../componants/Comment";
import {
  addSelectedBlog,
  removeSelectedBlog,
} from "../../utils/selectedBlogSlice";
import toast from "react-hot-toast";
import { formateDate } from "../../utils/formateDate";
import { setIsOpen } from "../../utils/commentSlice";

export async function handleFollow(id, token) {
  try {
    let response = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/follow/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    toast.success(response.data.message);
  } catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.message || "error in following😒");
  }
}

export async function handleSaveBlogs(id, token, toggleState) {
  try {
    toggleState();
    let response = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/save-blogs/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    toast.success(response.data.message);
  } catch (error) {
    toggleState();
    console.log(error);
    toast.error(error?.response?.data?.message || "Bookmark failed");
  }
}

const BlogPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const [blogData, setBlogData] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState();
  const [isBookMarked, setIsBookMarked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { email, token, id: userId } = useSelector((state) => state.user || []);
  const { isOpen } = useSelector((state) => state.comment || []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogById = async () => {
      try {
        const {
          data: { blogs },
        } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);

        setBlogData(blogs);
        setLikes(blogs.likes.length);

        if (blogs.likes.includes(userId)) setIsLiked(true);
        if (blogs.bookMarks.includes(userId)) setIsBookMarked(true);
        //if (blogs.creator.followers.includes(userId)) setIsFollower(true);

        dispatch(addSelectedBlog(blogs));
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    if (id) fetchBlogById();
    return () => {
      dispatch(setIsOpen(false));
      if (window.location.pathname !== `/edit/${id}`) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id]);

  const { comments, content } = useSelector(
    (state) => state?.selectedBlog || [],
  );

  async function handleLike() {
    try {
      if (!token) return toast.error("Please logIn first😒");

      setIsLiked((prev) => !prev);

      let response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.isLiked) {
        setLikes((prev) => prev + 1);
      } else {
        setLikes((prev) => prev - 1);
      }

      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Like failed");
    }
  }
  async function deleteBlogs() {
    setDeleting(true);
    try {
      if (!token) return toast.error("Please logIn first😒");
      let response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "delete failed");
    } finally {
      setDeleting(false);
      navigate("/blogs");
    }
  }
  
  if (!blogData)
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
            <h2 className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent animate-pulse">
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
    <>
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-10 px-3 sm:px-6 font-serif">
        <div className="max-w-4xl mx-auto">
          {/* Creator Card */}
          <div className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border">
            <Link to={`/@${blogData.creator?.username}`}>
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${
                  blogData.creator?.name || "Author"
                }`}
                alt="author"
                className="w-12 h-12 rounded-full ring-2 ring-gray-100"
              />
            </Link>

            <div className="flex-1">
              <Link to={`/@${blogData.creator?.username}`}>
                <p className="text-sm font-semibold text-gray-900 hover:underline">
                  {blogData.creator?.name || "Anonymous"}
                </p>
              </Link>
              <p className="text-xs text-gray-500">
                {formateDate(blogData.createdAt)}
              </p>
            </div>

            <Link to={`/@${blogData.creator?.username}`}>
              <button className="hidden sm:block px-4 py-2 text-sm rounded-full border bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                View Profile
              </button>
            </Link>
          </div>

          {/* Hero Image */}
          {blogData.image && (
            <div className="mt-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src={blogData.image}
                alt={blogData.title}
                className="w-full max-h-130 object-cover"
              />
            </div>
          )}

          {/* Blog Body */}
          <article className="mt-8 bg-white rounded-3xl shadow-md px-5 sm:px-10 py-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4 capitalize">
              {blogData.title || "Untitled"}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-7 mb-8">
              {blogData.description || "No description"}
            </p>

            {/* Content Blocks */}
            <div className="space-y-4">
              {content?.blocks?.map((block) => {
                if (block.type === "header") {
                  const level = block.data.level;
                  const Tag = `h${level}`;
                  const size =
                    level === 2
                      ? "text-2xl sm:text-3xl"
                      : level === 3
                        ? "text-xl sm:text-2xl"
                        : "text-lg sm:text-xl";

                  return (
                    <Tag
                      key={block.id}
                      className={`${size} font-bold text-gray-900 mt-8`}
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                  );
                }

                if (block.type === "paragraph") {
                  return (
                    <p
                      key={block.id}
                      className="text-sm sm:text-base leading-7 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                  );
                }

                if (block.type === "ImageTool") {
                  return (
                    <figure key={block.id} className="my-8 text-center">
                      <img
                        src={block.data.file.url}
                        alt=""
                        className="rounded-2xl mx-auto max-w-full shadow"
                      />
                      {block.data.caption && (
                        <figcaption
                          className="mt-2 text-xs sm:text-sm text-gray-500"
                          dangerouslySetInnerHTML={{
                            __html: block.data.caption,
                          }}
                        />
                      )}
                    </figure>
                  );
                }

                return null;
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-10 pt-6 border-t flex flex-wrap items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition cursor-pointer ${
                  isLiked
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <i
                  className={`fi ${
                    isLiked
                      ? "fi-sr-heart text-red-600"
                      : "fi-rr-heart text-gray-600"
                  } text-xl`}
                />
                <span className="text-sm font-medium">{likes || 0}</span>
              </button>

              <button
                onClick={() => dispatch(setIsOpen())}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border transition cursor-pointer"
              >
                <i className="fi fi-rr-comment-alt text-xl text-gray-600" />
                <span className="text-sm font-medium">
                  {comments?.length || 0}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!token) return toast.error("Please logIn first 😒");
                  handleSaveBlogs(blogData._id, token, () =>
                    setIsBookMarked((prev) => !prev),
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border transition cursor-pointer"
              >
                <i
                  className={`fi ${
                    isBookMarked ? "fi-sr-bookmark" : "fi-rr-bookmark"
                  } text-xl`}
                />
              </button>

              {token && email === blogData.creator?.email && (
                <div className="ml-auto flex gap-2">
                  <Link to={`/edit/${blogData.blogId}`}>
                    <button className="px-4 py-2 text-sm rounded-full bg-gray-800 text-white hover:bg-gray-700 transition cursor-pointer">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={deleteBlogs}
                    disabled={deleting}
                    className={`px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer ${
                      deleting && "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>

      {isOpen && <Comment />}
    </>
  );
};

export default BlogPage;
