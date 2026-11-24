# Generating test data

Use these recipes to produce each kind of record the CaseVu project should handle.

## 1. Seed labels and sample issues (once)

Create a fine-grained token with **Issues: read/write** on this repo, then:

```bash
GITHUB_TOKEN=<token> node scripts/seed-github.mjs
```

## 2. A normal reviewed change → PR data

```bash
git checkout -b feature/4-error-message
# edit app/src/index.ts, add a test
git commit -am "Include value in glucose RangeError"
git push -u origin feature/4-error-message
```

Open a PR with `Closes #4` in the body and tick a risk class. To get a **second-engineer review**,
approve it from a second GitHub account (you can't approve your own PR). Then merge it.

## 3. A release bundle → release/version data

```bash
# bump "version" in app/package.json and the manual header in docs/manual/user-manual.md
git commit -am "Release 0.2.0"
git tag v0.2.0
git push origin main v0.2.0
```

CI publishes a GitHub Release `v0.2.0` with the `.tar.gz` bundle and `manifest.json` attached.

## 4. Edge cases worth generating

| Case | How to produce it | What CaseVu should do |
|---|---|---|
| Failed tests | Break a test, push a tag | `testSummary.passed = false` → block |
| Self-reviewed / unreviewed PR | Merge without a second account's approval | `secondEngineerReviewed = false` → block |
| No linked issue | Remove `Closes #n` (pr-checks fails; merge anyway as admin) | `linkedIssues: []` → block |
| Manual version mismatch | Bump `app/package.json` but not the manual | Manual check fails |
| High-risk release | Link an issue labelled `risk:high` | Needs lab verification + director acceptance |
| Corrected rebuild | Fix the issue and tag a new patch version (e.g. `v0.2.1`) | New `buildId`, new SHA-256 → approvals must not carry over |
| Config change | Issue labelled `config-change` | Separate approval path |
| Emergency | Issue labelled `emergency` | Two-person authorization |
