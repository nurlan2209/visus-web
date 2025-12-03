import { useTranslation } from 'react-i18next';

interface PriceGroup {
  title: string;
  items: Array<{ name: string; price: string }>;
}

export function Services() {
  const { t } = useTranslation();
  const priceGroups = (t('services.priceGroups', { returnObjects: true }) as PriceGroup[]) ?? [];
  const priceHeaders = t('services.tableHeaders', { returnObjects: true }) as { name: string; price: string };

  return (
    <section id="services">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('services.kicker')}</div>
            <h2 className="section-title">{t('services.title')}</h2>
          </div>
          <p className="section-subtitle">{t('services.subtitle')}</p>
        </div>
        <div className="services-price-list">
          {priceGroups.map((group) => (
            <details className="services-accordion" key={group.title}>
              <summary>{group.title}</summary>
              <div className="services-table">
                <table>
                  <thead>
                    <tr>
                      <th>{priceHeaders?.name ?? 'Услуга'}</th>
                      <th>{priceHeaders?.price ?? 'Цена'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={`${group.title}-${item.name}`}>
                        <td>{item.name}</td>
                        <td>{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
