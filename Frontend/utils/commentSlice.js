import { createSlice } from "@reduxjs/toolkit";
import reducer from "./selectedBlogSlice";

const commentSlice = createSlice({
  name: "commentSlice",
  initialState: {
    isOpen: false,
  },
  reducers: {
    setIsOpen(state, action) {
      state.isOpen = action.payload == false ? false : !state.isOpen;
    },
  },
});

export const { setIsOpen } = commentSlice.actions;
export default commentSlice.reducer;
