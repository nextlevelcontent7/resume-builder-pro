import React from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import DarkModeToggle from './components/DarkModeToggle';
import ResumeForm from './pages/ResumeForm';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="p-4 flex justify-end space-x-2">
          <LanguageSwitcher />
          <DarkModeToggle />
        </header>
        <main className="container mx-auto p-4">
          <ResumeForm />
        </main>
      </div>
    </LanguageProvider>
  );
}
