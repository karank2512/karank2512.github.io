# Browser test security

Tests use installed Google Chrome via `channel: 'chrome'` and explicitly enable `chromiumSandbox`. Playwright manages fresh, nonpersistent test contexts; do not point tests at a personal profile, add `--no-sandbox`, or replace this with a bundled Chromium fallback. A fresh profile reduces retained credentials, not operating-system access.

The configured target is localhost. Test-controlled external resources are not proof that arbitrary open-web browsing is safe. Untrusted browsing needs its own isolation assessment. A browser sandbox is one layer, not a complete security boundary.

## Local check

Use an existing, supported Chrome installation. Check its current version against the vendor advisory before browsing untrusted pages. Do not download browsers or update the operating system as part of a routine test run. If Chrome is absent or sandbox launch fails, stop and report the blocker rather than disabling the flag. `npm run test:e2e` retains the existing three viewport projects. No site content or routes are changed here.

## CI

The a11y job uses Chrome already present on the hosted Ubuntu runner and checks `google-chrome --version`. It no longer downloads Playwright's bundled Chromium. If the runner image loses Chrome or cannot launch it sandboxed, the job must fail and be investigated. The Lighthouse config also removes its previous `--no-sandbox` flag; its other launch flags and all budgets are unchanged. The check-build and links jobs are unchanged. The Chrome channel follows the runner's installed version, not a guarantee that every future runner image is patched; inspect version logs when advisories change.

## Evidence, Nov 3, 2026

Official Playwright 1.64.1 metadata pins Chromium 156.0.8078.4 (revision 1248): https://raw.githubusercontent.com/microsoft/playwright/v1.64.1/packages/playwright-core/browsers.json

Chrome's Oct27 advisory lists critical fixes in 156.0.8078.73/.74: https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_0562499947.html

The explicit launch option matters because Playwright defaults chromiumSandbox to false: https://playwright.dev/docs/api/class-browsertype

This version lag motivated reducing exposure. It does not establish an exploit or breach. Updating the Playwright package alone is not sufficient while the release still pins the older browser.

## Repo-specific baseline and local isolation

This repo locks Playwright 1.63.0, whose installed metadata pins Chromium 153.0.8010.12 (revision 1243). The 1.64.1 evidence above describes the newer package present in a separate npm cache and demonstrates that updating to that release alone still would not reach the advisory's fixed browser version. It is not a claim that this repo locks 1.64.1.

Use `PORTFOLIO_TEST_PORT=4329 npm run test:e2e` to avoid an existing preview on 4321. The override must be an integer from 1024 through 65535. Tests never reuse an existing server: an occupied port fails rather than testing an unknown build. No test browser uses your personal profile.

Local verification: existing Chrome156.0.8078.80 with the sandbox explicitly enabled launched successfully. All66 Playwright checks passed after three fixed-sleep audio assertions were changed to wait for the actual playback clock; none of their assertions were removed. This does not establish Linux runner sandbox compatibility. The first run had65/66 pass and the next63/66, with audio timing races, before the waits were corrected. CI verification remains pending.
