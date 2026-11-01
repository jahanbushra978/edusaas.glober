# Noor Kids — Project Instructions

## Project identity and scope
- Noor Kids is a new, independent project. Do not copy or reuse code, architecture, configuration, dependencies, credentials, or assets from any other project.
- Implement only the phase and scope explicitly approved by the user. Do not build the whole roadmap in one operation.
- Phase 01 uses clearly labeled mock data. It has no production backend, database, authentication, or Quran recitation content.

## Architecture and folder rules
- Use the Next.js App Router and strict TypeScript conventions established by this project.
- Keep route files focused on composition. Put shared primitives in `src/components/`, domain UI/logic in `src/features/`, demo-only fixtures in `src/data/mock/`, shared helpers in `src/lib/`, and shared types in `src/types/`.
- Keep home, curriculum, games, audio, progress, parent, and teacher concerns modular. Do not couple game mechanics to curriculum records.
- Reuse an existing project component/helper before introducing another one. Add abstractions only when they serve a real reuse need.
- Do not add a dependency, database table, service, config file, or feature unless it is required by the approved phase.

## Coding standards
- Prefer small, typed, readable modules; avoid `any`, unsafe casts, duplicated logic, hidden side effects, and unexplained fallback behavior.
- Validate external/user input at boundaries. Keep UI state explicit and errors visible with an appropriate user-facing state.
- Use semantic HTML, stable keys, clear naming, and the repository formatter/linter conventions.
- Keep mock content unmistakably labeled and separate from canonical educational content.

## Design and component requirements
- Home and game experiences must use the same Noor Kids design tokens and shared components.
- Build mobile-first, responsive layouts for phone, tablet, and desktop; prevent unintended horizontal overflow.
- Make controls keyboard and touch accessible, with visible focus, useful accessible names, semantic status announcements, and adequate touch targets.
- Render Arabic with correct direction and shaping; do not treat sacred Quran text as draggable game pieces.
- Respect `prefers-reduced-motion`; animation must be optional enhancement, never the only feedback channel.

## Security and privacy
- Never commit, print, or expose secrets. Do not configure production credentials or deploy without explicit user approval.
- Do not collect unnecessary child data. No advertising, public child profiles, unrestricted messaging, or recording without approved parental-consent design.
- For any later backend phase, require deny-by-default authorization, server-side checks, least privilege, tenant isolation, and reviewed Supabase RLS/storage policies. Never expose a service-role key to the browser.
- Do not run production SQL/migrations, modify production data, push, or deploy unless explicitly authorized.

## Quran and educational content verification
- Never invent Quran verses, Arabic Quran text, recitation, religious rulings, curriculum order, or verification status.
- Do not use AI-generated Quran recitation. Do not present synthetic or unreviewed Arabic pronunciation as teaching material.
- Quran text, recitation, and curriculum assets require traceable source, version, and qualified-review approval before release. Corrections must preserve a review/version history.
- Phase 01 may use isolated Arabic letters solely as clearly labeled UI/game mock data; its synthetic audio cue must be labeled as non-Arabic and non-Quranic.
- AI, if added in a later approved phase, must not generate verses/recitation, issue unverified rulings, or independently certify Tajweed.

## Testing and quality gates
- Add or update focused tests for changed behavior. Cover success, error/retry, keyboard/touch operation, and responsive states where relevant.
- Before declaring a phase done, run available typecheck, lint, tests, and production build; report exact results and limitations honestly.
- Do not claim real-device, real-audio, Quran-content, security, or offline verification unless it was actually performed.

## Development workflow and permissions
- Read this file and applicable repository instructions before editing; inspect relevant code and preserve unrelated work.
- Work in small, reviewable steps. Keep mock data, UI, and business logic separated. Recheck the approved scope before adding packages or services.
- Ask before expanding scope, selecting an unapproved Quran source, adding production credentials, creating/running production migrations, deploying, pushing, or making destructive changes.
- End each phase with a concise changed-files list, tests/results, known limitations, and the next proposed phase. Wait for explicit approval before starting that next phase.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
