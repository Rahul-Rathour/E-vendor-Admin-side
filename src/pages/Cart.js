import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Cart() {
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    const res = await api.get('/cart');
    setCart(res.data.data || []);
  };

  const removeItem = async (id) => {
    await api.delete(`/cart-delete/${id}`);
    fetchCart();
  };

  const updateQty = async (id, quantity) => {
    await api.post(`/cart-update/${id}`, { quantity });
    fetchCart();
  };

  const checkout = async () => {
    await api.post('/cart-checkout');
    alert('Order placed successfully!');
    fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white shadow p-3 mb-3 rounded-lg">
              <div>
                <h3 className="font-semibold">{item.product.name}</h3>
                <p>${item.product.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQty(item.id, e.target.value)}
                  className="w-14 border rounded text-center"
                />
                <button onClick={() => removeItem(item.id)} className="text-red-500">🗑</button>
              </div>
            </div>
          ))}
          <button onClick={checkout} className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700 mt-4">
            Checkout
          </button>
        </>
      )}
    </div>
  );
}
