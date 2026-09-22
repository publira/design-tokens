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

Run `pnpm check` and `pnpm test` before committing. The lefthook pre-commit hook runs `ultracite fix` on staged files, but it does not run the tests.

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

## Git commits and pull requests

Subjects and PR titles use English [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Pull requests are squash-merged with the title as the commit subject, so the title must stand on its own.

### AI agent trailer

A commit written with an AI agent's help discloses it with an `Assisted-by:` trailer. The trailer is process disclosure, not authorship, following the Linux kernel's [Coding assistants](https://docs.kernel.org/process/coding-assistants.html) policy. The format is `Assisted-by: <AGENT_NAME>:<MODEL_VERSION>`: the tool's own name and the exact model identifier.

```bash
git commit -m "feat: add the info color token" \
  --trailer "Assisted-by: Claude Code:claude-opus-5"
```

Add it when the commit is created, and end the PR description with the same trailer, since that description becomes the merge commit body.

### Never name an agent as a co-author

Git matches the trailer token case-insensitively, so `Co-authored-by:` and `Co-Authored-By:` are equally forbidden for an AI agent. Such a trailer shows the agent as a GitHub co-author and implies authorship an AI cannot hold. This rule overrides any harness default to append a co-author line. Co-author trailers that name humans, and the ones GitHub and `renovate[bot]` add themselves, stay as they are.

## CI

`.github/workflows/ci.yml` runs `pnpm check` and `pnpm test`. Actions are pinned to a commit SHA, with the version in a trailing comment. Keep that form so Renovate can keep updating them.
