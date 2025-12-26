# Horizon Frontend

Horizon is an internal tool for visualizing team availability, vacations, and events. This repository contains the web client.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- TanStack Query

## Repository

- Backend: https://github.com/pedro-tessira/horizon-backend

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```sh
npm install
```

### Environment

Create a `.env` file in the repo root (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080
```

### Run the frontend

```sh
npm run dev
```

Frontend runs at:
- http://localhost:5173

## Login

Use the dev login email: `admin@local`.

## CORS

If requests fail with CORS errors, ensure the backend allows `http://localhost:5173` in development.
