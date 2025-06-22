import { useTranslation } from 'react-i18next';
import useFetch from '../hooks/useFetch';

export default function Analytics() {
  const { t } = useTranslation();
  const { data, loading } = useFetch('/api/admin/analytics');

  if (loading) return <p>{t('loading')}</p>;
  if (!data) return <p>{t('error')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('analytics')}</h1>
      <pre className="bg-gray-100 p-4 rounded text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
