# working-with-CI: test data source for CaseVu

This is a **test repository**, not the CaseVu project itself. It contains a tiny sample app
(`app/`, lab-value utilities) plus a CI pipeline. Together they produce realistic GitHub data for the
CaseVu project to fetch and process:

- **Issues** with risk class and documentation impact (issue forms + labels)
- **Pull requests** that link issues (`Closes #n`) and have reviews
- **CI runs** with test summaries
- **Release bundles** on every `v*` tag: build ID, version, SHA-256, linked issues, PRs + reviewers,
  test summary and the versioned user manual, published as a GitHub Release (`.tar.gz` + `manifest.json`)
- **Optional webhook** that pushes `manifest.json` to a CaseVu endpoint with an HMAC signature

## Docs

- [docs/fetching-data.md](docs/fetching-data.md): which GitHub API endpoints CaseVu should call for each field
- [docs/generating-test-data.md](docs/generating-test-data.md): how to create issues, PRs, releases and edge cases
- [docs/development.md](docs/development.md): branch/PR flow and one-time GitHub settings

## Layout

```
.github/ISSUE_TEMPLATE/     change, config-change, bug forms
.github/workflows/ci.yml    test → build bundle → GitHub Release (tags) → optional webhook
.github/workflows/pr-checks.yml  PR must link an issue and tick a risk class
app/                        sample TypeScript app + Vitest tests
docs/manual/user-manual.md  versioned manual shipped in each bundle
scripts/build-release-bundle.mjs  builds the bundle + manifest.json
scripts/seed-github.mjs     creates labels and sample issues via the GitHub API
```

## Local

```bash
cd app && npm install && npm test
```
