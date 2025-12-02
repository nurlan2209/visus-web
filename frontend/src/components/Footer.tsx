import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>{t('footer.copyright')}</div>
        <div className="footer-links">
          <a href="#about">{t('footer.links.about')}</a>
          <a href="#services">{t('footer.links.services')}</a>
          <a href="#contacts">{t('footer.links.contacts')}</a>
        </div>
      </div>
    </footer>
  );
}
