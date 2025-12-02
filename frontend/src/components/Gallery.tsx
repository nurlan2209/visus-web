import { useTranslation } from 'react-i18next';

interface GalleryProps {
  onBook: () => void;
}

export function Gallery({ onBook }: GalleryProps) {
  const { t } = useTranslation();

  return (
    <section id="gallery">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('gallery.kicker')}</div>
            <h2 className="section-title">{t('gallery.title')}</h2>
          </div>
          <p className="section-subtitle">{t('gallery.subtitle')}</p>
        </div>

        <div className="gallery-grid">
          <div className="gallery-main">
            <img src="/assets/placeholder.png" alt={t('gallery.title')} />
          </div>
          <div className="gallery-side">
            <div className="gallery-item">
              <img src="/assets/placeholder.png" alt={t('gallery.title')} />
            </div>
            <div className="gallery-item">
              <img src="/assets/placeholder.png" alt={t('gallery.title')} />
            </div>
          </div>
        </div>

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
