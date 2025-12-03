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
            <div className="hero-card-brand">
              <img src="/assets/logo_black_w.png" alt="VISUS" />
            </div>
            <img src="/assets/photo1.png" alt={t('hero.cardAlt', { defaultValue: 'Пациент VISUS' })} className="hero-card-photo hero-card-photo-main" />
            <img src="/assets/photo2.png" alt="" aria-hidden="true" className="hero-card-photo hero-card-photo-hover" />
          </div>
        </div>
      </div>
    </section>
  );
}
