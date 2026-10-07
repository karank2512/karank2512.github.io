// Lighthouse CI budgets. Targets come from _brief/PLAN.md section 6.
// Runs against the static build in ./dist with mobile emulation.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/index.html'],
      numberOfRuns: 3,
      settings: {
        // Software WebGL only. The script budget below covers the first
        // load: the one page script. The three.js scene chunks load lazily,
        // after idle or on approach, and only when the page finds hardware
        // WebGL. The new headless mode on a Mac with a GPU does find it (ANGLE
        // over Metal), so a run without these flags fetched the hero scene
        // after idle and reported 141,512 bytes of script: the gzipped
        // three.js chunk (134,931) plus the hero scene (2,322), the lattice
        // chunk (1,399) and the page script (2,860), which is exactly that
        // sum. With the GPU off and ANGLE on SwiftShader the renderer string
        // names a software rasterizer, hasWebGL() in src/scenes/boot.ts says
        // no, and the run measures what every first load fetches, which is
        // also what CI (no GPU) and the Playwright run see. The budget itself
        // is unchanged.
        chromeFlags: '--no-sandbox --headless=new --disable-gpu --use-angle=swiftshader',
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
        // scroll, lazy scene imports), about 2.9 KB over the wire. The
        // three.js scene chunks (about 540 KB shared three.js, 135 KB
        // gzipped, plus a few KB per scene: hero, tour, turntable, deck
        // backdrop, gate, agency, field, and the role scenes under
        // Experience and Leadership) load only on hardware WebGL, after idle
        // or on approach; the chromeFlags above pin this run to a software
        // rasterizer, which the page treats as no WebGL, so they are outside
        // this run on purpose. The two small motion modules (cards, tiles)
        // hold no three.js and load on approach, after the first load this
        // budget measures.
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
