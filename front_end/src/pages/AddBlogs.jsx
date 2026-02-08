import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import NestedList from "@editorjs/nested-list";
import Link from "@editorjs/link";
import Embed from "@editorjs/embed";
import DrawingTool from "@blade47/editorjs-drawing-tool";
import ImageTool from "@editorjs/image";

import { removeSelectedBlog } from "../../utils/selectedBlogSlice";
import { setIsOpen } from "../../utils/commentSlice";

const AddBlogs = () => {
  const { id } = useParams();
  const { token } = useSelector((slice) => slice.user || {});
  const selectedBlog = useSelector((state) => state.selectedBlog);
  const { title, description, image, draft, tags } = selectedBlog || {};
  const content = selectedBlog?.content;

  const editorJsRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Set axios authorization header based on token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Redirect unauthenticated users to signin
  useEffect(() => {
    if (!token) navigate("/signin");
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
    tags: [],
    draft: false,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize EditorJS instance
  const intializeEditorJS = () => {
    editorJsRef.current = new EditorJS({
      holder: "editorJS",
      placeholder: "write something here...",
      data: content,
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: "Enter a header",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        List: {
          class: NestedList,
          config: {
            defaultStyle: "unordered",
          },
          inlineToolbar: true,
        },
        Link: Link,
        Embed: Embed,
        DrawingTool: {
          class: DrawingTool,
        },
        ImageTool: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => {
                // Return image as object URL for preview
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(image),
                    image,
                  },
                };
              },
            },
          },
        },
      },
      onChange: async () => {
        // Save editor content to formData
        let data = await editorJsRef.current.save();
        setFormData((formData) => ({ ...formData, content: data }));
      },
    });
  };

  // Fetch blog if id exists
  useEffect(() => {
    if (id && selectedBlog) {
      setFormData({
        title: title || "",
        description: description || "",
        image: null,
        content: content || "",
        tags: tags || [],
        draft: draft || false,
      });
      setImagePreview(image || "");
    }
  }, [id, selectedBlog]);

  // Initialize EditorJS only once
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isEditMode = currentPath === `/edit/${id}`;

    if (!isEditMode) {
      dispatch(removeSelectedBlog());
    }

    const timeoutId = setTimeout(() => {
      intializeEditorJS();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (editorJsRef.current) {
        //editorJsRef.current.destroy();
        editorJsRef.current = null;
      }
      dispatch(setIsOpen(false));
      if (!isEditMode) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id, dispatch]);

  // Handle image file selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Handler for creating a new blog post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.image ||
        !formData.content?.blocks ||
        formData.content.blocks.length === 0
      ) {
        toast.error("All fields are required🙂");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("image", formData.image);
      data.append("content", JSON.stringify(formData.content));
      data.append("tags", JSON.stringify(formData.tags));
      data.append("draft", formData.draft);

      let existingImages = [];
      // Collect images from EditorJS blocks (if any)
      formData.content.blocks?.forEach((block) => {
        if (block.type === "ImageTool") {
          if (block.data.file?.image) {
            data.append("images", block.data.file.image);
          } else {
            existingImages.push({
              url: block.data.file.url,
              imageId: block.data.file.imageId,
            });
          }
        }
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(response.data.message || "Blog created successfully");
      navigate("/blogs");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  // Handler for updating an existing blog post
  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.title || !formData.description) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (
        formData.content &&
        formData.content.blocks &&
        formData.content.blocks.length > 0
      ) {
        data.append("content", JSON.stringify(formData.content));
      }
      data.append("tags", JSON.stringify(formData.tags));
      data.append("draft", formData.draft);
      let existingImages = [];
      // Collect images from EditorJS blocks (if any)
      formData.content.blocks?.forEach((block) => {
        if (block.type === "ImageTool") {
          if (block.data.file?.image) {
            data.append("images", block.data.file.image);
          } else {
            existingImages.push({
              url: block.data.file.url,
              imageId: block.data.file.imageId,
            });
          }
        }
      });

      data.append("existingImages", JSON.stringify(existingImages));

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(response.data.message || "Blog updated successfully");
      navigate(-1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };
  console.log(formData.tags);
  console.log(formData.title);
  const handleKeyDown = (e) => {
    const newTag = e.target.value.toLowerCase();
    if (e.code === "Enter" && e.target.value.trim()) {
      e.preventDefault();

      if (formData.tags.length >= 10) {
        e.target.value = "";
        return toast.error("limit reached😒");
      }
      if (formData.tags.includes(newTag)) {
        return toast.error("Tag already added🙂");
      }

      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      e.target.value = "";
    }
  };

  const handleTagDelete = (index) => {
    const updatedTags = formData.tags.filter(
      (_, tagIndex) => tagIndex !== index,
    );
    setFormData((prev) => ({ ...prev, tags: updatedTags }));
  };

  const handleFormSubmit = id ? handleUpdateBlog : handleSubmit;

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white py-10 font-serif">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
        {id ? "Edit Blog" : "Create New Blog"}
      </h1>
      <p className="mt-2 text-gray-600 max-w-2xl">
        {id
          ? "Refine your story, update details, and improve your post."
          : "Write something meaningful and share it with the community."}
      </p>
    </div>

    {/* Editor Card */}
    <div className="bg-white rounded-3xl shadow-lg border p-6 sm:p-10">
      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Featured Image {!id && "*"}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {id
                ? "Optional — keep empty to retain current image"
                : "Required — this will be the blog cover"}
            </p>

            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
              required={!id}
            />

            <label
              htmlFor="image-input"
              className="flex flex-col items-center justify-center h-56 border rounded-2xl cursor-pointer transition hover:border-gray-500 hover:bg-gray-50"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full object-contain rounded-xl p-3"
                />
              ) : (
                <div className="text-center space-y-2">
                  <i className="fi fi-rr-picture text-4xl text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Upload featured image
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG / JPG • Max 10MB
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Title + Tags */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                value={formData?.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Write a compelling title..."
                className="w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                onKeyDown={handleKeyDown}
                placeholder="Press Enter to add tag"
                className="w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-gray-500 outline-none"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Max 10 tags</span>
                <span>{10 - formData?.tags?.length} remaining</span>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-gray-100 border hover:bg-gray-900 hover:text-white transition"
                  >
                    #{tag}
                    <i
                      onClick={() => handleTagDelete(index)}
                      className="fi fi-rr-cross-circle cursor-pointer"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Short Description *
          </label>
          <textarea
            rows="3"
            value={formData?.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Brief summary of your blog..."
            className="w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-gray-500 outline-none resize-none"
          />
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content *
          </label>
          <div
            id="editorJS"
            className="w-full min-h-75 px-4 py-3 border rounded-xl focus-within:ring-2 focus-within:ring-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-linear-to-r from-gray-800 to-gray-700 text-white font-semibold hover:from-gray-900 hover:to-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? id
                ? "Updating..."
                : "Publishing..."
              : id
              ? "Update Blog"
              : "Publish Blog"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</main>

  );
};

export default AddBlogs;
