import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const emptyEdu = { degree: '', school: '', startDate: '', endDate: '' };
const emptyExp = { jobTitle: '', company: '', startDate: '', endDate: '', description: '' };

export default function ResumeForm() {
  const { t } = useTranslation();
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', birthDate: '', location: '', nationality: '' });
  const [education, setEducation] = useState([ { ...emptyEdu } ]);
  const [experience, setExperience] = useState([ { ...emptyExp } ]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState({ language: '', level: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [error, setError] = useState('');

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonal({ ...personal, [name]: value });
  };

  const addEducation = () => setEducation([...education, { ...emptyEdu }]);
  const removeEducation = (i) => setEducation(education.filter((_, idx) => idx !== i));
  const handleEducationChange = (i, e) => {
    const { name, value } = e.target;
    const updated = education.slice();
    updated[i][name] = value;
    setEducation(updated);
  };

  const addExperience = () => setExperience([...experience, { ...emptyExp }]);
  const removeExperience = (i) => setExperience(experience.filter((_, idx) => idx !== i));
  const handleExperienceChange = (i, e) => {
    const { name, value } = e.target;
    const updated = experience.slice();
    updated[i][name] = value;
    setExperience(updated);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  const addLanguage = () => {
    if (languageInput.language && languageInput.level) {
      setLanguages([...languages, languageInput]);
      setLanguageInput({ language: '', level: '' });
    }
  };
  const removeLanguage = (i) => setLanguages(languages.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setError('');
    setDownloadLink('');
    try {
      const data = {
        personalInfo: personal,
        education,
        experience,
        skills,
        languages,
      };
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      const createRes = await axios.post('/api/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const id = createRes.data?.data?._id;
      if (id) {
        const exportRes = await axios.get(`/api/resumes/${id}/export`);
        setDownloadLink(exportRes.data?.data?.url || '');
      }
    } catch (err) {
      setError(t('error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={personal.name} onChange={handlePersonalChange} placeholder={t('name')} className="border p-2" />
        <input name="email" value={personal.email} onChange={handlePersonalChange} placeholder={t('email')} className="border p-2" />
        <input name="phone" value={personal.phone} onChange={handlePersonalChange} placeholder={t('phone')} className="border p-2" />
        <input type="date" name="birthDate" value={personal.birthDate} onChange={handlePersonalChange} className="border p-2" />
        <input name="location" value={personal.location} onChange={handlePersonalChange} placeholder={t('location')} className="border p-2" />
        <input name="nationality" value={personal.nationality} onChange={handlePersonalChange} placeholder={t('nationality')} className="border p-2" />
        <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} className="border p-2 col-span-1" />
      </div>

      <div>
        <h2 className="font-bold mb-2">{t('education')}</h2>
        {education.map((edu, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(i, e)} placeholder={t('degree')} className="border p-2" />
            <input name="school" value={edu.school} onChange={(e) => handleEducationChange(i, e)} placeholder={t('school')} className="border p-2" />
            <input type="date" name="startDate" value={edu.startDate} onChange={(e) => handleEducationChange(i, e)} className="border p-2" />
            <input type="date" name="endDate" value={edu.endDate} onChange={(e) => handleEducationChange(i, e)} className="border p-2" />
            <button onClick={() => removeEducation(i)} className="text-red-500">{t('remove')}</button>
          </div>
        ))}
        <button onClick={addEducation} className="mt-2 px-2 py-1 border">{t('addEducation')}</button>
      </div>

      <div>
        <h2 className="font-bold mb-2">{t('experience')}</h2>
        {experience.map((exp, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <input name="jobTitle" value={exp.jobTitle} onChange={(e) => handleExperienceChange(i, e)} placeholder={t('jobTitle')} className="border p-2" />
            <input name="company" value={exp.company} onChange={(e) => handleExperienceChange(i, e)} placeholder={t('company')} className="border p-2" />
            <input type="date" name="startDate" value={exp.startDate} onChange={(e) => handleExperienceChange(i, e)} className="border p-2" />
            <input type="date" name="endDate" value={exp.endDate} onChange={(e) => handleExperienceChange(i, e)} className="border p-2" />
            <textarea name="description" value={exp.description} onChange={(e) => handleExperienceChange(i, e)} placeholder={t('description')} className="border p-2 md:col-span-4" />
            <button onClick={() => removeExperience(i)} className="text-red-500">{t('remove')}</button>
          </div>
        ))}
        <button onClick={addExperience} className="mt-2 px-2 py-1 border">{t('addExperience')}</button>
      </div>

      <div>
        <h2 className="font-bold mb-2">{t('skills')}</h2>
        <div className="flex space-x-2 mb-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="border p-2 flex-grow" />
          <button onClick={addSkill} className="px-2 py-1 border">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {skill} <button onClick={() => removeSkill(i)} className="ml-1 text-red-500">x</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-2">{t('languages')}</h2>
        <div className="flex space-x-2 mb-2">
          <input value={languageInput.language} onChange={(e) => setLanguageInput({ ...languageInput, language: e.target.value })} placeholder={t('language')} className="border p-2" />
          <input value={languageInput.level} onChange={(e) => setLanguageInput({ ...languageInput, level: e.target.value })} placeholder={t('level')} className="border p-2" />
          <button onClick={addLanguage} className="px-2 py-1 border">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map((lng, i) => (
            <span key={i} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {lng.language} ({lng.level}) <button onClick={() => removeLanguage(i)} className="ml-1 text-red-500">x</button>
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {downloadLink && (
        <a href={downloadLink} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
          {t('exportSuccess')}
        </a>
      )}

      <div className="space-x-2">
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
          {t('export')}
        </button>
      </div>
    </div>
  );
}
