import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthForm from "./pages/AuthForm";
import Home from "./componants/Home";
import Navbar from "./componants/Navbar";
import Blogs from "./pages/Blogs";
import About from "./pages/About";
import AddBlogs from "./pages/AddBlogs";
import BlogPage from "./pages/BlogPage";
import VerifyUser from "./pages/VerifyUser";
import UserProfile from "./componants/UserProfile";
import { EditUserProfile } from "./componants/EditUserProfile";
import SearchBlog from "./componants/SearchBlog";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<AuthForm type={"signin"} />} />
        <Route path="/signup" element={<AuthForm type={"signup"} />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/about" element={<About />} />
        <Route path="/add-blogs" element={<AddBlogs />} />
        <Route path="/blogs/:id" element={<BlogPage />} />
        <Route path="/edit/:id" element={<AddBlogs />} />
        <Route
          path="/verify-email/:verificationToken"
          element={<VerifyUser />}
        />
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/edit-profile" element={<EditUserProfile />} />
        <Route path="/search" element={<SearchBlog />} />
        <Route path="/search/:id" element={<BlogPage />} />
      </Route>
    </Routes>
  );
}

export default App;
