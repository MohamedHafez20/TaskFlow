// 📝 Register Page — Mohamed's task
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created!');
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
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Get started</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'John Doe'         },
              { name: 'email',    label: 'Email',           type: 'email',    placeholder: 'you@example.com'  },
              { name: 'password', label: 'Password',        type: 'password', placeholder: '••••••••'         },
              { name: 'confirm',  label: 'Confirm Password',type: 'password', placeholder: '••••••••'         },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
                <input
                  name={field.name} type={field.type} value={form[field.name]}
                  onChange={handleChange} placeholder={field.placeholder}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
