import React, { useEffect, useState } from "react";
import api from "../api"
import { useNavigate } from "react-router-dom";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    const res = await api.get(`/categories`);
    setCategories(res.data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`delete-category/${id}`);
    fetchCategories();
  };



  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-600">
        Manage Categories
      </h2>

      {/* Categories List */}
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <img
              src={`${process.env.REACT_APP_API_URL}/storage/${cat.image}`}
              alt={cat.image}
              className="h-32 w-full object-cover rounded-md mb-3"
            />
            <h3 className="text-lg font-semibold">{cat.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{cat.description}</p>
            <p className="text-sm text-blue-600 font-medium">
              Subcategories: {cat.subcategories ? cat.subcategories.length : 0}
            </p>
            <button
              onClick={() => navigate(`/update-category/${cat.id}`)}
              className="mt-3 bg-blue-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCategories;
