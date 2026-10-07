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
        // Bytes, transfer size.
        // Fonts: Bricolage Grotesque variable (131,312) plus DM Mono latin 400
        // and 500 (14,820 and 14,988). The latin-ext files load only for
        // characters the page does not use.
        'resource-summary:font:size': ['error', { maxNumericValue: 163840 }],
        // Script: the one page script (controls, offscreen pause, tour
        // scroll, lazy scene imports). The three.js scene chunks (about
        // 540 KB) load only on hardware WebGL, after idle or on approach;
        // headless Chrome here has a software rasterizer, which the page
        // treats as no WebGL, so they are outside this run on purpose.
        'resource-summary:script:size': ['error', { maxNumericValue: 12288 }],
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
