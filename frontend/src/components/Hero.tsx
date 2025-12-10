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
        <div className="hero-surface">
          <div className="pill">
            <span className="pill-dot" />
            {t('hero.pill')}
          </div>
          <h1 className="hero-title">
            {t('hero.titleLine1')}{' '}
            <span>{t('hero.titleAccent')}</span>
          </h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-cta-row hero-cta-row--wide">
            <button className="btn btn-primary" onClick={onBook}>
              {t('header.cta')}
            </button>
            <a className="btn btn-outline" href="#services">
              {t('nav.services')}
            </a>
          </div>
          <div className="hero-panel-footer">
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
        </div>
      </div>
    </section>
  );
}
