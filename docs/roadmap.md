# Implementation roadmap

Build one end-to-end workflow at a time. Do not implement every screen in parallel.

| Phase | Build | Done when | Status |
|---|---|---|---|
| 1 | Foundation: repositories, database, auth, roles, Docker, environments | Users can sign in with role-aware access | 🟡 Repo, CI, Docker and domain rules in place; DB + auth pending |
| 2 | Products, release records, CI webhook, issue/PR metadata, change register | A CI bundle is saved and displayed in the register | ⬜ (CI side of the bundle done) |
| 3 | Readiness calculation, evidence upload, review queue, director decision | High-risk approval enforced server-side | 🟡 Readiness rules implemented and tested |
| 4 | Deployment gate, deployment event, version history, release notes | A permitted deployment updates the production timeline | 🟡 Gate rule implemented and tested |
| 5 | Configuration change workflow and production application tracking | Config changes follow their own approval path | ⬜ |
| 6 | Email intake, attachment processing, quarantine | Incoming email can be safely reviewed and linked | ⬜ |
| 7 | Staff acknowledgements and audit PDF/ZIP export | Auditors can retrieve a scoped evidence package | ⬜ |
| 8 | Emergency two-person authorization, expiry, reminders, hardening | Emergency process and post-deploy review enforced | 🟡 Two-signature + expiry rules implemented and tested |

## Essential test scenarios

- [x] 1. High-risk release cannot deploy until lab verification and director acceptance exist for the exact build.
- [x] 2. Low-risk release does not require director acceptance but still passes its readiness gates.
- [x] 3. A rejected release remains blocked.
- [x] 4. Approval for one build cannot authorize a different build or bundle hash.
- [ ] 5. An unauthorized user cannot approve, deploy, or export restricted evidence.
- [x] 6. Emergency deployment stays blocked until the second authorized signature is recorded.
- [x] 7. Emergency request expires after four hours without the second signature.
- [x] 8. Configuration changes applied before acceptance are recorded as a deviation.
- [ ] 9. Staff acknowledgements preserve user and timestamp.
- [ ] 10. Audit export includes gaps and preserves scope, purpose and manifest hash.
