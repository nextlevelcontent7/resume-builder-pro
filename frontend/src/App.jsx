import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import DarkModeToggle from './components/DarkModeToggle';
import ResumeForm from './pages/ResumeForm';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import { AdminAuthProvider } from './admin/hooks/useAdminAuth';
import Users from './admin/pages/Users';
import Resumes from './admin/pages/Resumes';
import Settings from './admin/pages/Settings';
import Logs from './admin/pages/Logs';
import Analytics from './admin/pages/Analytics';

export default function App() {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="p-4 flex justify-end space-x-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </header>
            <main className="container mx-auto p-4">
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="resumes" element={<Resumes />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="logs" element={<Logs />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>
                <Route path="/" element={<ResumeForm />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}
