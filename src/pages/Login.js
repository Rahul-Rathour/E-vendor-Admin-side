import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('admin-login', { email, password });
      
      // ✅ Store token properly (no JSON.stringify)
      localStorage.setItem('token', res.data.token);

      // ✅ Small delay ensures token is saved before redirect
      setTimeout(() => {
        navigate('/dashboard'); // redirect to your admin dashboard
      }, 100);

    } catch (error) {
      alert('Invalid credentials');
      console.error(error);
    }
  };

  return (
    <div className="h-[80vh] flex justify-center items-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white shadow-lg p-6 rounded-xl w-80 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Admin Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="border w-full mb-3 p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full mb-3 p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
}
