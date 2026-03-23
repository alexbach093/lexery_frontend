# Route / URL Trace Map

Note for discussion only. This document records the verified current route state and the recommended near-term route shape. It is not a routing refactor plan by itself.

## Sources of truth

This note was prepared from:

- current Next app routes
- workspace shell files
- chat orchestration
- sidebar / search / settings shell files

## Current Verified Map

### Product routes that exist now

| Route         | Status     | Purpose                                |
| ------------- | ---------- | -------------------------------------- |
| `/`           | exists now | Current workspace shell entry and home |
| `/boot-error` | exists now | Dev/debug route                        |

`/_not-found` is a framework route and is not treated as a product screen in this map.

### Current non-route UI state

| UI state           | Current shape           | Notes                         |
| ------------------ | ----------------------- | ----------------------------- |
| Open existing chat | `?chat=:chatId`         | Current chat-addressing shape |
| Search             | shell overlay           | Not a route                   |
| Settings           | shell overlay           | Not a route                   |
| Projects           | sidebar affordance only | No actual route yet           |

## Recommended Next Map

This section describes the near-term canonical shape only.

| Route                      | Status      | Purpose                                                                  |
| -------------------------- | ----------- | ------------------------------------------------------------------------ |
| `/`                        | recommended | Entry / boot URL, not the main home for chat state                       |
| `/workspace`               | recommended | Workspace home / new chat                                                |
| `/workspace/chats/:chatId` | recommended | Canonical URL for a concrete chat                                        |
| `/projects`                | recommended | Projects index                                                           |
| `/settings`                | recommended | Settings screen                                                          |
| `/workspace/chats`         | optional    | Dedicated collection route only if history/search becomes its own screen |

## Naming Recommendation

- Use `chats`, not `conversation`.
- Use plural names for collection routes.
- Use singular names for singleton areas such as `settings`.
- Do not keep query-param chat addressing as the canonical URL shape.
- Do not use `workspace/conversation/:id`.
- Do not use `workspace/:chatId`.

Recommended doc-level labels:

| Label                   | Route                      |
| ----------------------- | -------------------------- |
| `workspace.home`        | `/workspace`               |
| `workspace.chat.detail` | `/workspace/chats/:chatId` |
| `projects.index`        | `/projects`                |
| `settings.root`         | `/settings`                |

## Trace Mapping

| Screen / intent              | Current URL shape | Current owner                                   | Recommended canonical URL            | Notes / conflict                                                  |
| ---------------------------- | ----------------- | ----------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Workspace landing / new chat | `/`               | workspace shell + page                          | `/workspace`                         | Root is currently overloaded                                      |
| Open existing chat           | `/?chat=:chatId`  | workspace chat hook + search/sidebar navigation | `/workspace/chats/:chatId`           | Cleaner deep-linking and less shell ambiguity                     |
| Open settings                | overlay only      | shell overlay state                             | `/settings`                          | Route can replace ad hoc overlay ownership                        |
| Open projects                | no route yet      | sidebar affordance only                         | `/projects`                          | UI expectation exists before route exists                         |
| Search chats                 | overlay only      | shell overlay state                             | overlay or future `/workspace/chats` | Keep overlay until a dedicated search/history screen is justified |

## Conflicts / Ambiguity To Watch

- Some documentation still talks about `/workspace` and `/boot`, but the verified build currently shows `/` and `/boot-error`.
- `"/"` and `"?chat="` are already spread across multiple shell and leaf files.
- Settings and search are currently route-less overlays, so future route-based navigation must be handled at the shell seam, not with scattered `router.push` patches.
- If both `/?chat=...` and `/workspace/chats/:chatId` are treated as equal canonical URLs, linking and ownership will become ambiguous.
