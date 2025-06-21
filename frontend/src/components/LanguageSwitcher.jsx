import { useContext } from 'react';
import { LanguageContext } from '../i18n/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { lang, setLang } = useContext(LanguageContext);
  const { t } = useTranslation();

  const toggle = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <button onClick={toggle} className="px-2 py-1 border rounded">
      {lang === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
