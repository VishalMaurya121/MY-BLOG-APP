import { createSlice } from "@reduxjs/toolkit";

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: JSON.parse(localStorage.getItem("selectedBlog")) || {},
  reducers: {    
    addSelectedBlog(state, action) {
      localStorage.setItem("selectedBlog", JSON.stringify(action.payload));
      return action.payload;
    },
                 
    removeSelectedBlog() { 
      localStorage.removeItem("selectedBlog");
      return null;
    },

    setComments(state, action) {
      state.comments = action.payload;
    },

    setCommentLikes(state, action) {
      const { commentId, userId } = action.payload;

      // ✅ SAFETY CHECK
      if (!Array.isArray(state.comments)) return;     

      // ✅ FIXED: comments + ===
      const comment = state.comments.find(
        (comment) => comment._id === commentId
      );

      if (!comment) return;

      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter((id) => id !== userId);
      } else {
        comment.likes.push(userId);
      }
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  setComments,
  setCommentLikes,
  setbookMarks,
} = selectedBlogSlice.actions;

export default selectedBlogSlice.reducer;
