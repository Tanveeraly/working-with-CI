# CaseVu — Release & Change Control

CaseVu tracks how a release or configuration change moves through **intake → risk assessment → review →
deployment → version history → staff acknowledgement → audit export**.

This repository is set up so that its own CI produces the **release bundle** CaseVu consumes
(build ID, version, SHA-256, linked issues, PRs, test summary and user manual).

## Repository layout

```
.github/
  ISSUE_TEMPLATE/        Change / config-change / bug templates (risk class + documentation impact)
  workflows/ci.yml       Lint, typecheck, test, build release bundle, notify CaseVu webhook
  workflows/pr-checks.yml  PR must link an issue and declare risk
  pull_request_template.md
  CODEOWNERS             Enforces second-engineer review
backend/                 Node.js + TypeScript API (Express, Vitest)
  src/domain/            Core rules: risk, readiness, deployment gate, emergency authorization
  test/                  Essential test scenarios from the guide (section 13)
docs/
  workflow.md            Roles, workflows and rules (summary of the developer guide)
  development.md         Branching, PR and release process
  roadmap.md             8-phase implementation plan
  manual/user-manual.md  Versioned user manual shipped in every release bundle
scripts/
  build-release-bundle.mjs  Assembles the CI bundle + manifest with SHA-256
docker-compose.yml       Postgres + API for local development
```

## Quick start

```bash
cd backend
npm install
npm test          # run domain tests
npm run dev       # start API on http://localhost:3000 (GET /health)
```

Or with Docker:

```bash
cp .env.example .env
docker compose up --build
```

## CI release bundle

On every push to `main` (and on `v*` tags) the CI workflow:

1. Lints, typechecks and tests the backend (JUnit/JSON test summary).
2. Collects the PRs associated with the commit and the issues they close.
3. Builds `release-bundle/` containing the build, the test summary and the versioned manual,
   archives it and records its **SHA-256** in `manifest.json`.
4. Uploads the bundle as a workflow artifact.
5. If the `CASEVU_WEBHOOK_URL` and `CI_WEBHOOK_SECRET` secrets are set, POSTs the manifest to
   `POST /releases/webhook` with an `X-CaseVu-Signature` HMAC header.

See [docs/development.md](docs/development.md) for the branch protection settings to enable on GitHub.

## Key engineering safeguards

- **Append-only history** — submitted releases, approvals and audit records are never edited; corrections are new records.
- **Server-side authorization and readiness** — never trust readiness values from the browser.
- **Build-specific approvals** — bound to release ID + build ID + bundle hash.
- **Transactional deployment gate** — readiness re-checked immediately before deploy.
- **Export completeness** — audit gaps are listed, never hidden.
