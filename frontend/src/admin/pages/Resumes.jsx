import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function Resumes() {
  const { t } = useTranslation();
  const [resumes, setResumes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/resumes', {
        params: { page },
      });
      setResumes(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('resumes')}</h1>
      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-2 text-left">{t('title')}</th>
              <th className="p-2 text-left">{t('user')}</th>
              <th className="p-2 text-left">{t('updated')}</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.title}</td>
                <td className="p-2">{r.user?.name}</td>
                <td className="p-2">{new Date(r.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex space-x-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-2 py-1 border rounded"
        >
          {t('prev')}
        </button>
        <span>
          {page} / {Math.ceil(total / 10) || 1}
        </span>
        <button onClick={() => setPage((p) => p + 1)} className="px-2 py-1 border rounded">
          {t('next')}
        </button>
      </div>
    </div>
  );
}
