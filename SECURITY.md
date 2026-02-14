# Security Policy

## Supported Versions

Security fixes are applied to the latest active code in this repository.

## Reporting a Vulnerability

Report vulnerabilities privately before public disclosure.

Include:
- Affected endpoint/page
- Reproduction steps
- Expected vs actual behavior
- Potential impact

## Security Controls in This Project

- JWT authentication on protected APIs
- Role-based access controls (`user`, `admin`, `superadmin`)
- Rate limiting on auth flows
- Input validation in auth and critical paths
- CORS controls and proxy-safe configuration
- Webhook signature verification for payment callbacks
- Restricted support attachment handling + signature checks

## Deployment Recommendations

- Set strong `JWT_SECRET` and rotate periodically
- Restrict `CORS_ALLOWED_ORIGINS` to trusted domains
- Disable `ALLOW_START_WITHOUT_DB` in production
- Use HTTPS for frontend/backend
- Keep dependencies updated and run regular audits
- Use least-privilege DB credentials
