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

The API exposes basic resume CRUD endpoints under `/api/resumes` for creating,
updating and deleting user resumes. Uploaded images and PDF files are stored in
the `uploads/` directory. Each resume can be exported to PDF via
`GET /api/resumes/:id/export`, which generates a file under the `exports/`
folder and returns a download link.

## Frontend

The `frontend/` directory contains a Vite + React application with Tailwind CSS and i18n support. Run it with:

```bash
cd frontend
npm install  # install frontend dependencies
npm run dev  # start development server on http://localhost:3000
```

The app provides a resume form with preview/export features and supports both English and Arabic languages with RTL layout.
