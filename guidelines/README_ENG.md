# AI Coding Guidelines & Best Practices

## Overview

This document outlines the strict coding standards and architectural rules for AI agents and developers working on this Next.js project. The primary goal is to generate professional, human-readable, and highly structured code.

**Core Principle:** Code has two main criteria: **Functionality** and **Structure**. If the code works but is poorly structured, it is considered incomplete, bad, and unacceptable.

## 1. Routing & `src/app` Directory

- **Clean Routing:** The `src/app` directory is strictly for routing.
- **No Unnecessary Files:** Place ONLY pages and Next.js auxiliary files (like `layout.tsx`, `loading.tsx`, `error.tsx`) here.
- Do not place standard UI components, hooks, or utilities in the `src/app` folder.

## 2. Components (`src/components`)

- **Location:** All components must reside in `src/components`.
- **Grouping:** Group components into logical subdirectories based on their feature or context (e.g., `src/components/chat`). If a suitable directory does not exist, create one.
- **Naming Convention:** Component files must be named using **CamelCase / PascalCase** (e.g., `ChatBubble.tsx`, `UserProfile.tsx`).

## 3. Icons (`src/components/icons`)

- **Extraction:** Do not use inline SVGs directly inside pages or standard components.
- **Component Format:** All icons must be extracted and created as standalone React components inside `src/components/icons`.
- **Naming Convention:** Icon files must be named using **kebab-case** (e.g., `arrow-right-icon.tsx`, `user-avatar-icontsx`).
- **Grouping:** You may place icons directly in `src/components/icons` or group them into subdirectories if needed.

## 4. TypeScript & Typing

- **Props Types:** Types or Interfaces for component props can remain in the same file as the component.
- **Global/Shared Types:** All other TypeScript types, interfaces, and shared data models must be exported and placed in `src/types/index.ts`.

## 5. Styling

- **Tailwind CSS Only:** Use Tailwind CSS utility classes for all styling.
- **No Inline Styles:** Avoid the `style={{}}` attribute. Inline styles are strictly forbidden unless it is dynamically calculated using JavaScript and there is absolutely no way to achieve the result with Tailwind.

## 6. Code Quality & Constraints

- **File Size Limit:** A single generated file **MUST NOT exceed 1000 lines of code**. If a file gets too large, split the logic into smaller, reusable components or utility files.
- **Readability is King:** Prioritize readability, compactness, and human comprehension over tricky or "clever" machine-like code. The code must be easily readable by human developers.
- **Avoid Anti-patterns:** Strictly avoid known React and Next.js structural anti-patterns (e.g., prop drilling when context is better, huge monolithic components, leaking memory in effects).

## 7. Working with Legacy Code

- **Do Not Touch Unrelated Code:** The project's current file structure might not be perfect yet. When working on a new feature or branch, **DO NOT refactor or change existing files** unless it is absolutely critical for the new functionality.
- **Apply to New Code:** Apply all the rules above strictly to **newly generated code**.
