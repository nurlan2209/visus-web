import { useTranslation } from 'react-i18next';

export function Diagnostics() {
  const { t } = useTranslation();
  const items = t('diagnostics.list', { returnObjects: true }) as string[];

  return (
    <section id="diagnostics" className="section--blue">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('diagnostics.kicker')}</div>
            <h2 className="section-title">{t('diagnostics.title')}</h2>
          </div>
          <p className="section-subtitle">{t('diagnostics.subtitle')}</p>
        </div>

        <div className="diag-grid">
          <div className="diag-photo-grid">
            <div className="diag-photo diag-photo--tall">
              <img src="/assets/placeholder.png" alt={t('diagnostics.title')} />
            </div>
            <div className="diag-photo">
              <img src="/assets/placeholder.png" alt={t('diagnostics.title')} />
            </div>
            <div className="diag-photo">
              <img src="/assets/placeholder.png" alt={t('diagnostics.title')} />
            </div>
          </div>

          <aside className="diag-card">
            <h3>{t('diagnostics.cardTitle')}</h3>
            <ul className="diag-list">
              {items.map((item, index) => (
                <li key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
            <p className="diag-note">{t('diagnostics.note')}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
