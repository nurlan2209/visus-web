import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Doctor } from '../types';

interface DoctorsProps {
  apiBaseUrl: string;
}

export function Doctors({ apiBaseUrl }: DoctorsProps) {
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const computeMediaBase = () => {
    if (import.meta.env.VITE_MEDIA_URL) {
      return import.meta.env.VITE_MEDIA_URL.replace(/\/$/, '');
    }
    if (import.meta.env.VITE_API_URL) {
      return `${new URL(import.meta.env.VITE_API_URL).origin.replace(/\/$/, '')}/media`;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin.replace(/\/$/, '')}/media`;
    }
    return '/media';
  };
  const mediaBase = computeMediaBase();
  const resolveMedia = (path?: string) => {
    if (!path) return '';
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('/')) {
      return path;
    }
    const base = mediaBase.replace(/\/$/, '');
    return `${base}/${path.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        console.debug('[Doctors] fetching from', `${apiBaseUrl}/doctors`);
        const res = await fetch(`${apiBaseUrl}/doctors`);
        if (!res.ok) throw new Error('Failed to load doctors');
        const data = (await res.json()) as Array<Record<string, any>>;
        const normalized = data.map((item) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          experienceYears: item.experienceYears ?? item.experience_years ?? 0,
          descriptionRu: item.descriptionRu ?? item.description_ru ?? '',
          descriptionKk: item.descriptionKk ?? item.description_kk ?? '',
          photoUrl: item.photoUrl ?? item.photo_url ?? '',
        })) as Doctor[];
        console.debug('[Doctors] loaded', data.length, 'items');
        setDoctors(normalized);
      } catch (e) {
        console.warn('Doctors fetch error', e);
        setDoctors([]);
      }
    };
    load();
  }, [apiBaseUrl]);

  const currentDescription = (doctor: Doctor) => {
    const lang = t('lang') || i18n.language;
    if (lang === 'kk') {
      return doctor.descriptionKk || doctor.descriptionRu;
    }
    return doctor.descriptionRu || doctor.descriptionKk;
  };

  

  return (
    <section id="doctors" className="section--soft">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('doctors.kicker')}</div>
            <h2 className="section-title">{t('doctors.title')}</h2>
          </div>
        </div>

        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <article className="doctor-card" key={doctor.name}>
              <div className="doctor-photo">
                <img
                  src={resolveMedia(doctor.photoUrl)}
                  alt={doctor.name}
                  onError={(e) => {
                    e.currentTarget.src = '';
                  }}
                />
              </div>
              <div className="doctor-body">
                <div className="doctor-name">{doctor.name}</div>
                <div className="doctor-role">{doctor.role}</div>
                <div className="doctor-exp">
                  {doctor.experienceYears ? `${doctor.experienceYears} ${t('doctors.yearsLabel') ?? 'лет'}` : ''}
                </div>
                {currentDescription(doctor) && <p className="doctor-quote">{currentDescription(doctor)}</p>}
              </div>
            </article>
          ))}
          {doctors.length === 0 && (
            <div className="service-text" style={{ gridColumn: '1 / -1' }}>
              {t('doctors.empty', 'Скоро добавим врачей')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
