import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaAsset } from '../types';

interface DiagnosticsProps {
  apiBaseUrl: string;
}

export function Diagnostics({ apiBaseUrl }: DiagnosticsProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<MediaAsset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightbox, setLightbox] = useState<MediaAsset | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const items = t('diagnostics.list', { returnObjects: true }) as Array<{ title: string; text: string }>;
  const benefits = t('diagnostics.benefits', { returnObjects: true }) as Array<{ title: string; text: string }> | undefined;
  const mediaBase =
    import.meta.env.VITE_MEDIA_URL ??
    (import.meta.env.VITE_API_URL
      ? `${new URL(import.meta.env.VITE_API_URL).origin.replace(/\/$/, '')}/media`
      : `${window.location.origin.replace(/\/$/, '')}/media`);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/media/diagnostics`);
        if (!res.ok) throw new Error('Failed to load diagnostics media');
        const data = (await res.json()) as Array<Record<string, any>>;
        const normalized = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          photoUrl: item.photoUrl ?? item.photo_url ?? '',
          category: item.category ?? 'diagnostics',
        })) as MediaAsset[];
        setPhotos(normalized);
        setCurrentIndex(0);
      } catch (err) {
        console.warn('Diagnostics media error', err);
        setPhotos([]);
        setCurrentIndex(0);
      }
    };
    load();
  }, [apiBaseUrl]);

  const resolveMedia = (url?: string) => {
    if (!url) return '/assets/placeholder.png';
    if (url.startsWith('http')) return url;
    return `${mediaBase}/${url.replace(/^\/?media\//, '').replace(/^\/+/, '')}`;
  };

  const displayPhotos = useMemo(() => {
    if (photos.length) return photos;
    return [{ id: -1, photoUrl: '/assets/placeholder.png', title: '', description: '', category: 'diagnostics' }];
  }, [photos]);

  const showPrev = () => setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  const showNext = () => setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => setTouchStart(e.changedTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 40) {
      delta > 0 ? showPrev() : showNext();
    }
    setTouchStart(null);
  };

  const currentPhoto = displayPhotos[currentIndex];

  return (
    <section id="diagnostics" className="section--blue">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('diagnostics.kicker')}</div>
            <h2 className="section-title">{t('diagnostics.title')}</h2>
          </div>
        </div>

        <div className="diag-grid">
          <div
            className="media-slider diag-photo-slider"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={resolveMedia(currentPhoto?.photoUrl)}
              alt={currentPhoto?.title || t('diagnostics.title')}
              onClick={() => setLightbox(currentPhoto)}
            />
            {displayPhotos.length > 1 && (
              <>
                <button type="button" className="media-slider-btn media-slider-btn--prev" onClick={showPrev}>
                  ‹
                </button>
                <button type="button" className="media-slider-btn media-slider-btn--next" onClick={showNext}>
                  ›
                </button>
              </>
            )}
          </div>

          <aside className="diag-card">
            <h3>{t('diagnostics.cardTitle')}</h3>
            <ul className="diag-list">
              {items.map((item, index) => (
                <li key={item.title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            {benefits && benefits.length > 0 && (
              <div className="diag-benefits">
                {benefits.map((benefit) => (
                  <div key={benefit.title}>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.text}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="diag-note">{t('diagnostics.note')}</p>
          </aside>
        </div>
      </div>

      {lightbox && (
        <div className="media-lightbox" onClick={() => setLightbox(null)}>
          <div className="media-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="media-lightbox-close" onClick={() => setLightbox(null)}>
              ×
            </button>
            <img src={resolveMedia(lightbox.photoUrl)} alt={lightbox.title || ''} />
            {lightbox.title && <div className="media-lightbox-title">{lightbox.title}</div>}
            {lightbox.description && <div className="media-lightbox-desc">{lightbox.description}</div>}
          </div>
        </div>
      )}
    </section>
  );
}
