import React, { useEffect, useState } from "react";
import api from "../../api";

const AboutUsForm = () => {
  const [data, setData] = useState({
    hero_title: "",
    hero_subtitle: "",
    story_title: "",
    story_description: "",
    mission: "",
    vision: "",
    counter_customers: "",
    counter_orders: "",
    counter_products: "",
    counter_rating: "",
  });

  const [heroImage, setHeroImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [previewHero, setPreviewHero] = useState(null);
  const [previewStory, setPreviewStory] = useState(null);

  const [timeline, setTimeline] = useState([{ year: "", text: "" }]);
  const [team, setTeam] = useState([{ name: "", role: "", image: "" }]);
  const [whyChooseUs, setWhyChooseUs] = useState([{ icon: "", title: "" }]);
  const [loading, setLoading] = useState(true);

  const safeParse = (value, fallback) => {
    try {
      if (!value) return fallback;

      let parsed = value;

      // If it’s a string, parse once
      if (typeof parsed === "string") parsed = JSON.parse(parsed);

      // If still a string, parse second time
      if (typeof parsed === "string") parsed = JSON.parse(parsed);

      // Final check: must be array
      if (!Array.isArray(parsed)) return fallback;

      return parsed;
    } catch {
      return fallback;
    }
  };

  // Fetch existing data
  useEffect(() => {
    api
      .get("/about")
      .then((res) => {
        if (res.data?.data) {
          const d = res.data.data;

          setData({
            hero_title: d.hero_title || "",
            hero_subtitle: d.hero_subtitle || "",
            story_title: d.story_title || "",
            story_description: d.story_description || "",
            mission: d.mission || "",
            vision: d.vision || "",
            counter_customers: d.counter_customers || "",
            counter_orders: d.counter_orders || "",
            counter_products: d.counter_products || "",
            counter_rating: d.counter_rating || "",
          });

          setTimeline(safeParse(d.timeline, [{ year: "", text: "" }]));
          setTeam(safeParse(d.team, [{ name: "", role: "", image: "" }]));
          setWhyChooseUs(safeParse(d.why_choose_us, [{ icon: "", title: "" }]));

          setPreviewHero(d.hero_image || null);
          setPreviewStory(d.story_image || null);
        }
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormArray = (setter, index, key, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const addFormRow = (setter, row) => {
    setter((prev) => [...prev, row]);
  };

  const removeFormRow = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = new FormData();

    Object.keys(data).forEach((key) => {
      form.append(key, data[key]);
    });

    if (heroImage) form.append("hero_image", heroImage);
    if (storyImage) form.append("story_image", storyImage);

    form.append("timeline", JSON.stringify(timeline));
    form.append("team", JSON.stringify(team));
    form.append("why_choose_us", JSON.stringify(whyChooseUs));

    api
      .post("/about", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        alert("About Us Updated Successfully!");

        const d = res.data.data;
        setPreviewHero(d.hero_image);
        setPreviewStory(d.story_image);
      })
      .catch((err) => {
        console.error(err);
        alert("Error updating About Us!");
      });
  };

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">About Us Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ---------------- HERO SECTION ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Hero Section</h3>

          <input
            type="text"
            placeholder="Hero Title"
            value={data.hero_title}
            onChange={(e) => handleInput("hero_title", e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />

          <input
            type="text"
            placeholder="Hero Subtitle"
            value={data.hero_subtitle}
            onChange={(e) => handleInput("hero_subtitle", e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />

          {/* Hero Image */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setHeroImage(e.target.files[0]);
              setPreviewHero(URL.createObjectURL(e.target.files[0]));
            }}
          />

          {previewHero && <img src={previewHero} alt="Hero" className="w-40 mt-3 rounded-lg" />}
        </div>

        {/* ---------------- STORY SECTION ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Story Section</h3>

          <input
            type="text"
            placeholder="Story Title"
            value={data.story_title}
            onChange={(e) => handleInput("story_title", e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />

          <textarea
            placeholder="Story Description"
            rows="4"
            value={data.story_description}
            onChange={(e) => handleInput("story_description", e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          ></textarea>

          {/* Story Image */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setStoryImage(e.target.files[0]);
              setPreviewStory(URL.createObjectURL(e.target.files[0]));
            }}
          />

          {previewStory && (
            <img src={previewStory} alt="Story" className="w-40 mt-3 rounded-lg" />
          )}
        </div>

        {/* ---------------- MISSION & VISION ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Mission & Vision</h3>

          <textarea
            placeholder="Mission"
            rows="3"
            value={data.mission}
            onChange={(e) => handleInput("mission", e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          ></textarea>

          <textarea
            placeholder="Vision"
            rows="3"
            value={data.vision}
            onChange={(e) => handleInput("vision", e.target.value)}
            className="w-full p-3 border rounded-lg"
          ></textarea>
        </div>

        {/* ---------------- COUNTERS ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Counters</h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customers"
              value={data.counter_customers}
              onChange={(e) => handleInput("counter_customers", e.target.value)}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Orders"
              value={data.counter_orders}
              onChange={(e) => handleInput("counter_orders", e.target.value)}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Products"
              value={data.counter_products}
              onChange={(e) => handleInput("counter_products", e.target.value)}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Rating"
              value={data.counter_rating}
              onChange={(e) => handleInput("counter_rating", e.target.value)}
              className="p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* ---------------- TIMELINE ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Timeline</h3>

          {timeline.map((row, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Year"
                value={row.year}
                onChange={(e) =>
                  handleFormArray(setTimeline, i, "year", e.target.value)
                }
                className="p-2 border rounded-lg w-32"
              />

              <input
                type="text"
                placeholder="Description"
                value={row.text}
                onChange={(e) =>
                  handleFormArray(setTimeline, i, "text", e.target.value)
                }
                className="p-2 border rounded-lg flex-1"
              />

              <button
                type="button"
                onClick={() => removeFormRow(setTimeline, i)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
              >
                X
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addFormRow(setTimeline, { year: "", text: "" })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            + Add Timeline
          </button>
        </div>

        {/* ---------------- TEAM ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Team Members</h3>

          {team.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Name"
                value={row.name}
                onChange={(e) =>
                  handleFormArray(setTeam, i, "name", e.target.value)
                }
                className="p-2 border rounded-lg"
              />

              <input
                type="text"
                placeholder="Role"
                value={row.role}
                onChange={(e) =>
                  handleFormArray(setTeam, i, "role", e.target.value)
                }
                className="p-2 border rounded-lg"
              />

              <input
                type="text"
                placeholder="Image URL"
                value={row.image}
                onChange={(e) =>
                  handleFormArray(setTeam, i, "image", e.target.value)
                }
                className="p-2 border rounded-lg"
              />

              <button
                type="button"
                onClick={() => removeFormRow(setTeam, i)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
              >
                X
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addFormRow(setTeam, { name: "", role: "", image: "" })
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            + Add Team Member
          </button>
        </div>

        {/* ---------------- WHY CHOOSE US ---------------- */}
        <div>
          <h3 className="text-xl font-bold mb-3">Why Choose Us</h3>

          {whyChooseUs.map((row, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Icon"
                value={row.icon}
                onChange={(e) =>
                  handleFormArray(setWhyChooseUs, i, "icon", e.target.value)
                }
                className="p-2 border rounded-lg w-28"
              />

              <input
                type="text"
                placeholder="Title"
                value={row.title}
                onChange={(e) =>
                  handleFormArray(setWhyChooseUs, i, "title", e.target.value)
                }
                className="p-2 border rounded-lg flex-1"
              />

              <button
                type="button"
                onClick={() => removeFormRow(setWhyChooseUs, i)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
              >
                X
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addFormRow(setWhyChooseUs, { icon: "", title: "" })
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            + Add Feature
          </button>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AboutUsForm; 