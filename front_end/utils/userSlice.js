import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

let user = localStorage.getItem("user");
if (user != "undefined") {
  user = user;     
} else {
  user = null;   
  toast.error("currently no users available");
}  
//console.log("user:", user);
const userSlice = createSlice({
  name: "userSlice",
  initialState: JSON.parse(user) || { user: null },
  reducers: {
    login(state, action) {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    logout(state, action) {
      localStorage.removeItem("user");
      toast.success("logout successfully🤗");
      return { user: null };
    },
  },
});
export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
