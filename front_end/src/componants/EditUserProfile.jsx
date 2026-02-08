import React, { useEffect, useState } from "react";
import defaultUserImg from "../assets/user-profile-icon.webp";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { login } from "../../utils/userSlice";
import { useNavigate } from "react-router-dom";

export const EditUserProfile = () => {
  const {
    id,
    profilePic,
    name: reduxName,
    username: reduxUsername,
    bio: reduxBio,
    token,
    email,
  } = useSelector((state) => state.user || {});

  const [name, setName] = useState(reduxName || "");
  const [username, setUsername] = useState(reduxUsername || "");
  const [bio, setBio] = useState(reduxBio || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(profilePic || null);

  const [isEnable, setEnable] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Enable Save only on changes
  useEffect(() => {
    const nameChanged = name !== reduxName;
    const userChanged = username !== reduxUsername;
    const bioChanged = bio !== reduxBio;
    const profilePicChanged = !!imageFile;

    if (nameChanged || userChanged || bioChanged || profilePicChanged) {
      setEnable(false);
    } else {
      setEnable(true);
    }
  }, [name, username, bio, imageFile, reduxName, reduxUsername, reduxBio]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(profilePic || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("bio", bio);
    if (imageFile) {
      formData.append("profilePic", imageFile);
    }

    for (let hello of formData.entries()) {
      console.log("hello-1", hello);
    }

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message || "Profile updated successfully");
      dispatch(login({ ...response.data.user, token, email, id }));
      setEnable(true); // Disable again after save
      setImageFile(null);
      navigate(-1); // reset stored file
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-slate-200 to-slate-100 flex justify-center items-start py-12 font-serif px-4">
      <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-7 w-full max-w-lg animate-fadeIn">
        <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
          Edit Profile
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6 relative">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden border border-indigo-200 shadow-md cursor-pointer group"
            onClick={() => document.getElementById("profilePicInput").click()}
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <img src={defaultUserImg} className="w-24 opacity-60 mt-4" />
            )}
          </div>

          <input
            id="profilePicInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {(preview || imageFile) && (
            <button
              type="button"
              onClick={removeImage}
              className="text-xs mt-3 text-red-500 underline hover:text-red-700"
            >
              Remove Photo
            </button>
          )}
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
          />

          <textarea
            rows="4"
            className="w-full border rounded-lg px-3 py-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell something about yourself..."
          />

          <button
            disabled={isEnable || loading}
            type="submit"
            className={`w-full py-2 rounded-lg font-medium text-sm transition shadow-md ${
              isEnable || loading
                ? "bg-indigo-400 text-white cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
