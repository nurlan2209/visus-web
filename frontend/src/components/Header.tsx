import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onBook: () => void;
}

export function Header({ onBook }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: '#services', label: t('nav.services') },
      { href: '#diagnostics', label: t('nav.diagnostics') },
      { href: '#doctors', label: t('nav.doctors') },
      { href: '#gallery', label: t('nav.gallery') },
      { href: '#reviews', label: t('nav.reviews') },
      { href: '#contacts', label: t('nav.contacts') },
    ],
    [t]
  );

  const changeLanguage = (lng: 'ru' | 'kk') => {
    i18n.changeLanguage(lng);
    setMobileOpen(false);
  };

  return (
    <header className={`header ${mobileOpen ? 'header--open' : ''}`}>
      <div className="container header-inner">
        <div className="logo-group">
          <div className="logo-mark">
            <img src="/assets/logo_black.png" alt="VISUS" />
          </div>
          <div className="logo-text">
            <div className="logo-text-main">VISUS</div>
            <div className="logo-text-sub">{t('header.subtitle')}</div>
          </div>
          <button
            className="hamburger"
            aria-label="Меню"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className="nav" aria-label="Навигация по секциям">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-cta">
          <div className="header-phone">
            <a href="tel:+77775136969">{t('header.phone')}</a>
            <span>{t('header.hours')}</span>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav">
          <div className="lang-switcher" aria-label="Выбор языка">
            <button
              className={i18n.language === 'ru' ? 'lang-btn lang-btn--active' : 'lang-btn'}
              onClick={() => changeLanguage('ru')}
            >
              {t('languages.ru')}
            </button>
            <button
              className={i18n.language === 'kk' ? 'lang-btn lang-btn--active' : 'lang-btn'}
              onClick={() => changeLanguage('kk')}
            >
              {t('languages.kk')}
            </button>
          </div>
          <nav>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mobile-nav-actions">
            <button className="btn btn-primary" onClick={() => { onBook(); setMobileOpen(false); }}>
              {t('header.cta')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
