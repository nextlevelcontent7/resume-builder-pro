import { useAdminAuth } from '../hooks/useAdminAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function TopBar() {
  const { user, logout } = useAdminAuth();
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between bg-white border-b px-4 py-2 shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <Link to="/admin" className="font-semibold text-lg text-gray-700">
          {t('admin')}
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span>{user.name}</span>}
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
