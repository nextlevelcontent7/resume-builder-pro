# resume-builder-pro
Full resume builder app with PDF export and modern UI.

## Backend

This repository includes a Node.js/Express backend prepared for expansion. It
features MongoDB connectivity with retry logic, internationalization (English
and Arabic) and request logging.

Run the server with:

```bash
npm install   # install dependencies
npm run dev   # start in development mode with nodemon
```

Environment variables are documented in `.env.example`.
The file now includes `SYNC_ENDPOINT` for optional remote backup.

The API exposes basic resume CRUD endpoints under `/api/resumes` for creating,
updating and deleting user resumes. Uploaded images and PDF files are stored in
the `uploads/` directory. Each resume can be exported to PDF via
`GET /api/resumes/:id/export`, which generates a file under the `exports/`
folder and returns a download link.

Additional endpoints include:
- `POST /api/resumes/import` for bulk JSON import.
- `GET /api/resumes/export/bulk` to download all resumes as a single ZIP.
- `GET /api/resumes/:id/metadata` to fetch stored file metadata.
- `GET /api/health` simple health check for load balancers.

## Frontend

The `frontend/` directory contains a Vite + React application with Tailwind CSS and i18n support. Run it with:

```bash
cd frontend
npm install  # install frontend dependencies
npm run dev  # start development server on http://localhost:3000
```

The app provides a resume form with preview/export features and supports both English and Arabic languages with RTL layout.

### Admin Panel

The application ships with an admin dashboard accessible under `/admin`. Authenticate using the `admin-token` value in the `Authorization` header. From the dashboard you can manage users, review resumes and toggle feature flags such as watermarking or export formats.

## Docker

To run the API and MongoDB using Docker:

```bash
docker-compose up --build
```

This will start MongoDB and the API container on port `5000`.

## API Docs

A Swagger specification is available under `docs/swagger.yaml` which can be
served using tools like `swagger-ui`. The API base path is `/api`.

The environment example also documents `REFRESH_SECRET`, `EMAIL_USER`, and `EMAIL_PASS` for login sessions and email verification support.
Additional rate-limiting controls can be tuned with `RATE_EXCLUDE_PATHS` and `RATE_WHITELIST_IPS` while `LOG_REMOTE_URL` allows forwarding logs to an external endpoint. `CSP` configures the Content-Security-Policy header. Admin access can be overridden via `ADMIN_OVERRIDE_HEADER` and `ADMIN_OVERRIDE_TOKEN` for trusted proxies.
\nThe API now provides authentication endpoints under `/api/auth` for user registration, login, token refresh, and password resets. Admin endpoints expose analytics via `/api/admin/analytics`. Resumes support version history and remote restore via `/api/resumes/restore/:remoteId`.
