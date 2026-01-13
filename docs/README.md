# Horizon Frontend Docs

For backend services and API details, see:
- https://github.com/pedro-tessira/horizon-backend

## UI Notes

- Share links: `/share/:token` and `/shares/:token`.
- Timeline row height is 45px.
- Event titles are optional; when missing, the UI falls back to the event type name.
- Header: team selection lives in the header; theme (system/light/dark) is in the user dropdown and is local-only.
- Profile: the security section allows password updates when the user is not linked to an employee or last login was not SSO.

## Backlog

- Consider code-splitting to reduce Vite bundle size warnings.
