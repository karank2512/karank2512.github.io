// Lighthouse CI budgets. Targets come from _brief/PLAN.md section 6.
// Runs against the static build in ./dist with mobile emulation.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/index.html'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.02 }],
        'total-blocking-time': ['error', { maxNumericValue: 100 }],
        // Bytes. Fonts: two families, three woff2 files. Script: the play
        // control only. Total excludes nothing because there is no video.
        'resource-summary:font:size': ['error', { maxNumericValue: 153600 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 10240 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 614400 }],
        'resource-summary:third-party:count': ['error', { maxNumericValue: 0 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
