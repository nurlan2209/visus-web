import { useEffect, useMemo, useState } from 'react';
import type { Doctor, Review, MediaAsset } from '../types';

type EntityType = 'doctors' | 'reviews' | 'mediaDiagnostics' | 'mediaInterior';

interface UploadResponse {
  url: string;
  path: string;
}

const API = import.meta.env.VITE_API_URL ?? (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

function useAuthHeader() {
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(() => {
    const saved = localStorage.getItem('visus-admin-auth');
    return saved ? JSON.parse(saved) : null;
  });

  const header = useMemo(() => {
    if (!credentials) return null;
    const token = btoa(`${credentials.username}:${credentials.password}`);
    return `Basic ${token}`;
  }, [credentials]);

  const login = (username: string, password: string) => {
    const payload = { username, password };
    localStorage.setItem('visus-admin-auth', JSON.stringify(payload));
    setCredentials(payload);
  };

  const logout = () => {
    localStorage.removeItem('visus-admin-auth');
    setCredentials(null);
  };

  return { header, login, logout, hasAuth: Boolean(header) };
}

const createEmptyForm = () => ({
  name: '',
  role: '',
  experienceYears: '',
  descriptionRu: '',
  descriptionKk: '',
  photoUrl: '',
  slug: '',
  titleRu: '',
  titleKk: '',
  shortDescriptionRu: '',
  shortDescriptionKk: '',
  isActive: 'true',
  patientName: '',
  rating: '5',
  textRu: '',
  textKk: '',
  videoUrl: '',
  posterUrl: '',
  mediaTitle: '',
  mediaDescription: '',
  mediaUrl: '',
  targetId: '',
});

export function AdminApp() {
  const { header, login, logout, hasAuth } = useAuthHeader();
  const [message, setMessage] = useState<string>('');
  const [entity, setEntity] = useState<EntityType>('doctors');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mediaDiagnostics, setMediaDiagnostics] = useState<MediaAsset[]>([]);
  const [mediaInterior, setMediaInterior] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<Record<string, string>>(createEmptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const isMediaEntity = (value: EntityType) => value === 'mediaDiagnostics' || value === 'mediaInterior';
  const mediaCategoryMap: Record<'mediaDiagnostics' | 'mediaInterior', string> = {
    mediaDiagnostics: 'diagnostics',
    mediaInterior: 'interior',
  };
  const getEntityPath = (value: EntityType) => {
    switch (value) {
      case 'mediaDiagnostics':
        return 'media/diagnostics';
      case 'mediaInterior':
        return 'media/interior';
      default:
        return value;
    }
  };
  const submit = async () => {
    if (!header) {
      setMessage('Нет авторизации');
      return;
    }
    const path = getEntityPath(entity);
    const body = buildBody(entity, form);
    const isUpdate = isEditing && Boolean(form.targetId);
    try {
      const res = await fetch(`${API}/admin/${path}${isUpdate ? `/${form.targetId}` : ''}`, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: header,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage(isUpdate ? 'Обновлено' : 'Создано');
      if (!isUpdate) {
        setForm(createEmptyForm());
        setIsEditing(false);
      }
      loadList();
    } catch (e) {
      setMessage(`Ошибка: ${String(e)}`);
    }
  };

  const handleDeleteRecord = async () => {
    if (!header) {
      setMessage('Нет авторизации');
      return;
    }
    if (!form.targetId) {
      setMessage('Укажите ID записи для удаления');
      return;
    }
    const path = getEntityPath(entity);
    try {
      const res = await fetch(`${API}/admin/${path}/${form.targetId}`, {
        method: 'DELETE',
        headers: { Authorization: header },
      });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setMessage('Удалено');
      setForm(createEmptyForm());
      setIsEditing(false);
      loadList();
    } catch (e) {
      setMessage(`Ошибка удаления: ${String(e)}`);
    }
  };

  const loadList = async () => {
    if (!header) return;
    const path = getEntityPath(entity);
    try {
      const res = await fetch(`${API}/admin/${path}`, {
        headers: { Authorization: header },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (entity === 'doctors') setDoctors(data as Doctor[]);
      if (entity === 'reviews') setReviews(data as Review[]);
      if (entity === 'mediaDiagnostics') setMediaDiagnostics(data as MediaAsset[]);
      if (entity === 'mediaInterior') setMediaInterior(data as MediaAsset[]);
    } catch (e) {
      setMessage(`Не удалось загрузить список: ${String(e)}`);
    }
  };

  const populateFormFromDoctor = (d: Doctor) => {
    setIsEditing(true);
    setForm((prev) => ({
      ...prev,
      targetId: d.id?.toString() ?? '',
      name: d.name ?? '',
      role: d.role ?? '',
      experienceYears: d.experienceYears?.toString() ?? '',
      descriptionRu: d.descriptionRu ?? '',
      descriptionKk: d.descriptionKk ?? '',
      photoUrl: d.photoUrl ?? '',
    }));
  };

  const populateFormFromReview = (r: Review) => {
    setIsEditing(true);
    setForm((prev) => ({
      ...prev,
      targetId: r.id?.toString() ?? '',
      patientName: r.patientName ?? '',
      rating: r.rating?.toString() ?? '5',
      textRu: r.textRu ?? '',
      textKk: r.textKk ?? '',
      videoUrl: r.videoUrl ?? '',
      posterUrl: r.posterUrl ?? '',
    }));
  };

  const populateFormFromMedia = (asset: MediaAsset) => {
    setIsEditing(true);
    setForm((prev) => ({
      ...prev,
      targetId: asset.id?.toString() ?? '',
      mediaTitle: asset.title ?? '',
      mediaDescription: asset.description ?? '',
      mediaUrl: asset.photoUrl ?? '',
    }));
  };

  useEffect(() => {
    setForm(createEmptyForm());
    setUploadUrl('');
    setIsEditing(false);
    if (header) {
      loadList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, header]);

  const handleDeleteMedia = async () => {
    if (!header) return;
    const mediaUrl = getCurrentMediaPath(entity, form);
    const objectName = mediaUrl ? getObjectName(mediaUrl) : '';
    if (!objectName) {
      setMessage('Нет файла для удаления');
      return;
    }
    try {
      const res = await fetch(`${API}/admin/upload?objectName=${encodeURIComponent(objectName)}`, {
        method: 'DELETE',
        headers: { Authorization: header },
      });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setMessage('Файл удалён');
      updateFormWithUploadedUrl(entity, '', setForm);
      setUploadUrl('');
    } catch (e) {
      setMessage(`Ошибка удаления: ${String(e)}`);
    }
  };

  const handleUpload = async (file?: File) => {
    if (!header || !file) {
      setMessage('Выберите файл и залогиньтесь');
      return;
    }
    const data = new FormData();
    data.append('file', file);
    const folder = isMediaEntity(entity) ? mediaCategoryMap[entity as 'mediaDiagnostics' | 'mediaInterior'] : entity;
    data.append('folder', folder);
    const existingUrl = getCurrentMediaPath(entity, form);
    const objectName = existingUrl ? getObjectName(existingUrl) : '';
    if (objectName) {
      data.append('objectName', objectName);
    }
    try {
      const res = await fetch(`${API}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: header },
        body: data,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as UploadResponse;
      setUploadUrl(json.url);
      updateFormWithUploadedUrl(entity, json.path, setForm);
      setMessage('Файл загружен');
    } catch (e) {
      setMessage(`Ошибка: ${String(e)}`);
    }
  };

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <div style={{ fontWeight: 700, letterSpacing: '0.08em' }}>VISUS ADMIN</div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Медиа и контент врачей/услуг/отзывов</div>
        </div>
        {hasAuth && <button onClick={logout} style={btnStyleSecondary}>Выйти</button>}
      </header>

      {!hasAuth && <LoginForm onSubmit={(u, p) => login(u, p)} />}

      {hasAuth && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Chip checked={entity === 'doctors'} onClick={() => setEntity('doctors')} label="Врачи" />
                <Chip checked={entity === 'reviews'} onClick={() => setEntity('reviews')} label="Отзывы" />
                <Chip checked={entity === 'mediaDiagnostics'} onClick={() => setEntity('mediaDiagnostics')} label="Диагностика (фото)" />
                <Chip checked={entity === 'mediaInterior'} onClick={() => setEntity('mediaInterior')} label="Интерьер" />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={loadList} style={btnStyleSecondary}>Обновить списки</button>
                {getCurrentMediaPath(entity, form) && (
                  <button onClick={() => handleDeleteMedia()} style={btnStyleDanger}>Удалить файл</button>
                )}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr', maxWidth: 860 }}>
              <Field label="ID (для обновления)">
                <input value={form.targetId} onChange={(e) => setForm({ ...form, targetId: e.target.value })} style={inputStyle} />
              </Field>

              {entity === 'doctors' && (
                <>
                  <Field label="ФИО врача">
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Роль">
                    <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Стаж (лет)">
                    <input value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Описание RU">
                    <textarea value={form.descriptionRu} onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })} style={textareaStyle} />
                  </Field>
                  <Field label="Описание KK">
                    <textarea value={form.descriptionKk} onChange={(e) => setForm({ ...form, descriptionKk: e.target.value })} style={textareaStyle} />
                  </Field>
                  <Field label="Фото врача (загрузите файл или вставьте путь)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                      <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} style={inputStyle} placeholder="например, doctors/filename.jpg" />
                      <MediaPreview src={toPreviewUrl(form.photoUrl) || uploadUrl} />
                    </div>
                  </Field>
                </>
              )}

              {entity === 'reviews' && (
                <>
                  <Field label="Имя пациента">
                    <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Рейтинг (1-5)">
                    <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Текст RU">
                    <textarea value={form.textRu} onChange={(e) => setForm({ ...form, textRu: e.target.value })} style={textareaStyle} />
                  </Field>
                  <Field label="Текст KK">
                    <textarea value={form.textKk} onChange={(e) => setForm({ ...form, textKk: e.target.value })} style={textareaStyle} />
                  </Field>
                  <Field label="Видео / embed">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <textarea
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        style={{ ...textareaStyle, minHeight: 80 }}
                        placeholder="MP4 ссылка или embed-код Instagram/YouTube"
                      />
                      <small style={{ color: '#94a3b8' }}>
                        Поддерживаются прямые mp4-ссылки и встроенные блоки (iframe, blockquote) от Instagram/YouTube.
                      </small>
                    </div>
                  </Field>
                  <Field label="Постер (загрузите файл или вставьте путь)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                      <input value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} style={inputStyle} placeholder="например, reviews/cover.jpg" />
                      <MediaPreview src={toPreviewUrl(form.posterUrl) || uploadUrl} />
                    </div>
                  </Field>
                </>
              )}

              {isMediaEntity(entity) && (
                <>
                  <Field label="Заголовок">
                    <input value={form.mediaTitle} onChange={(e) => setForm({ ...form, mediaTitle: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Описание">
                    <textarea value={form.mediaDescription} onChange={(e) => setForm({ ...form, mediaDescription: e.target.value })} style={textareaStyle} />
                  </Field>
                  <Field label="Фото">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                      <input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} style={inputStyle} placeholder="например, diagnostics/photo.jpg" />
                      <MediaPreview src={toPreviewUrl(form.mediaUrl) || uploadUrl} />
                    </div>
                  </Field>
                </>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={submit} style={btnStylePrimary}>{isEditing ? 'Обновить' : 'Создать'}</button>
                <button onClick={handleDeleteRecord} style={btnStyleDanger}>Удалить</button>
                {message && <div style={{ fontSize: 12, color: '#cbd5e1' }}>{message}</div>}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Текущие записи</div>
            {entity === 'doctors' && (
              <List
                items={doctors.map((d) => ({
                  id: d.id,
                  title: d.name,
                  subtitle: `${d.role} · ${d.experienceYears ?? ''}`.trim(),
                  description: d.descriptionRu || d.descriptionKk,
                  image: toPreviewUrl(d.photoUrl),
                  raw: d,
                }))}
                onSelect={(item) => populateFormFromDoctor(item.raw as Doctor)}
              />
            )}
            {entity === 'reviews' && (
              <List
                items={reviews.map((r) => ({
                  id: r.id,
                  title: r.patientName,
                  subtitle: `★ ${r.rating ?? 5}`,
                  description: r.textRu,
                  image: toPreviewUrl(r.posterUrl),
                  raw: r,
                }))}
                onSelect={(item) => populateFormFromReview(item.raw as Review)}
              />
            )}
            {entity === 'mediaDiagnostics' && (
              <List
                items={mediaDiagnostics.map((m) => ({
                  id: m.id,
                  title: m.title || 'Без названия',
                  subtitle: 'diagnostics',
                  description: m.description,
                  image: toPreviewUrl(m.photoUrl),
                  raw: m,
                }))}
                onSelect={(item) => populateFormFromMedia(item.raw as MediaAsset)}
              />
            )}
            {entity === 'mediaInterior' && (
              <List
                items={mediaInterior.map((m) => ({
                  id: m.id,
                  title: m.title || 'Без названия',
                  subtitle: 'interior',
                  description: m.description,
                  image: toPreviewUrl(m.photoUrl),
                  raw: m,
                }))}
                onSelect={(item) => populateFormFromMedia(item.raw as MediaAsset)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginForm({ onSubmit }: { onSubmit: (u: string, p: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Вход</div>
      <input placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
      <input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      <button onClick={() => onSubmit(username, password)} style={btnStylePrimary}>Войти</button>
    </div>
  );
}

function buildBody(entity: EntityType, form: Record<string, string>) {
  if (entity === 'doctors') {
    return {
      name: form.name,
      role: form.role,
      experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
      descriptionRu: form.descriptionRu,
      descriptionKk: form.descriptionKk,
      photoUrl: form.photoUrl || form.posterUrl || '',
    };
  }
  if (entity === 'mediaDiagnostics' || entity === 'mediaInterior') {
    return {
      category: entity === 'mediaDiagnostics' ? 'diagnostics' : 'interior',
      title: form.mediaTitle,
      description: form.mediaDescription,
      photoUrl: form.mediaUrl || '',
    };
  }
  return {
    patientName: form.patientName,
    rating: form.rating ? Number(form.rating) : 5,
    textRu: form.textRu,
    textKk: form.textKk,
    videoUrl: form.videoUrl,
    posterUrl: form.posterUrl || form.photoUrl || '',
  };
}

const cardStyle: React.CSSProperties = {
  background: '#0b1224',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  boxShadow: '0 12px 28px rgba(15,23,42,0.5)',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(148, 163, 184, 0.4)',
  background: '#0f172a',
  color: '#e5e7eb',
  fontSize: 13,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 70,
};

const btnStylePrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0f8a3c, #0e7a35)',
  border: 'none',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const btnStyleSecondary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(148,163,184,0.4)',
  color: '#e5e7eb',
  padding: '8px 12px',
  borderRadius: 12,
  cursor: 'pointer',
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #0b1224 0, #0f172a 40%, #0b1224 100%)',
  color: '#e5e7eb',
  fontFamily: 'Inter, sans-serif',
  padding: '24px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 16,
  flexWrap: 'wrap',
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(148,163,184,0.3)',
  cursor: 'pointer',
};

const btnStyleDanger: React.CSSProperties = {
  background: 'rgba(220,38,38,0.16)',
  border: '1px solid rgba(248,113,113,0.5)',
  color: '#fecaca',
  padding: '8px 12px',
  borderRadius: 12,
  cursor: 'pointer',
};

function Chip({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...pillStyle,
        border: checked ? '1px solid rgba(74,222,128,0.7)' : pillStyle.border,
        background: checked ? 'rgba(34,197,94,0.14)' : pillStyle.background,
        color: checked ? '#bbf7d0' : '#e5e7eb',
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
      <span style={{ color: '#cbd5e1' }}>{label}</span>
      {children}
    </label>
  );
}

function MediaPreview({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <div style={{ width: '100%', maxWidth: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.3)' }}>
      <img src={src} alt="preview" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 220 }} />
    </div>
  );
}

function getObjectName(url: string) {
  if (!url) return '';
  try {
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const parts = withoutProtocol.split('/');
    const bucketIndex = parts.length > 1 ? 1 : -1;
    if (bucketIndex >= 0) {
      return parts.slice(bucketIndex + 1).join('/');
    }
    return url;
  } catch {
    return url;
  }
}

function getCurrentMediaPath(entity: EntityType, form: Record<string, string>) {
  if (entity === 'doctors') return form.photoUrl;
  if (entity === 'reviews') return form.posterUrl || form.photoUrl;
  if (entity === 'mediaDiagnostics' || entity === 'mediaInterior') return form.mediaUrl;
  return '';
}

const updateFormWithUploadedUrl = (entity: EntityType, url: string, setFormFn: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
  if (entity === 'doctors') {
    setFormFn((prev) => ({ ...prev, photoUrl: url }));
  } else if (entity === 'reviews') {
    setFormFn((prev) => ({ ...prev, posterUrl: url }));
  } else if (entity === 'mediaDiagnostics' || entity === 'mediaInterior') {
    setFormFn((prev) => ({ ...prev, mediaUrl: url }));
  }
};

function toPreviewUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalized = path.replace(/^\/?media\//, '').replace(/^\/+/, '');
  const base =
    import.meta.env.VITE_MEDIA_URL?.replace(/\/media\/?$/, '')?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '').replace(/:5173$/, ':8080') : '');
  return `${base}/media/${normalized}`;
}

function List({ items, onSelect }: { items: Array<{ id?: number; title?: string; subtitle?: string; description?: string; image?: string; raw?: unknown }>; onSelect?: (item: { id?: number; title?: string; subtitle?: string; description?: string; image?: string; raw?: unknown }) => void }) {
  if (!items.length) return <div style={{ fontSize: 12, color: '#94a3b8' }}>Нет записей</div>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((item) => (
        <div
          key={`${item.id}-${item.title}`}
          style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 10, alignItems: 'center', padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.2)', cursor: onSelect ? 'pointer' : 'default' }}
          onClick={() => onSelect?.(item)}
        >
          <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: '#111827' }}>
            {item.image ? <img src={item.image} alt={item.title ?? 'img'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{item.title || 'Без названия'}</div>
            {item.subtitle && <div style={{ fontSize: 12, color: '#cbd5e1' }}>{item.subtitle}</div>}
            {item.description && <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
