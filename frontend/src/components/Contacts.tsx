import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Contacts() {
  const { t } = useTranslation();
  const [mapError, setMapError] = useState(false);

  return (
    <section id="contacts" className="section--green">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('contacts.kicker')}</div>
            <h2 className="section-title">{t('contacts.title')}</h2>
          </div>
          <p className="section-subtitle contacts-subtitle">{t('contacts.subtitle')}</p>
        </div>

        <div className="contacts-grid">
          <div className="contacts-block">
            <div className="contacts-item">
              <div className="contacts-label">Адрес</div>
              <strong>{t('contacts.addressTitle')}</strong>
              <span>{t('contacts.address')}</span>
            </div>

            <div className="contacts-item">
              <div className="contacts-label">Телефон</div>
              <strong>
                <a href="tel:+77001234567">{t('header.phone')}</a>
              </strong>
              <span>{t('contacts.phoneLabel')}</span>
            </div>

            <div className="contacts-item">
              <div className="contacts-label">Режим работы</div>
              <span>{t('contacts.hours')}</span>
            </div>

            <div className="contacts-item">
              <div className="contacts-label">Социальные сети</div>
              <span>{t('contacts.socials')}</span>
            </div>
          </div>

          <div className="contacts-map">
            {!mapError && (
              <iframe
                title="Карта VISUS"
                src="https://makemap.2gis.ru/widget?data=eJw1j0FrwzAMhf-LdjUlSpzGCey60sOgp21s9BBqdTM4kXFcWBvy36c4zBeZ96RPTzNwtBTJHogHStHRBN3XDOkeCDp4oT7dIoGCEDlQTNkX2yW_-m-Df9iP12dpsDRdogvJ8SiGCBf2HOX7VJQGr6Uoj-No6Rc6LP7fouB7W3zP2G3rid2YMkHCubFPOVSDO60ro1WNOyxMu2_OMu6s8LCql7OCoQ8nntwWYQbfJ-hyc6NNVayl1UaBX-1Mw6ZCXZetxhYlHvMgsL1Q5RT2_v2HyH9mNcUbLX87cFvz"
                loading="lazy"
                className="contacts-map-embed contacts-map-embed--full"
                sandbox="allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
                onError={() => setMapError(true)}
              />
            )}
            {mapError && (
              <div className="contacts-map-fallback">
                <div>Карта 2ГИС временно недоступна.</div>
                <a
                  href="https://go.2gis.com/35yxo"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-light"
                  style={{ marginTop: 10 }}
                >
                  Открыть в 2ГИС
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
