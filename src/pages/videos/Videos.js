import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

// Helper: Convert YouTube link to iframe embed URL
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

  if (!videoId) return url;

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
};

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ id: null, title: "", youtube_url: "" });

  // Fetch videos
  const loadVideos = async () => {
    try {
      const res = await api.get("/videos");
      setVideos(res.data.data);
    } catch (error) {
      toast.error("Error loading videos");
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update video
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (form.id) {
        await api.put(`/videos/${form.id}`, form);
        toast.success("Video updated");
      } else {
        await api.post("/videos", form);
        toast.success("Video added");
      }

      setForm({ id: null, title: "", youtube_url: "" });
      loadVideos();
    } catch (error) {
      toast.error("Error saving video");
    }
  };

  // Edit
  const handleEdit = (video) => {
    setForm({
      id: video.id,
      title: video.title,
      youtube_url: video.youtube_url,
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;

    try {
      await api.delete(`/videos/${id}`);
      toast.success("Video deleted");
      loadVideos();
    } catch (error) {
      toast.error("Error deleting video");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 font-bold">Manage Videos (Max 4)</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg mb-6"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="youtube_url"
          placeholder="YouTube Link"
          value={form.youtube_url}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          {form.id ? "Update Video" : "Add Video"}
        </button>
      </form>

      {/* VIDEO TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">YouTube Link</th>
            <th className="p-2 border w-40">Preview</th>
            <th className="p-2 border w-20">Edit</th>
            <th className="p-2 border w-20">Delete</th>
          </tr>
        </thead>

        <tbody>
          {videos.map((video) => (
            <tr key={video.id} className="border-b">
              <td className="p-2 border">{video.title}</td>
              <td className="p-2 border">{video.youtube_url}</td>

              {/* Small Autoplay Preview */}
              <td className="p-2 border">
                <iframe
                  src={getEmbedUrl(video.youtube_url)}
                  className="w-32 h-20 rounded"
                  allow="autoplay; encrypted-media"
                  mute="1"
                ></iframe>
              </td>

              {/* EDIT */}
              <td className="p-2 border">
                <button
                  onClick={() => handleEdit(video)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              </td>

              {/* DELETE */}
              <td className="p-2 border">
                <button
                  onClick={() => handleDelete(video.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Videos;