import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

// Helper: Convert YouTube link to embed URL
const getEmbedUrl = (url) => {
  if (!url) return "";
  let videoId = null;

  if (url.includes("shorts/")) {
    videoId = url.split("shorts/")[1].split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}` : url;
};

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ id: null, title: "", youtube_url: "" });
  const [loading, setLoading] = useState(false);

  // Fetch videos
  const loadVideos = async () => {
    try {
      const res = await api.get("/videos");
      setVideos(res.data.data || []);
    } catch (error) {
      toast.error("Error loading videos");
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (form.id) {
        await api.put(`/videos/${form.id}`, form);
        toast.success("Video updated successfully!");
      } else {
        await api.post("/videos", form);
        toast.success("Video added successfully!");
      }

      setForm({ id: null, title: "", youtube_url: "" });
      loadVideos();
    } catch (error) {
      toast.error("Error saving video");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video) => {
    setForm({
      id: video.id,
      title: video.title,
      youtube_url: video.youtube_url,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success("Video deleted successfully!");
      loadVideos();
    } catch (error) {
      toast.error("Error deleting video");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Manage Videos</h1>
          <p className="text-orange-100 mt-2">Add and manage promotional videos (Max 4 recommended)</p>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            {form.id ? "Edit Video" : "Add New Video"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
              <input
                type="text"
                name="youtube_url"
                value={form.youtube_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
                placeholder="https://youtube.com/shorts/..."
                required
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setForm({ id: null, title: "", youtube_url: "" })}
                className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 font-medium disabled:opacity-70"
              >
                {loading ? "Saving..." : form.id ? "Update Video" : "Add Video"}
              </button>
            </div>
          </form>
        </div>

        {/* Videos Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">YouTube URL</th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Preview</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-orange-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-800">{video.title}</td>
                    <td className="px-6 py-5 text-gray-600 truncate max-w-xs">
                      {video.youtube_url}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-block border rounded-2xl overflow-hidden shadow-sm">
                        <iframe
                          src={getEmbedUrl(video.youtube_url)}
                          className="w-40 h-24 rounded-2xl"
                          allow="autoplay; encrypted-media"
                          title={video.title}
                        ></iframe>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(video)}
                        className="text-blue-600 hover:text-blue-700 text-xl hover:scale-110 transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600 hover:text-red-700 text-xl hover:scale-110 transition"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}

                {videos.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-gray-500">
                      No videos added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;