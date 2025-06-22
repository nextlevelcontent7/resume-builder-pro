import { useTranslation } from 'react-i18next';
import useFetch from '../hooks/useFetch';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, loading } = useFetch('/api/admin/analytics');

  if (loading) return <p>{t('loading')}...</p>;
  if (!data) return <p>{t('error')}</p>;

  const { users, resumes } = data;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t('users')} value={users} />
        <StatsCard title={t('resumes')} value={resumes} />
      </div>
    </div>
  );
}
