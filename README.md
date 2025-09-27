# Mavarra Platform

Full-stack React + Express application with MongoDB persistence for enquiries, blog management, and TOTP-protected admin workflows.

## Local Development

```bash
npm install
npm run dev
```

The `dev` script launches both the API (`server.mjs`) and the React dev server with hot reload via `concurrently`.

## GitHub Actions CI/CD

`.github/workflows/ci-cd.yml` installs dependencies, runs the unit tests in CI mode, and executes `npm run build` on every push or pull request targeting `main`. Use it as a guard rail before merging changes.

## Useful Scripts

- `npm run dev` – start web + API for development.
- `npm run build` – compile production assets (also run during Docker build).
- `npm run server` – launch API only, useful when running the compiled SPA via another web server.

## Docker

Build and run the API and SPA independently or together via Compose:

- Backend image: `docker build -f Dockerfile.api -t mavarra-api .`
- Frontend image: `docker build -f Dockerfile.web -t mavarra-web .`

Compose will wire them up (set `MONGODB_URI` when you run it):

```bash
MONGODB_URI="mongodb+srv://..." MONGODB_DB="mavarra" docker compose up --build
```

This exposes the API on `http://localhost:3001` and the SPA on `http://localhost:8080`, with Nginx reverse-proxying `/api/*` calls to the API container.

## Testing

Unit tests use `react-scripts test`. CI sets `CI=true` so the command exits after one pass:

```bash
env CI=true npm test -- --watch=false
```

## License

Apache-2.0 (update if different).
