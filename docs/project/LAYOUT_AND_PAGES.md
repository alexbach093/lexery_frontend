# Layout and pages

## Analysis: shared vs unique UI

### Shared (one place: `AppLayout` + `WorkspaceSidebar`)

- **Sidebar (260px):** логотип LEXERY, пошук, «Новий чат», «Проєкти», «Налаштування», «Виникла помилка», «Історія», профіль користувача.
- **Shell:** повноекранний контейнер (100vw × 100vh), зона контенту з `marginLeft: 260px`.

### Unique per route

- **`/boot`:** початковий екран (онбординг). У контентній зоні — `BootScreen` (Lottie). Після завершення — редірект на `/workspace`.
- **`/workspace`:** основний інтерфейс. У контентній зоні — `WorkspaceMain`: привітання, AI space (поле вводу, іконки, прев’ю файлів), кнопка «Поради».

### Базовий layout

Базовий layout — **workspace-стиль:** sidebar зліва + контент по центру.  
`/boot` — лише початковий екран у тому ж shell; `/workspace` — основний робочий інтерфейс.

---

## Shared layout component

- **Файл:** `src/components/layout/AppLayout.tsx`.
- **Містить:** `WorkspaceSidebar` + контентна зона (marginLeft 260px), `children` рендеряться у цій зоні.
- **Підключення:** `/boot` і `/workspace` обидві рендерять `<AppLayout>{content}</AppLayout>`; sidebar і базова розмітка не дублюються.

---

## Перехід boot → workspace

- **`/` (головна):** єдина точка входу. Спочатку показується BootScreen, після завершення анімації в тому ж layout відображається WorkspaceMain (boot → workspace без зміни URL).
- **`/boot`:** окремий маршрут стартового екрану; після `onComplete` редірект на `/workspace`.
- **`/workspace`:** прямий вхід у основний інтерфейс (чати, AI space) без boot.
