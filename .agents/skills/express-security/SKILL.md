---
name: express-security
description: Harden Express APIs using the official Express security practices. Use when reviewing or changing Express security controls, error exposure, input handling, headers, TLS/proxy configuration, authentication, sessions, or dependencies.
---

# Express Security

Apply the official Express security guidance in a way that fits the API's actual features and deployment model.

- Keep Express and direct dependencies supported and check the lockfile for known vulnerabilities before release.
- Validate and constrain all untrusted input before business logic. Validate redirect targets before using `res.redirect()` or `res.location()`.
- Set security headers with Helmet unless a documented deployment layer already provides equivalent headers. Disable `x-powered-by` when Helmet is not used.
- Return controlled JSON responses for API 404s and unexpected errors. Never expose stacks, internal paths, or sensitive input to clients; log error details only through the structured logger.
- Treat TLS, reverse-proxy trust, cookies, sessions, and rate limits as feature- and deployment-specific. Configure them only with explicit knowledge of the proxy, authentication, and state model; do not enable `trust proxy` or session middleware by default.
- Protect authentication endpoints from brute-force attempts when they exist. Do not add authentication-specific controls to APIs that have no authentication endpoints.

Source: https://expressjs.com/en/advanced/best-practice-security/
