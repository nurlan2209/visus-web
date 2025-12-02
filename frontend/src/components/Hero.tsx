import { useTranslation } from 'react-i18next';

interface HeroProps {
  onBook: () => void;
}

export function Hero({ onBook }: HeroProps) {
  const { t } = useTranslation();
  const stats = t('hero.stats', { returnObjects: true }) as Array<{ value: string; label: string }>;

  return (
    <section className="hero" id="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <div className="pill">
            <span className="pill-dot" />
            {t('hero.pill')}
          </div>
          <h1 className="hero-title">
            {t('hero.titleLine1')}
            <br />
            <span>{t('hero.titleAccent')}</span>
          </h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-cta-row">
            <button className="btn btn-primary" onClick={onBook}>
              {t('header.cta')}
            </button>
          </div>
          <div className="hero-note">
            <span>i</span>
            {t('hero.note')}
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-media">
          <div className="hero-card">
            <div className="hero-image-main" />
            <div className="hero-card-overlay" />
            <div className="hero-card-inner">
              <div>
                <div className="hero-badge">
                  <div className="hero-badge-icon">👁</div>
                  {t('hero.badge')}
                </div>
                <div className="hero-mini-title">{t('hero.miniTitle')}</div>
                <div className="hero-mini-text">{t('hero.miniText')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
