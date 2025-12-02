# VISUS — полный стэк (React + FastAPI + PostgreSQL + локальное хранилище)

Лендинг VISUS разнесён на полноценный фронтенд и бэкенд c контейнерами. Базовый дизайн и тексты взяты из исходных `index.html`/`styles.css`, мультиязычность — ru/kk.

## Структура
- `frontend/` — React (Vite + TypeScript), i18n, модалка записи, API к бэкенду.
- `backend/` — FastAPI + SQLAlchemy + PostgreSQL, локальное хранилище медиа + Basic Auth для админки.
- `docker-compose.yml` — фронт + бэк + PostgreSQL (медиа в папке `storage/`, проброшенной в контейнер).
- `index.html`, `styles.css` — исходный макет (не трогаем).

## Переменные окружения
Скопируйте `.env.example` → `.env` и при необходимости поправьте:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — база.
- `VITE_API_URL` — API для фронтенда (по умолчанию `http://backend:8080/api` внутри compose).
- `VITE_MEDIA_URL` — базовый URL для медиа (по умолчанию `http://backend:8080/media`).
- `ALLOWED_ORIGINS` — CORS для бэкенда.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — логин/пароль для `/api/admin/*` (использует Basic Auth).
- `STORAGE_MODE=local`, `LOCAL_STORAGE_PATH=/app/storage`, `LOCAL_PUBLIC_URL=http://localhost:8080/media` — локальное хранилище медиа (каталог `storage/` в корне проекта монтируется внутрь контейнера).

## Запуск через Docker
1. `docker-compose up --build`
2. Доступные URL:
   - Фронтенд: http://localhost:5173 (также доступен по http://localhost/)
   - Бэкенд API: http://localhost:8080/api
   - OpenAPI UI: http://localhost:8080/docs
   - Медиа-файлы: http://localhost:8080/media/*
   - Adminer (БД): http://localhost:5173/adminer (и аналогично http://localhost/adminer) либо напрямую http://localhost:8081 (сервер `db`, логин/пароль из `.env`)

## Локальная разработка (по желанию)
- Frontend: `cd frontend && npm install && npm run dev` (нужен Node 18+). API адрес задаётся через `VITE_API_URL`. В дев-сервере Adminer также доступен на http://localhost:5173/adminer.
- Backend: `cd backend && uvicorn app.main:app --reload` (нужен Python 3.12+, переменные окружения как в `.env`). Adminer в dev доступен на http://localhost:5173/adminer (или http://localhost:8081).

## Что внутри
- Фронтенд: компоненты `Header`, `Hero`, `About`, `Services`, `Diagnostics`, `Doctors`, `Gallery`, `Reviews`, `Contacts`, `Footer` + модалка записи. Все русские строки вынесены в `frontend/src/i18n/{ru,kk}/common.json`. Кнопки «Записаться» и CTA открывают модалку с WhatsApp/телефон/формой POST `/api/requests/callback`.
- Блок «Отзывы» грузится с бэкенда `GET /api/reviews`, есть запасные данные на случай ошибки.
- Бэкенд: FastAPI + SQLAlchemy, сущности `Doctor`, `ServiceItem`, `Review`, `CallbackRequest`, базовые сиды и CRUD/загрузка в `/api/admin/*` (Basic Auth). Медиа по умолчанию хранятся локально (папка `storage/` → `/app/storage`, отдаются по `/media/*`). Можно вернуть S3-совместимое хранилище через `STORAGE_MODE`.
- Документация API: http://localhost:8080/docs, JSON-схема http://localhost:8080/openapi.json.

## Быстрые команды
- Собрать фронтенд локально: `cd frontend && npm run build`
- Проверить бэкенд линтер/тесты: `cd backend && uvicorn app.main:app --reload`

После изменения `.env` перезапустите контейнеры `docker-compose up --build`.
