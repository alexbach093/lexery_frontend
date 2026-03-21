# Codex Guardrail Prompt for Lexery

You are working in the `lexery` repository.

Before writing code, you must align with the current `main` architecture, not with older convenience patterns.

## First read

Read these files before making non-trivial changes:

- `docs/guidelines/README_UA.md`
- `docs/CODEX_MAIN_REFERENCE_PLAYBOOK.md`

Then inspect only the relevant current reference files for the task:

- routing / workspace shell:
  - `src/app/layout.tsx`
  - `src/app/(workspace)/layout.tsx`
  - `src/app/(workspace)/page.tsx`
- chat orchestration:
  - `src/workspace-chat/index.ts`
  - `src/workspace-chat/use-chat-stream.ts`
  - `src/workspace-chat/use-chat-attachments.ts`
- chat persistence:
  - `src/lib/chat-library.ts`
  - `src/lib/chat-repository.ts`
  - `src/lib/local-chat-repository.ts`
  - `src/lib/chat-session-mappers.ts`
- global shell UI:
  - `src/components/ui/WorkspaceSidebar.tsx`
  - `src/components/ui/SearchOverlay.tsx`
  - `src/components/ui/SettingsScreen.tsx`

## Non-negotiable rules

- Keep `src/app` route-only.
- Do not place reusable UI in `src/app`.
- Do not create new `features` or `widgets` layers.
- Do not invent a parallel storage path for chat state if repository / chat-library already covers it.
- Do not put persistence, streaming, attachments, route hydration, and modal state into one new hook or component.
- Do not fix shell-level problems with scattered leaf-level route patches.
- Do not introduce a change that quietly expands into a broad refactor unless the task explicitly requires it.

## Required thinking sequence

Before generating code, answer internally:

1. What layer does this task belong to: routing, shell, UI, domain, persistence, or a clear combination?
2. What is the closest reference pattern in current `main`?
3. What is the smallest write scope that solves the task?
4. Does the task require a model change before a UI change?
5. Am I extending an existing seam, or am I compensating for a missing seam in the wrong place?

## Scope discipline

At the start of the task:

- name the exact user-visible behavior being changed
- name the exact files that should change
- keep the diff inside that boundary unless a direct blocker is proven

If the change starts touching routing, shell, persistence, and leaf UI all at once, stop and re-evaluate.

## Preferred implementation style

- shell owns global overlay state through contexts
- `workspace-chat` owns workspace chat orchestration
- `lib` owns persistence and storage abstractions
- `components/*` owns reusable UI
- large screens should be shell components composed from smaller leaf components
- mapping between runtime and persisted data belongs in mappers, not in UI

## Anti-patterns to actively reject

- giant new screen files
- giant new hooks
- new ad hoc localStorage stores for core behavior
- duplicate chat metadata models for parallel UI flows
- putting domain types inside screen files
- adding “temporary” adapter folders that become permanent

## Final self-check before finishing

Verify all of the following:

- the change follows a reference pattern from current `main`
- no old architecture was reintroduced
- the diff stayed within the intended layer
- no new refactor wave was created for the next task
- the implementation is structurally clean, not only visually correct

If there is a tradeoff between shipping a quick patch and preserving the corrected `main` boundaries, prefer the corrected boundaries.
