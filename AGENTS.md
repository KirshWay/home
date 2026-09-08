# Home — agent guide

Home is Viktor Nemets / Kirshway's personal site. Preserve its English copy, mosaic layout, and personal character. Work is highlighted through project cards and a separate CV block; do not turn the homepage into a full resume unless requested.

## Working agreements

- Read the relevant implementation and inspect the working tree before editing. Preserve existing user changes and keep the change scoped to the task.
- Use current site data and user-provided material for personal details and project claims. Ask when required information is missing; do not invent experience, metrics, or profile links.
- Check `package.json` for available dependencies and the required Node.js/pnpm versions. Ask before adding a production dependency or changing the framework/build architecture.
- Do not commit, push, deploy, publish, or perform another external action unless the task explicitly authorizes it.
- Bump versions only for requested releases: `patch` for fixes and small refinements, `minor` for new sections or capabilities, and `major` for a substantial redesign. Use `pnpm run version:patch`, `pnpm run version:minor`, or `pnpm run version:major`; these commands create no commit or tag. A bump is not required for every content edit or deployment. For an explicit version, use `pnpm version <version> --no-git-tag-version --no-git-checks`.

## Find the right place

- `src/data/site.ts` owns profile, navigation, projects, tools, social links, and CV details; `src/types/site.ts` defines their contracts. `src/data/moments.ts` owns gallery photos and descriptions.
- `src/pages/index.astro` composes the homepage; `src/components/IdentityRail.astro` composes its side column. Reuse presentation components in `src/components/` where their semantics fit.
- `src/layouts/Layout.astro` owns document metadata, fonts, global CSS, and appearance initialization before paint.
- `.github/workflows/deploy.yml` builds and deploys GitHub Pages from `main`; keep its runtime and checks aligned with `package.json`. The repository's Pages source must be GitHub Actions. If the repository or domain changes, update `site` and `base` in `astro.config.mjs` and the README's URLs; preserve the trailing slash used by `import.meta.env.BASE_URL`.
- `src/styles/global.css` owns shared tokens, themes, layouts, breakpoints, and motion. Reuse its tokens and card styles when extending the design.
- Put imported images and icons in the appropriate `src/assets/` subdirectory. `public/` holds files served unchanged, including favicons, the downloadable CV, and `og-image.png`. Keep the social image and its Open Graph/Twitter metadata in `Layout.astro` consistent.
- `assets/readme/` holds repository-only screenshots. Refresh the relevant previews after a substantial visual change; keep them out of the site's asset pipeline.

## Implementation choices

- Keep Astro static-first, with TypeScript and Tailwind CSS. Prefer semantic HTML, CSS media queries, and native browser behavior before adding framework-free JavaScript. Check browser support and preserve usable fallbacks in Safari and Firefox.
- CSS controls responsive layout and section feedback (`:target`). The mobile menu uses a native popover; its small script handles dismissal and focus. Do not reintroduce JavaScript layout switching or timer-driven section highlighting.
- The gallery uses native overflow and CSS Scroll Snap. Its script only enhances arrow buttons and the counter; photos must remain reachable without JavaScript.
- Keep ASCII particle math in `src/scripts/ascii-particles.ts`, separate from canvas/DOM handling in `ascii-portrait.ts`. Preserve the image fallback, reduced-motion behavior, and stopping animation when idle or hidden.
- Keep initial appearance in `Layout.astro` consistent with `theme-toggle.ts`: storage keys, accepted values, and fallbacks must agree. Storage failures must not prevent using the page.
- Use Astro's asset pipeline (`Image`, `Picture`, or `getImage`) for imported raster images. Provide appropriate sizes, loading behavior, and alt text; keep source assets out of the project root.

## Add or change content, sections, and pages

1. For content changes, edit the relevant data first and extend its type only when needed. Keep presentation out of content data and avoid duplicating profile information in components.
2. For a homepage section, use an existing card pattern or a focused Astro component, then place it in `index.astro` or `IdentityRail.astro`. Preserve heading order, unique IDs, both themes, scanlines, keyboard access, and reduced motion. If it needs a navigation entry, update `profile.nav` and verify the destination can receive focus without being hidden by the header.
3. For a new page, create a route under `src/pages/` and reuse `Layout.astro` with suitable title and description. Check canonical URLs and navigation: `Header.astro` currently uses homepage fragment links, which need appropriate destinations when reused on another page. Inspect `astro.config.mjs` before assuming a deployment origin or base path.

## Verify the change

See [README.md](README.md) for local setup and available checks. Use the existing package scripts; verification must not require Codex or a machine-specific runtime path.

For source or configuration changes, normally run:

```sh
pnpm run check
pnpm run lint
pnpm run format:check
pnpm run build
```

- Run `pnpm test` when changing ASCII particle logic or its tests. It uses Node.js's built-in test runner and needs no server or browser. Keep automated tests focused on nontrivial behavior; ordinary copy and styling changes do not need markup assertions, snapshots, or browser test infrastructure. If adding another logic test file, update the test command to include it.
- For UI changes, inspect the affected behavior at 320px and desktop widths, in both themes, with scanlines on and off, keyboard navigation, and reduced motion. Check the skip link, menu, section links, visible focus, gallery controls, and portrait interaction where affected. Verify contact/profile links and viewing/downloading the CV when changing them. Check native fallbacks without JavaScript when changing navigation or the gallery; report any browser checks you could not perform.
- For documentation-only changes, check formatting of the edited files and verify referenced paths and commands. A site build is unnecessary.
- For page, layout, or deployment configuration changes, inspect the built HTML's canonical URL, social metadata, heading hierarchy, and asset links under the configured base path. Canonical and `og:url` must use the public URL; social images must use absolute URLs. Verify favicon, image, and CV paths. After an authorized deployment, repeat these checks at the public URL and inspect the shared-link preview.
- Report what changed, which checks ran, and any failures or unverified behavior. Do not describe a successful build as a successful type check.

Keep TypeScript within the installed Astro checker's supported peer dependency range. Before a TypeScript major upgrade, verify that `pnpm run check` still checks both Astro templates and TypeScript files; a successful standalone `tsc` run does not establish that compatibility.

## Keep this guide useful

Update paths and decisions here when the corresponding implementation changes. Keep temporary plans, run logs, and screenshots out of permanent agent instructions. Add a nested guide or reusable workflow only when a part of the project needs distinct rules; avoid duplicating these instructions across agent-specific files.
