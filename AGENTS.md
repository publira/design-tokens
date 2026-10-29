# Design Tokens Agent Guide

Repository-specific conventions for coding agents.

## Repository overview

`@publira/design-tokens` is the set of design tokens shared by the Publira Organization's web projects, published for Tailwind CSS v4. It is a single package, not a workspace.

- `tokens/*.tokens.json`: the tokens, in the [Design Tokens Format Module](https://www.designtokens.org/tr/drafts/format/) (DTCG). They are the source of truth and are also exported as they are.
- `style-dictionary.config.js`: turns the token files into `dist/theme.css`, an `@theme` block that Tailwind reads.
- `dist/`: build output. It is git-ignored and built by `prepack` before publishing.
- `test/`: `node:test` tests. They validate the token files and compile the built `theme.css` with the Tailwind CLI through the package's own `exports`.

`README.md` is the reference for consumers: the token list, how to import them, the criteria for adding a token, and the versioning policy. Do not repeat it here.

## Development commands

- `pnpm build`: generate `dist/theme.css` from the token files.
- `pnpm test`: build, then run the tests.
- `pnpm check`: run the Ultracite lint and format checks.
- `pnpm fix`: apply the Ultracite fixes.

Run `pnpm check` and `pnpm test` before committing. The lefthook pre-commit hook runs `pnpm fix` on the staged files, but it does not run the tests.

## Token rules

- Change tokens only in `tokens/*.tokens.json`, never in `dist/theme.css`. Keep each token a valid DTCG token: a color is an `srgb` object whose `components` and `hex` agree, and a font stack is a `fontFamily` array.
- A token's path becomes its CSS variable (`color` › `primary-foreground` is `--color-primary-foreground`), so keep names flat inside a group and inside a Tailwind namespace.
- This package holds tokens and nothing else. Element defaults, resets, layout, and component styles belong to each application.
- Do not redefine what Tailwind's default theme already provides (spacing, sizes, radii, shadows, the type scale, breakpoints) without a reason that holds across Publira's projects.
- This package is the source of truth for its tokens. Do not describe the values as coming from, or following, another repository.
- A change to what consumers see is at least a minor release. Follow the versioning table in `README.md`.

## Language

Everything in the repository is **English**: `README.md`, this guide, code comments, token `$description`s, test labels, commit messages, Issues, and pull requests.

Answer the user in the language of their own prose. Quoted logs, code, or UI strings do not decide it. Answer in English when no user prose settles it, such as in a scheduled or CI-started run.

## Commit types and releases

release-please reads the Conventional Commits type of each commit subject to choose the next version, so the type has to match the versioning table in `README.md`:

- `feat:` for any change consumers can see, including a changed color or font stack. It releases a minor version.
- `fix:` only for a change that does not alter the output, such as packaging or metadata. It releases a patch.
- `feat!:` or a `BREAKING CHANGE:` footer when a token is removed, renamed, or changes meaning. It releases a major version.
- `docs:`, `test:`, `ci:`, and `chore:` release nothing.

## CI and release

`.github/workflows/ci.yml` runs `pnpm check` and `pnpm test` as the `Validate` job, which a repository ruleset requires before a pull request can merge into `main`. Pull requests merge through a merge queue, so `ci.yml` also runs on `merge_group` and reports `Validate` on the group the queue builds.

`.github/workflows/release.yml` runs release-please on every push to `main`. It keeps a release pull request open that bumps `package.json`, `.release-please-manifest.json`, and `CHANGELOG.md`. Merging that pull request tags `vX.Y.Z`, creates the GitHub Release, and publishes the package to npm through trusted publishing (OIDC), without an npm token. Do not bump the version or edit `CHANGELOG.md` by hand.

Actions are pinned to a commit SHA, with the version in a trailing comment. Keep that form so Renovate can keep updating them.

## Skill packages

Entries in `.agents/skills/*` listed in `skills-lock.json` are vendored: `npx skills` overwrites them, and the maintenance bot in `publira/agents` runs `npx skills update -p -y` weekly and opens a pull request when there is a diff. Do not edit them; a patch is lost at the next update. Reading them for reference is fine. When this repository's policy and a skill disagree, this file wins. `.claude/skills/*` reaches the same skills through relative symlinks.
