# Codex Main Reference Playbook

## Why this exists

This file is a working guardrail for future changes in `lexery`.

It is based on what Yehor corrected in:

- `0723ea7456bb67e26ed886789f0a9548ba1937a1`
- `447037eaa3e5c4fa7f4393de41484b3b7d5b3724`
- `20c59e338e221ee13e011a4133a84fde8f5c2598`
- `4bc031e29045ac0af79af644143946418b09f536`

Use it before writing any non-trivial code.

## What Yehor actually fixed

### 1. The chat data model was too thin for the UX we were trying to ship

Earlier UI work was built around `recent-chats` and a lightweight `RecentChatItem` model.
That was enough for a visible sidebar list, but not enough for:

- real chat hydration by `chat` id
- rename / pin / delete
- search over actual chat entities
- `updatedAt` sorting
- persisted attachments
- persisted `systemPrompt`

Main reference now:

- `src/lib/chat-library.ts`
- `src/lib/chat-repository.ts`
- `src/lib/local-chat-repository.ts`
- `src/lib/chat-session-mappers.ts`
- `src/types/index.ts`

### 2. The main workspace behavior used to live in a monolithic hook

Old `use-workspace-chat` mixed:

- textarea behavior
- attachments state
- streaming state
- abort logic
- chat persistence
- route hydration
- new-chat events
- message editing / regenerate
- system prompt modal state

That made every new feature hit the same file and the same mental model.

Main reference now:

- `src/workspace-chat/index.ts`
- `src/workspace-chat/use-chat-stream.ts`
- `src/workspace-chat/use-chat-attachments.ts`
- `src/workspace-chat/helpers.ts`

### 3. The UI shell boundaries were wrong

Earlier route shell code lived in `components/layout/AppLayout.tsx`, while `app/page.tsx` also owned boot orchestration and `workspace/page.tsx` mounted the same shell differently.
That made routing, boot, search, settings, and workspace rendering too coupled.

Main reference now:

- `src/app/layout.tsx`
- `src/app/(workspace)/layout.tsx`
- `src/app/(workspace)/page.tsx`
- `src/contexts/boot-context.tsx`
- `src/contexts/search-open.tsx`
- `src/contexts/settings-open.tsx`

### 4. Several large screens were carrying too many responsibilities

The sidebar and settings screen were not just large; they also contained their own embedded sub-systems.

Main reference now:

- Sidebar shell: `src/components/ui/WorkspaceSidebar.tsx`
- Sidebar leaf pieces: `src/components/sidebar/*`
- Settings shell: `src/components/ui/SettingsScreen.tsx`
- Settings leaf pieces: `src/components/settings/*`

### 5. Filesystem structure did not reflect ownership clearly enough

The old shape used `features`, `widgets`, mixed-case UI files, and route-adjacent code in places where ownership was fuzzy.
Yehor aligned the filesystem with responsibility.

Main reference now:

- `src/app` is routing only
- reusable UI lives in `src/components`
- domain chat orchestration lives in `src/workspace-chat`
- persistence and app-level client storage live in `src/lib`
- structure rules are documented in `guidelines/README_UA.md`

## Reference patterns in `main`

### Routing and layout

- Keep `src/app` for routing and Next.js layout files only.
- Route shell belongs in route groups, not in generic reusable component folders.
- If behavior is specific to the workspace shell, start from:
  - `src/app/(workspace)/layout.tsx`
  - `src/app/(workspace)/page.tsx`

### Chat domain and persistence

- UI should not invent its own storage format.
- Repository is the swap point for persistence.
- Mapping between runtime message objects and persisted objects belongs in mappers, not in UI files.
- Sidebar/search should consume chat-library abstractions, not ad hoc storage helpers.

### UI decomposition

- Keep page/shell components thin enough to be navigable.
- Pull dialog/menu/row/control pieces into focused leaf components.
- Put settings constants and types outside the screen component when they describe the screen, not user interaction state.

### Naming and placement

- PascalCase component filenames for components.
- grouped icons under `src/components/icons/*` by context when useful
- no new `features` / `widgets` wrapper layers unless there is a very strong reason

### Overlay and shell state

- Open/close state for global overlays belongs in context providers in the workspace shell.
- Do not let leaf UI invent separate overlay state models if the shell already owns them.

## Anti-patterns I must not repeat

