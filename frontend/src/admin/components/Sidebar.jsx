import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const links = [
  { to: '', label: 'dashboard' },
  { to: 'users', label: 'users' },
  { to: 'resumes', label: 'resumes' },
  { to: 'analytics', label: 'analytics' },
  { to: 'settings', label: 'settings' },
  { to: 'logs', label: 'logs' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="w-64 bg-gray-800 text-white space-y-2 p-4 hidden md:block">
      <h2 className="text-2xl font-semibold mb-4">{t('admin')}</h2>
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === ''}
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            {t(link.label)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
