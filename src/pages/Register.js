import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => { 
    e.preventDefault();
    try {
      const res = await api.post('create-admin', form);
      if (res.data.status) {
        alert('Admin created successfully! Please login.');
        nav('/login');
      } else {
        setError(res.data.message || 'Failed');
      }
    } catch (err) {
      setError(err?.response?.data?.error_message || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <pre className="text-sm text-red-600 mb-2">{JSON.stringify(error, null, 2)}</pre>}
      <form onSubmit={submit} className="space-y-3">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name" className="w-full border px-3 py-2 rounded" />
        <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email" type="email" className="w-full border px-3 py-2 rounded" />
        <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone" className="w-full border px-3 py-2 rounded" />
        <input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password" type="password" className="w-full border px-3 py-2 rounded" />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Create Account</button>
      </form>
    </div>
  );
}
