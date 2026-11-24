import express from 'express';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'casevu-backend' });
  });

  // Phase 2+: mount module routers here (releases, approvals, configuration-changes,
  // emergency-requests, deployments, version-history, email-intake, audit-exports).

  return app;
}
