
import React, { useState } from 'react';
import { Employee } from '../types';
import { Lock, Mail, Loader2, AlertCircle, Ghost } from 'lucide-react';

interface LoginProps {
  employees: Employee[];
  onLogin: (user: Employee) => void;
}

const Login: React.FC<LoginProps> = ({ employees, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = employees.find(emp => emp.email === email && emp.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soul-dark p-6 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-soul-orange/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-soul-orange/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-soul-orange rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-soul-orange/40 transform -rotate-6">
            <Ghost size={40} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Soulful Journeys</h1>
          <p className="text-slate-400 mt-2 font-medium">Internal Management Hub</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 border border-rose-100 font-bold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-soul-orange transition-all font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs font-bold text-soul-orange hover:opacity-80">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-soul-orange transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-soul-orange text-white py-5 rounded-2xl font-bold hover:bg-soul-orange/90 transition-all shadow-xl shadow-soul-orange/30 flex items-center justify-center gap-2 text-lg active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In to Journey'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Demo Credentials</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-500"><span className="text-soul-orange">Admin:</span> sarah@admin.com / password</p>
              <p className="text-xs text-slate-500"><span className="text-soul-orange">HR:</span> marcus@hr.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
