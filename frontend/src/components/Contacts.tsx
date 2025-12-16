import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ActionLink {
  label: string;
  href: string;
  icon?: string;
}

interface ContactItem {
  label: string;
  href?: string;
}

export function Contacts() {
  const { t } = useTranslation();
  const actions = (t('contacts.actions', { returnObjects: true }) as ActionLink[]) ?? [];
  const navItems = useMemo(
    () => [
      { href: '#services', label: t('nav.services') },
      { href: '#diagnostics', label: t('nav.diagnostics') },
      { href: '#doctors', label: t('nav.doctors') },
      { href: '#reviews', label: t('nav.reviews') },
    ],
    [t]
  );

  const contactColumns: { title: string; items: ContactItem[] }[] = [
    {
      title: t('contacts.contactTitle'),
      items: [
        { label: t('header.phone'), href: 'tel:+77775136969' },
        { label: t('contacts.email'), href: 'mailto:hello@visus.kz' },
      ],
    },
    {
      title: t('contacts.addressTitleShort'),
      items: [{ label: t('contacts.address') }],
    },
    {
      title: t('contacts.hoursTitleShort'),
      items: [{ label: t('contacts.hours') }],
    },
  ];

  return (
    <section id="contacts" className="contact-footer">
      <div className="contact-footer-inner container">
        <div className="contact-brand">
          <img src="/assets/logo.png" alt="VISUS" className="contact-logo" />
          <div className="contact-brand-text">
            <h3>{t('contacts.brandTitle')}</h3>
            <p>{t('contacts.subtitle')}</p>
          </div>
        </div>

        <div className="contact-column">
          <div className="contact-column-title">{t('contacts.menuTitle')}</div>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {contactColumns.map((column) => (
          <div className="contact-column" key={column.title}>
            <div className="contact-column-title">{column.title}</div>
            <ul>
              {column.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href}>{item.label}</a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="contact-footer-actions container">
        {actions.map((action) => {
          const icon = action.icon ?? 'whatsapp';
          const iconPath = `/assets/${icon === 'instagram' ? 'insta' : icon}.png`;
          const isExternal = /^https?:\/\//.test(action.href);
          return (
            <a
              className="contact-action"
              key={`${action.href}-${icon}`}
              href={action.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer noopener' : undefined}
              aria-label={action.label}
            >
              <span className="contact-action-icon">
                <img src={iconPath} alt={action.label} />
              </span>
              <span className="contact-action-label">{action.label}</span>
            </a>
          );
        })}
      </div>

      <div className="contact-footer-bottom container">
        <div>{t('footer.copyright')}</div>
        <div className="contact-footer-links">
          <a href="#about">{t('footer.links.about')}</a>
          <a href="#services">{t('footer.links.services')}</a>
        </div>
      </div>
    </section>
  );
}
