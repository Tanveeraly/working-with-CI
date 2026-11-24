#!/usr/bin/env node
// Assembles the CaseVu CI release bundle:
//   build ID, version, SHA-256, linked issues, PRs (+ reviews), test summary and user manual.
// Inputs (produced by earlier CI steps): backend/dist, backend/test-results.json, prs.json, reviews.json
// Output: release-bundle/<name>.tar.gz and release-bundle/manifest.json
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'release-bundle');
const stage = join(outDir, 'contents');

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);

const pkg = readJson(join(root, 'backend/package.json'), {});
const version = pkg.version ?? '0.0.0';
const buildId = process.env.BUILD_ID ?? `local-${Date.now()}`;
const commitSha = process.env.COMMIT_SHA ?? execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();

// --- Test summary (Vitest JSON reporter) ---
const results = readJson(join(root, 'backend/test-results.json'), null);
const testSummary = results
  ? {
      buildId,
      passed: results.success === true,
      total: results.numTotalTests,
      passedTests: results.numPassedTests,
      failedTests: results.numFailedTests,
      skippedTests: (results.numPendingTests ?? 0) + (results.numTodoTests ?? 0),
      suites: results.numTotalTestSuites,
    }
  : { buildId, passed: false, missing: true };

// --- Pull requests, reviews and linked issues ---
const prs = readJson(join(root, 'prs.json'), []);
const reviews = readJson(join(root, 'reviews.json'), []);
const closing = /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;

const pullRequests = prs.map((pr) => {
  const prReviews = reviews.filter((r) => r.pr === pr.number);
  const approvers = [...new Set(prReviews.filter((r) => r.state === 'APPROVED').map((r) => r.reviewer))];
  return {
    number: pr.number,
    title: pr.title,
    author: pr.user,
    url: pr.html_url,
    mergedAt: pr.merged_at,
    approvers,
    secondEngineerReviewed: approvers.some((a) => a !== pr.user),
  };
});

const linkedIssues = [
  ...new Set(prs.flatMap((pr) => [...(pr.body ?? '').matchAll(closing)].map((m) => Number(m[1])))),
].sort((a, b) => a - b);

// --- Stage contents ---
rmSync(outDir, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(join(root, 'backend/dist'), join(stage, 'dist'), { recursive: true });
cpSync(join(root, 'docs/manual'), join(stage, 'manual'), { recursive: true });
writeFileSync(join(stage, 'test-summary.json'), JSON.stringify(testSummary, null, 2));

// --- Archive + hash ---
const archiveName = `casevu-${version}-${buildId}.tar.gz`;
const archivePath = join(outDir, archiveName);
// Relative paths: GNU tar on Windows treats "D:\..." as a remote host.
execFileSync('tar', ['-czf', archiveName, '-C', 'contents', '.'], { cwd: outDir });
const sha256 = createHash('sha256').update(readFileSync(archivePath)).digest('hex');

const manifest = {
  schema: 'casevu.release-bundle/v1',
  product: 'CaseVu',
  version,
  buildId,
  commitSha,
  ref: process.env.GIT_REF ?? null,
  repository: process.env.REPOSITORY ?? null,
  createdAt: new Date().toISOString(),
  bundle: { file: archiveName, sha256 },
  linkedIssues,
  pullRequests,
  testSummary,
  manual: { path: 'manual/user-manual.md', version },
};

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
rmSync(stage, { recursive: true, force: true });

console.log(`Release bundle ${archiveName}`);
console.log(`SHA-256 ${sha256}`);
console.log(`Linked issues: ${linkedIssues.join(', ') || 'none'} | PRs: ${pullRequests.length} | tests passed: ${testSummary.passed}`);
