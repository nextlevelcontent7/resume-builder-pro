import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Logs() {
  const { t } = useTranslation();
  const [level, setLevel] = useState('info');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/logs', { params: { level } });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [level]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('logs')}</h1>
      <select value={level} onChange={(e) => setLevel(e.target.value)} className="border p-1">
        <option value="info">info</option>
        <option value="error">error</option>
        <option value="warn">warn</option>
      </select>
      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <pre className="bg-gray-800 text-green-400 p-4 text-xs overflow-auto h-96">
          {logs.join('\n')}
        </pre>
      )}
    </div>
  );
}
