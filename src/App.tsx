import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import LandingPage from './LandingPage';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      return localStorage.getItem('admin_authorized') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [correctPassword, setCorrectPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCorrectPassword(docSnap.data().adminPassword || 'admin123');
        } else {
          setCorrectPassword('admin123');
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthorized(true);
      try {
        localStorage.setItem('admin_authorized', 'true');
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    } else {
      alert('كلمة المرور خاطئة');
    }
  };

  if (isLoading && !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthorized) return <>{children}</>;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">تسجيل دخول لوحة التحكم</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل كلمة المرور"
            />
          </div>
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/adminahmed" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/:slug" element={<LandingPage />} />
        <Route path="/" element={
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-4">نظام CPA PRO V2</h1>
            <p className="text-slate-400 max-w-md">مرحباً بك في نظام إدارة عروض الـ CPA. يرجى التوجه إلى لوحة التحكم أو استخدام رابط العرض المباشر.</p>
            <div className="mt-8 flex gap-4">
              <a href="#/adminahmed" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold transition-all">لوحة التحكم</a>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
