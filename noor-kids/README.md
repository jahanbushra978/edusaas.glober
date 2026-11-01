# Noor Kids

An independent, child-friendly Quran learning platform project.

## Phase 01

This phase contains a responsive home screen and an interactive game-screen prototype:

- Drag & Drop matching (pointer/touch, with keyboard selection as an alternative)
- Listen & Find using non-verbal Web Audio tone patterns
- Clearly labeled mock profiles, progress, and game content

The demo contains no Quran verses, recitation, verified pronunciation lessons, accounts, database, or production credentials. Synthetic tones are interaction prototypes only; they are not Arabic pronunciation or Quran recitation.

## Local development

Use Node.js 22.7 or newer and pnpm. The minimum Node version also supports the built-in TypeScript-aware test runner used by this project.

```bash
pnpm install
pnpm dev
```

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Read [AGENTS.md](./AGENTS.md) before making changes.
