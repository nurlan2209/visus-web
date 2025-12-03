import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FactItem, MediaAsset } from '../types';

interface AboutProps {
  apiBaseUrl: string;
  onBook: () => void;
}

export function About({ apiBaseUrl, onBook }: AboutProps) {
  const { t } = useTranslation();
  const facts = t('about.facts', { returnObjects: true }) as FactItem[];
  const highlights =
    (t('about.highlights', { returnObjects: true }) as Array<{ title: string; text: string; tag?: string }>) ?? [];
  const [photos, setPhotos] = useState<MediaAsset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightbox, setLightbox] = useState<MediaAsset | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const mediaBase =
    import.meta.env.VITE_MEDIA_URL ??
    (import.meta.env.VITE_API_URL
      ? `${new URL(import.meta.env.VITE_API_URL).origin.replace(/\/$/, '')}/media`
      : `${window.location.origin.replace(/\/$/, '')}/media`);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/media/interior`);
        if (!res.ok) throw new Error('Failed to load interior media');
        const data = (await res.json()) as Array<Record<string, any>>;
        const normalized = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          photoUrl: item.photoUrl ?? item.photo_url ?? '',
          category: item.category ?? 'interior',
        })) as MediaAsset[];
        setPhotos(normalized);
        setCurrentIndex(0);
      } catch (err) {
        console.warn('Interior media error', err);
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
    return [{ id: -1, photoUrl: '/assets/placeholder.png', title: '', description: '', category: 'interior' }];
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
    <section id="about">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('about.kicker')}</div>
            <h2 className="section-title">{t('about.title')}</h2>
          </div>
        </div>

        <div className="about-grid">
          <div
            className="about-photo media-slider"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={resolveMedia(currentPhoto?.photoUrl)}
              alt={currentPhoto?.title || t('about.title')}
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
            <div className="about-tag">{t('about.tag')}</div>
          </div>

          <div>
            <p className="about-text">{t('about.text')}</p>
            <div className="about-facts">
              {facts.map((fact) => (
                <div className="about-fact" key={fact.title}>
                  <strong>{fact.title}</strong>
                  <span>{fact.text}</span>
                </div>
              ))}
            </div>
            {highlights.length > 0 && (
              <div className="about-highlight-grid">
                {highlights.map((item) => (
                  <div className="about-highlight-card" key={item.title}>
                    {item.tag && <span className="about-highlight-tag">{item.tag}</span>}
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      <div className="about-cta-wrapper">
        <div className="cta-strip">
          <div>
            <div className="cta-strip-title">{t('gallery.ctaTitle')}</div>
            <div className="cta-strip-text">{t('gallery.ctaText')}</div>
          </div>
          <div className="cta-strip-actions">
            <button className="btn-light" onClick={onBook}>
              {t('gallery.actions.book')}
            </button>
            <button className="btn-ghost" onClick={onBook}>
              {t('gallery.actions.whatsapp')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
