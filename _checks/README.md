# Migration verification

Run from the repository root:

- `python3 _checks/check_migration.py`
- `node _checks/check_model.cjs`
- `node --check assets/channel/article.js`
- `git diff --check` and `git diff --cached --check`

The migration check compares every pre-existing file except the intentionally replaced homepage and one header navigation addition against base commit `94608e6a9c8584b0b6f9dc192583107d1a2a3ead`. All 10 legacy posts, layouts, configuration and assets are retained. The archive uses all `site.posts` and preserves `post.url`.

The new homepage and article are static HTML. No `.nojekyll` is added, so GitHub Pages can still render the archive and historical posts. Channel assets live under `assets/channel/` to avoid legacy asset collisions. The existing domain configuration is unchanged.

Checks cover local references and anchors, accessibility structure, responsive CSS rules, embedded model defaults, baseline calculations, sensitivity and boundary cases. They do not render Liquid or validate visual layout. Ruby/Bundler/Jekyll are unavailable in the preparation environment, so a full Jekyll build was not run. No dependency installation, merge, Pages deployment, domain change, signup, payment or subscription action is part of this draft.

## Pull-request build validation

`.github/workflows/validate-blog.yml` runs only for pull requests against `master`, with `contents: read`. Official checkout and GitHub Pages Jekyll actions are pinned to verified commit SHAs. The workflow runs migration/model checks, builds with the supported GitHub Pages environment, and checks all 10 rendered historical post URLs plus byte-identical static channel outputs. It does not upload a Pages artifact or deploy. The old Gemfile and lockfile remain unchanged; the official Pages builder may warn that its supported dependency set differs from the old lockfile.
