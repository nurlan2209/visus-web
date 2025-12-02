import { useTranslation } from 'react-i18next';
import type { FactItem } from '../types';

export function About() {
  const { t } = useTranslation();
  const facts = t('about.facts', { returnObjects: true }) as FactItem[];

  return (
    <section id="about">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('about.kicker')}</div>
            <h2 className="section-title">{t('about.title')}</h2>
          </div>
          <p className="section-subtitle">{t('about.subtitle')}</p>
        </div>

        <div className="about-grid">
          <div className="about-photo">
            <img src="/assets/placeholder.png" alt={t('about.title')} />
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
          </div>
        </div>
      </div>
    </section>
  );
}
