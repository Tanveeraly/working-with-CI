# Branch and PR flow

Changes go through the same flow CaseVu expects from a real product, so the generated data looks real.

1. Create an issue from a template (risk class + documentation impact) and label it.
2. Branch: `feature/<issue>-<slug>`, `fix/<issue>-<slug>` or `config/<issue>-<slug>`.
3. Open a PR with `Closes #<issue>` and tick a risk class. The `pr-checks` workflow enforces both.
4. Get an approval from a second account, then merge.
5. Release: bump `app/package.json` version and the manual header, tag `vX.Y.Z`, then push the tag.

## One-time GitHub settings (optional, makes data stricter)

**Settings → Branches → branch protection for `main`:**

- Require a pull request before merging, with 1 approval
- Require status checks: `test`, `linked-issue`

Leave "Do not allow bypassing" **off** so you can deliberately merge bad PRs to create edge-case data.

**Settings → Actions → General → Workflow permissions:** "Read and write" is not required. The release
job requests `contents: write` itself.

**Secrets (optional, only for webhook testing):** `CASEVU_WEBHOOK_URL`, `CI_WEBHOOK_SECRET`.
