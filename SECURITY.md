# Security Policy

Maintainer: `OLUWAYEMI OYINLOLA MICHAEL`  
Portfolio: `https://oyinlola.site`

## Supported Versions

Security fixes are applied to the latest active code in this repository.

## Report a Vulnerability

Please report vulnerabilities privately before public disclosure.

Include:
- Affected endpoint/page
- Reproduction steps
- Expected vs actual behavior
- Security impact
- Suggested fix (optional)

## Security Controls Implemented

- JWT authentication and role-based authorization
- Input validation (Joi) across auth and critical flows
- Global and endpoint-specific rate limiting (including OTP endpoints)
- Hashed OTP storage using HMAC (`OTP_HASH_SECRET`)
- Password hashing with bcrypt
- Helmet protections, including production HSTS
- CORS allowlist enforcement
- Signed/private support attachment access controls

## Production Hardening Checklist

- Set strong secrets:
  - `JWT_SECRET`
  - `OTP_HASH_SECRET`
  - `ATTACHMENT_URL_SECRET`
- Restrict `CORS_ALLOWED_ORIGINS` and `SOCKET_CORS_ORIGIN` to trusted domains only
- Set `ALLOW_START_WITHOUT_DB=false`
- Use TLS/HTTPS everywhere (frontend + backend + DB)
- Run dependencies with regular audits (`npm audit`)
- Use least-privilege DB account credentials
- Monitor auth and OTP abuse attempts
- Rotate secrets periodically
