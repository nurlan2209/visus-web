import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Review } from '../types';

interface ReviewsProps {
  apiBaseUrl: string;
}

const FALLBACK_REVIEWS: Review[] = [
  { id: 1, patientName: 'Видеоотзыв №1', rating: 5, videoUrl: '', textRu: '', textKk: '' },
  { id: 2, patientName: 'Видеоотзыв №2', rating: 5, videoUrl: '', textRu: '', textKk: '' },
  { id: 3, patientName: 'Видеоотзыв №3', rating: 5, videoUrl: '', textRu: '', textKk: '' },
];

export function Reviews({ apiBaseUrl }: ReviewsProps) {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const computeMediaBase = () => {
    if (import.meta.env.VITE_MEDIA_URL) {
      return import.meta.env.VITE_MEDIA_URL.replace(/\/$/, '');
    }
    if (import.meta.env.VITE_API_URL) {
      return `${new URL(import.meta.env.VITE_API_URL).origin.replace(/\/$/, '')}/media`;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin.replace(/\/$/, '')}/media`;
    }
    return '/media';
  };
  const mediaBase = computeMediaBase();

  useEffect(() => {
    const load = async () => {
      try {
        console.debug('[Reviews] fetching from', `${apiBaseUrl}/reviews`);
        const response = await fetch(`${apiBaseUrl}/reviews`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = (await response.json()) as Review[];
        if (Array.isArray(data) && data.length) {
          console.debug('[Reviews] loaded', data.length, 'items');
          setReviews(data);
        }
      } catch (err) {
        console.warn('Using fallback reviews', err);
        setReviews(FALLBACK_REVIEWS);
      }
    };
    load();
  }, [apiBaseUrl]);

  const currentText = (review: Review) =>
    i18n.language === 'kk' ? review.textKk || review.textRu : review.textRu || review.textKk;

  const resolveMedia = (url?: string) => {
    if (!url) return '/assets/placeholder.png';
    if (url.startsWith('http')) return url;
    const normalized = url.replace(/^\/?media\//, '').replace(/^\/+/, '');
    const finalUrl = `${mediaBase}/${normalized.replace(/^media\//, '')}`;
    console.debug('[Reviews] resolve media', url, '->', finalUrl);
    return finalUrl;
  };

  return (
    <section id="reviews" className="section--soft">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">{t('reviews.kicker')}</div>
            <h2 className="section-title">{t('reviews.title')}</h2>
          </div>
          <p className="section-subtitle">{t('reviews.subtitle')}</p>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, idx) => (
            <article className="review-card" key={review.id ?? idx}>
              <video className="review-video" controls poster={resolveMedia(review.posterUrl)}>
                {review.videoUrl && <source src={review.videoUrl} type="video/mp4" />}
              </video>
              <div className="review-top">
                <div>
                  <div className="review-name">{review.patientName || `${t('reviews.fallbackName')} №${idx + 1}`}</div>
                  <div className="review-tag">{t('reviews.fallbackTag')}</div>
                </div>
                <div className="review-stars">{'★★★★★'.slice(0, review.rating || 5)}</div>
              </div>
              {currentText(review) && <p className="service-text">{currentText(review)}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
