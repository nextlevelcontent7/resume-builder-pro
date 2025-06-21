import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import PDFViewer from '../components/PDFViewer';
import { LanguageContext } from '../i18n/LanguageContext';

export default function ResumePreview() {
  const { id } = useParams();
  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/resumes/${id}`)
      .then(res => {
        setResume(res.data.data);
        setError('');
      })
      .catch(() => {
        setError(t('loadError'));
      })
      .finally(() => setLoading(false));
  }, [id, lang, t]);

  const exportPDF = async () => {
    try {
      const res = await axios.get(`/api/resumes/${id}/export`);
      setPdfUrl(res.data.data.url);
    } catch (e) {
      setError(t('exportFailed'));
    }
  };

  if (loading) return <p>{t('loading')}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{resume.personalInfo.name}</h1>
      <p>{resume.personalInfo.email} | {resume.personalInfo.phone}</p>
      <p>{resume.personalInfo.location}</p>

      <div>
        <h2 className="font-semibold">{t('education')}</h2>
        {resume.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-medium">{edu.degree} - {edu.school}</p>
            <p>{edu.startDate} - {edu.endDate}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold">{t('experience')}</h2>
        {resume.experience.map((exp, i) => (
          <div key={i} className="mb-2">
            <p className="font-medium">{exp.jobTitle} - {exp.company}</p>
            <p>{exp.startDate} - {exp.endDate}</p>
            <p>{exp.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold">{t('skills')}</h2>
        <ul className="list-disc list-inside">
          {resume.skills.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <button onClick={exportPDF} className="px-4 py-2 bg-blue-600 text-white rounded">
        {t('export')}
      </button>

      {pdfUrl && <PDFViewer url={pdfUrl} />}
    </div>
  );
}