- Do not put reusable UI in `src/app`.
- Do not create a new “quick local store” for core chat behavior if `chat-library` / repository already exists.
- Do not put persistence, route hydration, streaming, and attachment UI into one hook again.
- Do not add a new giant screen file when the feature can be expressed as shell + leaf components.
- Do not create parallel architectures for the same domain state.
  Example: one path for “recent chats”, another for “actual chat sessions”.
- Do not add new pseudo-layers like `features` / `widgets` just to re-export components.
- Do not solve a shell-level routing problem with scattered `router.push` patches in leaf components.
- Do not keep inline SVGs inside large UI files when icons already have a home.
- Do not let a UI-only file define domain types that belong in `src/types/index.ts`.

## What was good as UX idea but weak as technical implementation

### Boot flow

Good UX idea:

- boot overlay with smooth fade into workspace

Weak implementation pattern to avoid:

- coupling boot visibility, workspace shell, and route layout in the same page-level structure

### Sidebar history and chat search

Good UX idea:

- searchable recent chats
- rename / pin / delete from sidebar

Weak implementation pattern to avoid:

- trying to grow that UX on top of `RecentChatItem` only
- using a minimal local list as if it were the real domain model

### System prompt editor

Good UX idea:

- editable system prompt with open/close modal flow

Weak implementation pattern to avoid:

- no clear draft/apply boundary
- persistence behavior living implicitly inside a larger chat UI flow

### Attachment UX

Good UX idea:

- filtered and expandable attachments UI

Weak implementation pattern to avoid:

- attachment UI state being tangled with stream control and persistence logic

## Mandatory pre-generation checks

Before writing code, answer these:

1. Is this change routing, shell, UI, domain, persistence, or more than one?
2. Which current `main` file is already the closest reference?
3. Does the requested UX require data that the current model does not store?
4. Am I about to add state into a screen/hook that already mixes too many concerns?
5. Can I extend an existing leaf module instead of touching the shell?

If the task touches these areas, inspect these files first:

- workspace shell: `src/app/(workspace)/layout.tsx`
- workspace page: `src/app/(workspace)/page.tsx`
- chat orchestration: `src/workspace-chat/index.ts`
- stream logic: `src/workspace-chat/use-chat-stream.ts`
- attachments logic: `src/workspace-chat/use-chat-attachments.ts`
- chat storage API: `src/lib/chat-library.ts`
- persistence seam: `src/lib/chat-repository.ts`
- local persistence: `src/lib/local-chat-repository.ts`
- runtime/persisted mapping: `src/lib/chat-session-mappers.ts`
- sidebar shell: `src/components/ui/WorkspaceSidebar.tsx`
- settings shell: `src/components/ui/SettingsScreen.tsx`
- repo structure rules: `guidelines/README_UA.md`

## Scope guard

Before editing, define:

- exact user-visible behavior being changed
- exact files that should change
- exact files that should not change

Stop and re-scope if any of these happens:

- the diff starts touching routing, storage, and UI shell even though the task is local
- a leaf UI change starts requiring new persistence helpers inside the component
- a component wants to import from `src/app`
- a new folder category is being introduced just to “organize later”
- the simplest fix requires editing the same giant file again instead of extracting one seam first

## How to detect a future refactor avalanche early

These are early warning signals:

- one file keeps absorbing unrelated state for every new task
- multiple leaf components need the same storage detail
- path strings like `/` or `?chat=` are spreading across many leaves
- chat metadata is duplicated in more than one storage shape
- a new UX action needs edits in sidebar UI, search UI, workspace UI, and storage helpers all at once
- a screen file starts defining its own constants, types, helper components, and side effects in one place
- the “easy” path requires another temporary adapter layer

When 2 or more warning signals appear, do not continue layering fixes.
Extract the smallest missing seam first.

## Daily working rule set

- Prefer extending an existing canonical module over creating a new abstraction.
- Keep `src/app` route-only.
- Keep persistence behind repository/library seams.
- Keep runtime-to-storage transforms in mappers.
- Keep overlay open/close ownership in shell contexts.
- Split large screens into shell + leaf components before adding more side effects.
- If a change feels “small” but requires new storage semantics, treat it as a model change first, not as a UI patch.

## Default workflow for future tasks

1. Read `guidelines/README_UA.md`.
2. Read this file.
3. Inspect the closest reference files in current `main`.
4. Decide the smallest valid write scope.
5. Check whether the task is trying to extend the wrong layer.
6. Only then generate code.
7. Re-read the diff and ask: did this stay inside the intended layer?

## One-sentence reminder

If the UX is growing faster than the data model or module boundaries, stop early and fix the seam before the repo asks for another big refactor.
