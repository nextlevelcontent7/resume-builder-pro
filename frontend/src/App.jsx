import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import DarkModeToggle from './components/DarkModeToggle';
import ResumeForm from './pages/ResumeForm';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';

export default function App() {
  return (
    <LanguageProvider>
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
              </Route>
              <Route path="/" element={<ResumeForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}
