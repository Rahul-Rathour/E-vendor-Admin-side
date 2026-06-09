import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('admin-login', { email, password });

      localStorage.setItem('token', res.data.token);

      toast.success("Login successful! Welcome back.");
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);

    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl mb-4">
            <span className="text-4xl">🛍️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-gray-500 mt-1">Sign in to manage your store</p>
        </div> 

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-orange-100">
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3.5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Forgot password? <span className="text-orange-600 hover:underline cursor-pointer">Reset here</span>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} Your Store. All rights reserved.
        </p>
      </div>
    </div>
  );
}