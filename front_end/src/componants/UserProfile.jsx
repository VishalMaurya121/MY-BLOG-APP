import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import defaultProfileImg from "../assets/user-profile-icon.webp";
import { useState } from "react";
import Blogs from "../pages/Blogs";
import { useSelector } from "react-redux";
import { handleFollow } from "../pages/BlogPage";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState();
  const [user, setUser] = useState();
  const logInUser = useSelector((state) => state?.user?.id || []);
  const token = useSelector((state) => state?.user?.token || []);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/${username.split("@")[1]}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (
          response?.data?.user?.followers.length != 0 &&
          response?.data?.user?.followers.map((user) => user._id == logInUser)
        ) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
        setUser(response.data.user);
        toast.success(response.data.message);
      } catch (error) {
        console.log(error);
        toast.error("error in fetching user");
      }
    }
    fetchUserDetails();
  }, [username]);

  const Owner = logInUser == user?._id;

  return (
    <>
      <div className="w-full flex flex-col items-center gap-10 mt-8 px-4 font-serif">
        {/* Profile Card */}
        <div className="w-full max-w-3xl p-4 sm:p-6 rounded-2xl shadow-xl border bg-white flex flex-col gap-6">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: Image + Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src={user?.profilePic || defaultProfileImg}
                alt="profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border shadow-sm object-cover"
              />

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {user?.name}
                </h2>
                <p className="text-gray-500 break-all">{user?.email}</p>
                <p className="text-gray-500 text-sm sm:text-base">
                  <span className="font-semibold">BIO:</span>{" "}
                  {user?.bio || "No bio provided"}
                </p>
              </div>
            </div>

            {/* Right: Button */}
            <div className="flex justify-center sm:justify-end">
              {Owner ? (
                <Link to="/edit-profile">
                  <button className="px-5 py-2 rounded-full font-medium border bg-blue-600 text-white border-blue-600 hover:bg-blue-500 duration-200">
                    Edit Profile
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleFollow(user._id, token);
                    setIsFollowing((prev) => !prev);
                  }}
                  className="px-5 py-2 rounded-full font-medium border bg-blue-600 text-white border-blue-600 hover:bg-blue-500 duration-200"
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 border text-center">
              <h3 className="font-semibold text-gray-700">Blogs</h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                {user?.blogs?.length || 0}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 border text-center">
              <h3 className="font-semibold text-gray-700">Followers</h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                {user?.followers?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Blog List */}
        <div className="w-full max-w-3xl">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 capitalize">
            All Blogs posted by {user?.name}:
          </h3>

          <div className="flex flex-col gap-3">
            {user?.blogs?.map((blog) => (
              <Link key={blog?.blogId}>
                <div className="p-4 bg-white rounded-xl border shadow hover:shadow-md duration-150 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h4 className="text-base sm:text-lg font-medium">
                    {blog?.title}
                  </h4>
                  <span className="text-sm text-gray-500">
                    ❤️ {blog?.likes?.length || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
