# Horizon

Horizon is an internal tool for visualizing team availability, vacations, and events.

## Setup

```sh
npm install
npm run dev
```

## Backend

- Backend must be running at `http://localhost:8080` (dev profile).
- Frontend expects `VITE_API_BASE_URL=http://localhost:8080` (see `.env.example`).

## Login

Use the dev login email: `admin@local`.

## CORS

If requests fail with CORS errors, ensure the backend allows `http://localhost:5173` in development.
