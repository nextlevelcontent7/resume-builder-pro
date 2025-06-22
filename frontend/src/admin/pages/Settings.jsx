import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import SettingToggle from '../components/SettingToggle';

export default function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios
      .get('/api/admin/settings')
      .then((res) => setSettings(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleToggle = async (key, value) => {
    try {
      const res = await axios.post('/api/admin/settings', { [key]: value });
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!settings) return <p>{t('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>
      {Object.keys(settings).map((key) => (
        <SettingToggle
          key={key}
          label={t(key)}
          checked={settings[key]}
          onChange={(value) => handleToggle(key, value)}
        />
      ))}
    </div>
  );
}
