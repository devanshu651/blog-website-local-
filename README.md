# Inkwell Blog

A server-rendered blog application using EJS, Express, and MongoDB. It includes a versioned JSON API, account registration and login, admin/user roles, secure post management, SEO-friendly slugs, validation, and CSRF protection.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or newer, local or hosted

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `SESSION_SECRET`.
2. Install dependencies with `npm install`.
3. Start MongoDB, then run `npm run dev`.
4. Open `http://localhost:3000`.
5. Create an administrator with `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` set in the environment, then run `npm run create-admin`.

The registration form creates ordinary user accounts only. Promote users through a trusted administrative process; never accept a role from public input.

## API

All endpoints are under `/api/v1`. JSON errors have the shape `{ "error": { "message", "details?" } }`.

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/posts?page=1&limit=10&q=term` | Public, paginated |
| GET | `/posts/:slug` | Public |
| POST | `/posts` | Admin; authenticated session and CSRF token |
| PATCH | `/posts/:id` | Admin; authenticated session and CSRF token |
| DELETE | `/posts/:id` | Admin; authenticated session and CSRF token |
| GET | `/auth/csrf` | Public; returns token for API clients |
| POST | `/auth/register`, `/auth/login` | Public; rate limited and CSRF protected |
| POST | `/auth/logout` | Authenticated; CSRF protected |
| GET | `/auth/me` | Authenticated |

Browser forms receive CSRF tokens from the shared layout. API clients should first call `/api/v1/auth/csrf`, retain the session cookie, and send the returned token as `X-CSRF-Token` for state-changing requests.

## Deployment notes

Set `NODE_ENV=production`, a strong `SESSION_SECRET`, `MONGODB_URI`, and `APP_URL`. TLS should terminate at a trusted reverse proxy; configure `TRUST_PROXY` to the appropriate proxy hop count when deploying behind one. The app uses secure, HTTP-only, same-site session cookies in production, Mongo-backed sessions, Helmet headers, request rate limits, strict schemas, and escaped EJS output. Configure MongoDB backups and monitoring in your hosting environment.
