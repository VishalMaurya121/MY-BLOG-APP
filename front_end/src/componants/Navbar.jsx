import { useEffect, useState, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/blogAppLogo.png";
import { logout } from "../../utils/userSlice";
import defaultProfilePic from "../assets/user-profile-icon.webp";
import axios from "axios";

const Navbar = () => {
  const { token, name, profilePic, username } = useSelector(
    (state) => state.user || {},
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const avatar =
    profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${name}`;

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    setOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    navigate(`/search?q=${searchTerm}`);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Search */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="logo" className="w-10 h-10 rounded-md" />
                <span className="text-2xl font-bold font-serif text-gray-800">
                  BlogApp
                </span>
              </Link>

              {/* Desktop Search */}
              <div className="hidden md:flex items-center relative">
                <button
                  onClick={() => setSearchBarOpen((prev) => !prev)}
                  className="p-2 rounded-full bg-white hover:bg-gray-100 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                <p className="ml-2 font-serif text-gray-800">
                  Tap here to search..
                </p>

                {searchBarOpen && (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="absolute left-4 top-14"
                  >
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search here..."
                      className="h-8 px-3 rounded-3xl border border-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </form>
                )}
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 font-serif lg:mr-[20%] mg:mr-[10%]">
              {["/", "/blogs", "/about", "/add-blogs"].map((path, i) => (
                <Link
                  key={i}
                  to={path}
                  className="text-gray-600 hover:text-gray-900 underline"
                >
                  {["Home", "Blogs", "About", "Add Blogs"][i]}
                </Link>
              ))}
            </nav>

            {/* Profile / Auth (Desktop) */}
            {token ? (
              <div ref={dropdownRef} className="relative hidden md:block ">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="p-1 border rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 font-serif border">
                    <div className="flex items-center gap-3 px-3 py-2 border-b ">
                      <img
                        src={avatar}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border border-black"
                      />
                      <span className="text-sm font-semibold">
                        {name || "Anonymous"}
                      </span>
                    </div>

                    <Link
                      to={`/@${username}`}
                      className="block px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      User Profile
                    </Link>
                    <Link
                      to="/signin"
                      className="block px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Switch Account
                    </Link>
                    <div
                      onClick={handleLogout}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Sign out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3 font-serif">
                <Link to="/signin" className="px-3 py-2 bg-white rounded-md">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 bg-gray-600 text-white rounded-md"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Buttons */}
            <div className="md:hidden flex gap-2">
              <button
                onClick={() => setSearchBarOpen((p) => !p)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                🔍
              </button>

              <button
                onClick={() => setOpen((p) => !p)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                {open ? "✖" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {searchBarOpen && (
          <div className="md:hidden px-4 pb-2">
            <form onSubmit={handleSearchSubmit}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search here..."
                className="w-full h-9 px-3 rounded-3xl border focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t font-serif">
            {["/", "/blogs", "/about", "/add-blogs", `/@${username}`].map(
              (path, i) => (
                <Link
                  key={i}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 hover:bg-gray-50"
                >
                  {["Home", "Blogs", "About", "Add Blogs", "User Profile"][i]}
                </Link>
              ),
            )}

            {token ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            ) : (
              <div className="px-3 py-4 space-y-2">
                <Link to="/signin" className="block text-center">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block text-center bg-gray-600 text-white rounded"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <Outlet />
    </>
  );
};

export default Navbar;
