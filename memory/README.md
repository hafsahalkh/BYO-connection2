# Project Memory

This folder is the scaffold-level shared memory surface for Specode orchestration.

## Files

- `roadmap.md` keeps the current working roadmap.
- `design-brief.md` keeps the current design direction.
- `user-input/` stores raw user prompts, clarifications, and other source material.

## Conventions

- Update the existing files instead of creating duplicate top-level planning files.
- Archive raw user input as separate files in `user-input/` so later sessions can
  reference the original source of truth.
- Keep memory artifacts product-specific, but keep the folder structure stable so
  the conductor can rely on it across projects.
- Do not store secrets or API keys in this folder.
- Exception: `memory/example-logins.json` is a Maestro-managed testing artifact and may contain temporary seeded login credentials for preview/testing. Do not hand-edit it.
