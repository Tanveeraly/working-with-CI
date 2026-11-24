# CaseVu working flow

Summary of the *CaseVu Working Flow & Developer Implementation Guide*.

## Roles

| Role | Responsibilities |
|---|---|
| Release manager (uExel) | Receives CI bundles, reviews release information, sets risk, marks releases ready, coordinates deployment, maintains the change register. |
| Laboratory director / designee (Precipio) | Reviews high-risk releases, checks laboratory verification evidence, accepts or rejects, records a signed decision. |
| Staff (Precipio) | Reads release notes and acknowledges changes relevant to their work. |
| Auditor (read-only) | Reviews version history and generates date-scoped audit exports. |

## Main release workflow

1. **CI bundle received** — build ID, version, SHA-256, issues, PRs, test summary, manual.
2. **Release manager review** — bundle, linked issues, PRs, tests, documentation.
3. **Risk classification** — Low or High; risk can be raised but **never lowered**.
4. **Readiness evaluation** — required gates calculated server-side from evidence and risk.
5. **Deployment gate** — deploy only when every required check is satisfied.
6. **Record live version** — deployment event, version history, release notes.
7. **Staff and audit** — acknowledgements collected, audit evidence preserved.

| Condition | Required behavior |
|---|---|
| Low risk | Director acceptance not required; readiness checks still apply. |
| High risk | Laboratory verification + director acceptance for that exact build before production. |
| Rejected | Return to uExel; corrected bundle is a **new** review. Frozen record is not edited. |
| Missing evidence | Deployment stays blocked. |

## Readiness checklist

| Item | Backend verifies | Required for |
|---|---|---|
| Linked issues | Issues attached, with risk class and documentation impact | All |
| Reviewed pull requests | Each PR has a second-engineer review | All |
| CI test summary | Suites passed for the **same build ID** | All |
| User manual | Correct versioned manual in bundle | All |
| Laboratory verification | Test-environment evidence attached and reviewed | High risk |
| Director acceptance | Director/designee accepted **this build** | High risk |

## Laboratory review and signature

Review changes → verify evidence (test-environment cases only, no patient data) → accept/reject →
re-authenticate (password + authenticator code) → persist approver, decision, reason, timestamp,
build ID and bundle hash in an append-only approval record.

## Configuration changes

Log change (product, area, issue, what, why, risk, tester, evidence) → freeze record → laboratory
verification → director acceptance with re-authentication → apply in production (who/when, notify staff).

- Report-template changes are **always High risk**.
- Applying an unaccepted change is recorded as a **deviation**.

## Emergency authorization

1. Release manager signs first (incident, what is happening, testing so far).
2. A laboratory contact independently authorizes or declines. The requester cannot sign twice.
3. Request **expires after 4 hours** without the second signature.
4. Deployment blocked until the second signature exists.
5. Director review within **3 business days**; emergency status appears in every audit export.

## Email intake and quarantine (suggested, not specified)

Incoming email → store intake record → validate sender/file type/size, scan attachments →
trusted: process / uncertain: quarantine → manual review → link to release or configuration change.

## Version history

Product + environment, version + build, live start/end (previous interval closed on new deploy),
risk and acceptance (incl. emergency), manual in force. Must answer: *what was running at time T?*

## Release notes and acknowledgement

Staff see notes for their work area plus the manual link; acknowledgement records user, notes version
and timestamp. It is a record of reading, not a deployment approval.

## Audit export

Select scope (dates, products, purpose) → collect evidence → identify gaps → generate PDF index + ZIP →
preserve locked copy and log requester, time, period, purpose and manifest hash.

## Suggested API surface

| Module | Endpoints |
|---|---|
| Releases | `POST /releases/webhook`, `GET /releases`, `GET /releases/:id`, `GET /releases/:id/readiness` |
| Approvals | `GET /review-queue`, `POST /releases/:id/approvals`, `POST /approvals/:id/reject` |
| Configuration changes | `POST /configuration-changes`, `GET /configuration-changes`, `POST /configuration-changes/:id/verification` |
| Emergency requests | `POST /emergency-requests`, `POST /emergency-requests/:id/second-signature`, `POST /emergency-requests/:id/decline` |
| Deployment/history | `POST /deployments`, `GET /version-history`, `GET /version-history/at?date=...` |
| Email/quarantine | `POST /email-intake/webhook`, `GET /email-intake`, `GET /quarantine`, `POST /quarantine/:id/approve` |
| Audit | `POST /audit-exports`, `GET /audit-exports/:id`, `GET /audit-exports/:id/pdf`, `GET /audit-exports/:id/zip` |
