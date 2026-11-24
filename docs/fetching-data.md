# Fetching data from this repo

This repo is a **test data source** for the CaseVu project. Its issues, pull requests, reviews,
CI runs and release bundles are what CaseVu reads. All of it can be read through the GitHub REST API
(`https://api.github.com/repos/Tanveeraly/working-with-CI/...`).

Send these headers with every request:

```
Authorization: Bearer <token>
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
```

## What CaseVu needs → where to get it

| CaseVu field | Endpoint | Notes |
|---|---|---|
| Releases / versions | `GET /releases`, `GET /releases/tags/{tag}` | Created by CI on every `v*` tag |
| Bundle file + SHA-256 | Release asset `manifest.json` → `bundle.sha256` | Download with `GET /releases/assets/{id}` + `Accept: application/octet-stream` |
| Build ID | `manifest.json` → `buildId` (`<run_id>-<attempt>`) | Same value as in `testSummary.buildId` |
| Linked issues | `manifest.json` → `linkedIssues`, then `GET /issues/{n}` | Parsed from `Closes #n` in PR bodies |
| Risk class / documentation impact | Issue `labels` (`risk:low`/`risk:high`, `docs:impact`/`docs:none`) or the `### Risk class` section in the body | |
| Pull requests | `manifest.json` → `pullRequests`, or `GET /pulls?state=closed` | |
| Second-engineer review | `manifest.json` → `pullRequests[].secondEngineerReviewed`, or `GET /pulls/{n}/reviews` | Approval from someone other than the author |
| CI test summary | `manifest.json` → `testSummary` | Also a `test-summary` artifact on each run |
| CI runs | `GET /actions/runs`, `GET /actions/runs/{id}/artifacts` | Artifacts: `app-dist`, `test-summary`, `release-bundle` |
| User manual | Inside the bundle `.tar.gz` at `manual/user-manual.md` | Version in `manifest.json` → `manual.version` |
| Configuration changes | `GET /issues?labels=config-change&state=all` | |
| Emergency cases | `GET /issues?labels=emergency&state=all` | |

## Push instead of poll (optional)

Set repo secrets `CASEVU_WEBHOOK_URL` and `CI_WEBHOOK_SECRET`. CI will POST `manifest.json` to that URL
with header `X-CaseVu-Signature: sha256=<HMAC-SHA256 of body using the secret>`.

## manifest.json example

```json
{
  "schema": "casevu.release-bundle/v1",
  "product": "Sample Lab App",
  "version": "0.2.0",
  "buildId": "12345678901-1",
  "commitSha": "3886413...",
  "ref": "refs/tags/v0.2.0",
  "repository": "Tanveeraly/working-with-CI",
  "createdAt": "2026-11-24T17:27:11.499Z",
  "bundle": { "file": "sample-lab-app-0.2.0-12345678901-1.tar.gz", "sha256": "da5e95b9..." },
  "linkedIssues": [1, 3],
  "pullRequests": [
    { "number": 6, "title": "Add HbA1c conversion", "author": "dev-a", "approvers": ["dev-b"], "secondEngineerReviewed": true }
  ],
  "testSummary": { "buildId": "12345678901-1", "passed": true, "total": 9, "passedTests": 9, "failedTests": 0 },
  "manual": { "path": "manual/user-manual.md", "version": "0.2.0" }
}
```
