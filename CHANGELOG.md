# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Full form builder with drag-and-drop field editor (14 field types)
- Dashboard with stats, form list, and explore suggestions
- Theme gallery with live previews and apply-to-form flow
- Public form fill page at `/f/[slug]`
- Public explore page for discovering shared forms
- Analytics dashboard with per-form deep dives
- Account settings with notification preferences
- Password protection for forms
- Clerk authentication (SSO, webhooks)
- Email notifications via Resend
- Auto-open create dialog via `?new=1` or `?create=true` URL params

### Fixed
- Duplicate enum values in database `field_type` enum
- Missing `NEXT_PUBLIC_API_URL` in `.env.example`
