import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";

import { setIsOpen } from "../../utils/commentSlice";
import { setCommentLikes, setComments } from "../../utils/selectedBlogSlice";
import { formateDate } from "../../utils/formateDate";

const Comment = () => {
  const dispatch = useDispatch();

  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const blogId = useSelector((state) => state.selectedBlog?._id);
  const comments = useSelector((state) =>
    Array.isArray(state.selectedBlog?.comments)
      ? state.selectedBlog.comments
      : [],
  );
  const token = useSelector((state) => state.user?.token);
  const userId = useSelector((state) => state.user?.id);
  const isOpen = useSelector((state) => state.comment?.isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  // drawer toggle

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!token) return toast.error("Please log in to comment");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(setComments([...comments, data.comment]));
      setComment("");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error posting comment");
    }
  };

  const handleDelete = async (commentId) => {
    if (!token) return toast.error("You must be logged in to delete");
    if (!confirm("Delete this comment?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/deleteComment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(setComments(comments.filter((c) => c._id !== commentId)));
      toast.success("Comment deleted successfully");
    } catch {
      toast.error("Error deleting comment");
    }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;
    if (!token) return toast.error("You must be logged in to edit");

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/editComment/${commentId}`,
        { updateComment: editText },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      dispatch(
        setComments(
          comments.map((c) => (c._id === commentId ? data.comment : c)),
        ),
      );
      setEditingId(null);
      setEditText("");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating comment");
    }
  };

  const handleLike = async (commentId) => {
    if (!token) return toast.error("Please log in to like a comment");

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/likeComment/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(setCommentLikes({ commentId, userId }));
      toast.success(response.data.message);
    } catch {
      toast.error("Error liking comment");
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => dispatch(setIsOpen(false))}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`
    fixed top-0 right-0 h-full bg-white z-50
    w-full max-w-xs md:max-w-[24%]
    transform transition-all duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "translate-x-full"}
    shadow-2xl border-l rounded-l-2xl
    flex flex-col
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-tl-2xl">
          <h2 className="text-base font-semibold text-gray-800">
            Comments <span className="text-gray-500">({comments.length})</span>
          </h2>

          <button
            onClick={() => dispatch(setIsOpen(false))}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <i className="fi fi-br-cross text-lg text-gray-700" />
          </button>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map((c) => {
            const isOwner = c.user?._id?.toString() === userId?.toString();

            return (
              <div
                key={c._id}
                className="bg-gray-50 rounded-xl p-3 border hover:shadow-md transition"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      c.user?.profilePic ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${c.user?.name || "A"}`
                    }
                    className="w-9 h-9 rounded-full border bg-white"
                    alt=""
                  />

                  <div className="flex-1">
                    <p className="text-sm font-semibold font-serif leading-none">
                      {c.user?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formateDate(c.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Text / Edit */}
                {editingId === c._id ? (
                  <textarea
                    autoFocus
                    rows={3}
                    className="w-full mt-2 p-2 border rounded-lg text-sm font-serif resize-none focus:ring-1 focus:ring-gray-400"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <p className="mt-2 text-sm font-serif text-gray-700 leading-relaxed">
                    {c.comment}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => handleLike(c._id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition"
                  >
                    <i className="fi fi-rr-heart text-lg" />
                    <span className="text-sm">{c.likes?.length || 0}</span>
                  </button>

                  {isOwner && (
                    <div className="flex gap-2">
                      {editingId === c._id ? (
                        <button
                          onClick={() => handleEdit(c._id)}
                          className="px-3 py-1 text-xs rounded-md bg-gray-700 text-white hover:bg-gray-800"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(c._id);
                            setEditText(c.comment);
                          }}
                          className="px-3 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(c._id)}
                        className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Comment */}
        <div className="border-t p-4 bg-gray-50">
          <textarea
            rows={3}
            placeholder="Write a comment…"
            className="w-full p-2 border rounded-lg resize-none focus:ring-1 focus:ring-gray-400 font-serif"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={handleComment}
            className="mt-2 w-full py-2 rounded-lg bg-gray-700 text-white font-serif hover:bg-gray-800 transition"
          >
            Post Comment
          </button>
        </div>
      </div>
    </>
  );
};

export default Comment;
