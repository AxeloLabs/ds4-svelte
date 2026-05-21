# Contributing to ds4-svelte

Thanks for considering a contribution! This project is an open-source
Svelte 5 design system. We welcome issues, PRs, and discussions.

## Quick start (local development)

```bash
git clone https://github.com/AxeloLabs/ds4-svelte.git
cd ds4-svelte
pnpm install
```

The components live in `src/`. Open any `.svelte` file to inspect
the implementation — every component has a TypeScript `interface Props`
at the top of the script block.

## Reporting issues

Open an issue on GitHub with:

- **Title** — short description of the problem
- **Steps to reproduce** — minimal code snippet that triggers the bug
- **Expected behavior** vs **actual behavior**
- **Environment** — Svelte version, Vite/SvelteKit version, OS, browser

## Submitting a PR

1. Fork the repo and create a branch from `main`.
2. Make your changes. Keep the diff focused — one fix or feature per PR.
3. **Add a changeset** describing your change:

   ```bash
   pnpm changeset
   ```

   Pick the bump type (`patch` / `minor` / `major`) and write a
   concise description. The changeset file lands at `.changeset/*.md`.

4. Commit code + changeset together.
5. Push and open a PR. Describe the motivation.

## Coding conventions

- **TypeScript** is mandatory. Props interfaces must be typed.
- **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$bindable`)
  for all reactive state. No `let` reactive declarations.
- **CSS scoping** — prefer scoped `<style>` over `:global()`. Use
  CSS tokens (`--ox-*`) for customization hooks.
- **Color roles** — every `background: var(--ox-X)` MUST have a paired
  `color: var(--ox-on-X)` for guaranteed contrast.
- **Component naming** — `Ox` prefix, PascalCase
  (`OxButton`, `OxAppShell`).
- **Accessibility** — interactive components must use Zag.js or
  provide equivalent ARIA + keyboard + focus management.

## Release process

Releases are automated via [Changesets](https://github.com/changesets/changesets):

1. Every PR adds a changeset (see above).
2. When merged to `main`, a "Version Packages" PR is opened/updated
   automatically by GitHub Actions.
3. Merging the "Version Packages" PR triggers:
   - `package.json` version bump
   - `CHANGELOG.md` update
   - `npm publish`
   - Git tag

## License

By contributing, you agree your code will be released under the
project's [MIT license](LICENSE).
