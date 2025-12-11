import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CallbackPayload } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  whatsappLink: string;
  phoneLink: string;
  googleScriptUrl?: string;
}

const phoneDigits = (value: string) => value.replace(/[^\d+]/g, '');

export function BookingModal({
  isOpen,
  onClose,
  apiBaseUrl,
  whatsappLink,
  phoneLink,
  googleScriptUrl,
}: BookingModalProps) {
  console.log("googleScriptUrl =", googleScriptUrl);
  const { t } = useTranslation();
  const [form, setForm] = useState<CallbackPayload>({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const dialogClasses = useMemo(
    () => `booking-modal ${isOpen ? 'booking-modal--open' : ''}`,
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('booking-modal-backdrop')) {
      onClose();
    }
  };

  const submit = async () => {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
    };

    if (!payload.name || !payload.phone) {
      setStatus('error');
      return;
    }
    try {
      setSubmitting(true);
      setStatus('idle');
      const backendRequest = fetch(`${apiBaseUrl}/requests/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const googleSync = googleScriptUrl
        ? fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).catch((err) => {
            console.error('Failed to send data to Google Sheets', err);
          })
        : Promise.resolve();

      const response = await backendRequest;
      if (!response.ok) {
        throw new Error('Failed to send');
      }
      await googleSync;
      setStatus('success');
      setForm({ name: '', phone: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={dialogClasses} aria-hidden={!isOpen}>
      <div className="booking-modal-backdrop" onClick={handleBackdropClick} />
      <div className="booking-modal-dialog" role="dialog" aria-modal="true">
        <button
          className="booking-modal-close"
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        <div className="booking-modal-header">
          <h3>{t('booking.title')}</h3>
          <p>{t('booking.subtitle')}</p>
        </div>

        <div className="booking-modal-actions">
          <a href={whatsappLink} target="_blank" className="booking-action" rel="noreferrer">
            <div className="booking-action-icon">🟢</div>
            <div className="booking-action-text">
              <div className="booking-action-title">{t('booking.whatsapp.title')}</div>
              <div className="booking-action-sub">{t('booking.whatsapp.subtitle')}</div>
            </div>
          </a>

          <a href={`tel:${phoneDigits(phoneLink)}`} className="booking-action">
            <div className="booking-action-icon">📞</div>
            <div className="booking-action-text">
              <div className="booking-action-title">{t('booking.call.title')}</div>
              <div className="booking-action-sub">{t('booking.call.subtitle')}</div>
            </div>
          </a>

          <div className="booking-action booking-action-main booking-action-form">
            <div className="booking-action-icon">✨</div>
            <div className="booking-action-text booking-form">
              <div className="booking-action-title">{t('booking.callback.title')}</div>
              <div className="booking-action-sub">{t('booking.callback.subtitle')}</div>

              <div className="booking-form-grid">
                <input
                  type="text"
                  placeholder={t('callbackForm.name')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder={t('callbackForm.phone')}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-primary booking-submit"
                  disabled={submitting}
                  onClick={submit}
                >
                  {submitting ? '...' : t('callbackForm.submit')}
                </button>
              </div>
              {status === 'success' && <div className="booking-status booking-status--success">{t('callbackForm.success')}</div>}
              {status === 'error' && <div className="booking-status booking-status--error">{t('callbackForm.error')}</div>}
            </div>
          </div>
        </div>

        <div className="booking-modal-footer">{t('booking.footer')}</div>
      </div>
    </div>
  );
}
