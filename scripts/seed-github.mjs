#!/usr/bin/env node
// Seeds this test repo with labels and sample issues so the CaseVu project has data to fetch.
// Safe to re-run: existing labels are updated and issues with the same title are skipped.
//
// Usage (token needs "Issues: read/write" on this repo; a fine-grained PAT is best):
//   GITHUB_TOKEN=xxxx node scripts/seed-github.mjs [owner/repo]
const repo = process.argv[2] ?? 'Tanveeraly/working-with-CI';
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Set GITHUB_TOKEN first.');
  process.exit(1);
}

const api = async (method, path, body) => {
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'seed-script',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 422) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return { status: res.status, data: res.status === 204 ? null : await res.json() };
};

const labels = [
  ['risk:low', '0e8a16', 'Low risk change'],
  ['risk:high', 'd93f0b', 'High risk: lab verification + director acceptance required'],
  ['docs:impact', '1d76db', 'User manual must be updated'],
  ['docs:none', 'c5def5', 'No user-visible change'],
  ['change', 'bfd4f2', 'Code change'],
  ['config-change', 'fbca04', 'Configuration change (not a code release)'],
  ['bug', 'b60205', 'Something is not working'],
  ['emergency', 'e11d21', 'Patient care affected now'],
];

// Bodies mirror the issue-form output ("### Heading\n\nvalue") so one parser handles both.
const section = (fields) => Object.entries(fields).map(([k, v]) => `### ${k}\n\n${v}`).join('\n\n');

const issues = [
  {
    title: 'Add HbA1c unit conversion (% to mmol/mol)',
    labels: ['change', 'risk:high', 'docs:impact'],
    body: section({
      'What should change': 'Add a converter from HbA1c % (NGSP) to mmol/mol (IFCC).',
      Why: 'Reports must show both units.',
      'Risk class': 'High',
      'Documentation impact': 'Yes - manual update required',
      'Laboratory verification plan (High risk only)': 'Compare 20 test-environment samples against the analyzer output.',
    }),
  },
  {
    title: 'Fix rounding of glucose conversion near .x5 boundaries',
    labels: ['bug', 'risk:high', 'docs:none'],
    body: section({
      'What happened': '7.05 mmol/L is displayed as 7.0 in some cases.',
      'Expected behavior': 'Consistent half-up rounding.',
      'Version / build': '0.1.0',
      'Risk class': 'High',
      'Is patient care affected right now?': 'No',
    }),
  },
  {
    title: 'Improve error message for negative glucose input',
    labels: ['change', 'risk:low', 'docs:none'],
    body: section({
      'What should change': 'Include the received value in the RangeError message.',
      Why: 'Easier troubleshooting.',
      'Risk class': 'Low',
      'Documentation impact': 'No - no user-visible change',
    }),
  },
  {
    title: 'Update glucose report template footer',
    labels: ['config-change', 'risk:high'],
    body: section({
      Product: 'Sample Lab App',
      Area: 'Report template',
      'What changed': 'Footer now shows the reference-range source.',
      Why: 'Requested by laboratory director.',
      'Risk class': 'High',
      Tester: 'qa-tester',
      'Test-environment evidence': 'Rendered 5 test-environment reports; screenshots attached in test system.',
    }),
  },
  {
    title: 'Critical high glucose not flagged at exactly 25.0',
    labels: ['bug', 'risk:high', 'emergency'],
    body: section({
      'What happened': 'Sample scenario for emergency workflow testing.',
      'Expected behavior': 'Values >= critical high are flagged CRITICAL_HIGH.',
      'Version / build': '0.1.0',
      'Risk class': 'High',
      'Is patient care affected right now?': 'Yes',
    }),
  },
];

for (const [name, color, description] of labels) {
  const { status } = await api('POST', '/labels', { name, color, description });
  if (status === 422) await api('PATCH', `/labels/${encodeURIComponent(name)}`, { color, description });
  console.log(`label  ${name}`);
}

const existing = new Set();
for (let page = 1; ; page++) {
  const { data } = await api('GET', `/issues?state=all&per_page=100&page=${page}`);
  data.forEach((i) => existing.add(i.title));
  if (data.length < 100) break;
}

for (const issue of issues) {
  if (existing.has(issue.title)) {
    console.log(`skip   ${issue.title}`);
    continue;
  }
  const { data } = await api('POST', '/issues', issue);
  console.log(`issue  #${data.number} ${issue.title}`);
}
