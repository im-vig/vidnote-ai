# Security

This project is a static, client-side web app. API settings are stored in the
current browser's `localStorage` so the app can be used locally without a
backend.

## API keys

- Do not commit real API keys to this repository.
- Do not publish a shared deployment that asks users to enter keys unless you
  understand the risks of browser-side storage.
- For public or team usage, add a backend gateway that keeps provider keys on
  the server and exposes only scoped app endpoints.

## Browser API calls

The app calls configured AI providers directly from the browser. Providers must
allow CORS for requests to succeed. A backend gateway is recommended for large
video uploads, authentication, rate limits, and audit logs.

## Reporting issues

If you find a security issue, please open a private report if the repository has
GitHub Security Advisories enabled. Otherwise, contact the maintainer before
publishing details.
