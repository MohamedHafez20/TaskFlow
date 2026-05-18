// 🔐 Login Page — Mohamed's task
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');

    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">⚡ TaskFlow</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="••••••••"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
