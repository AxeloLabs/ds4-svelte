# Changesets

This folder is configured by [Changesets](https://github.com/changesets/changesets).

When you make a change that needs to be released, run `pnpm changeset`
and follow the prompts. A new `.md` file will be created here describing
your change. Commit both your code and the changeset.

When the changesets are merged to `main`, the release workflow opens a
"Release" PR that consumes all pending changesets, bumps the version,
updates `CHANGELOG.md` and publishes to npm.

For more information, see the
[Changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md).
