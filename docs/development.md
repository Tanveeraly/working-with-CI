# Development process

The way this repository is developed feeds directly into the CaseVu readiness checklist, so the
process below is not optional.

## Branching

- `main` is protected and always releasable.
- Work on short-lived branches: `feature/<issue>-<slug>`, `fix/<issue>-<slug>`, `config/<issue>-<slug>`.
- Merge via pull request only (squash merge recommended).

## Issues → "Linked issues" gate

Every change starts from an issue created from a template in `.github/ISSUE_TEMPLATE/`. Each issue
records a **risk class** (Low/High) and **documentation impact**. Apply the matching label
(`risk:low` / `risk:high`, `docs:impact` / `docs:none`).

## Pull requests → "Reviewed pull requests" gate

- The PR body must reference its issue with a closing keyword (`Closes #12`). The `pr-checks`
  workflow fails otherwise.
- The PR template's risk checkbox must be ticked.
- At least **one approving review from an engineer other than the author** (enforced by branch protection + CODEOWNERS).

## CI → "CI test summary" and "User manual" gates

`ci.yml` runs on every PR and push. On `main` and `v*` tags it also builds the release bundle with
the test summary and the versioned manual (`docs/manual/user-manual.md`). If a change affects users,
update the manual in the same PR.

## Releasing

1. Bump `version` in `backend/package.json` and update the manual's version header.
2. Merge to `main`, then tag: `git tag v0.2.0 && git push origin v0.2.0`.
3. CI publishes the bundle artifact and notifies CaseVu (when the webhook secrets are configured).

## GitHub settings to enable (one-time, by a repo admin)

**Settings → Branches → Add branch protection rule** for `main`:

- Require a pull request before merging
  - Require approvals: **1**
  - Dismiss stale approvals when new commits are pushed
  - Require review from Code Owners
- Require status checks to pass: `backend`, `linked-issue`
- Require branches to be up to date before merging
- Do not allow bypassing the above settings

**Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `CASEVU_WEBHOOK_URL` | e.g. `https://casevu.example.com/releases/webhook` |
| `CI_WEBHOOK_SECRET` | Shared HMAC secret; must match the backend's `CI_WEBHOOK_SECRET` |

**Labels** to create: `risk:low`, `risk:high`, `docs:impact`, `docs:none`, `config-change`, `emergency`.
