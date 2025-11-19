import React from 'react';

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition">
      <img src={product.image ? `http://127.0.0.1:8000/storage/${product.image}` : '/noimage.png'} alt={product.name} className="h-40 w-full object-cover rounded-md" />
      <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
      <p className="text-gray-600 text-sm">{product.description}</p>
      <p className="text-blue-600 font-bold mt-2">${product.price}</p>
      <button
        onClick={() => addToCart(product.id)}
        className="mt-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 w-full"
      >
        Add to Cart
      </button>
    </div>
  );
}
