# Changelog: Boot Screen & Boot Error Screen

Документація змін, внесених у компоненти boot screen та boot error screen.

---

## 1. Виправлення анімації Lottie

**Проблема:** Анімація лого на boot та boot-error екранах не відтворювалась коректно (поламалась після коміту з «improve logo quality»).

**Причина:** Використовувались невалідні для lottie-web опції в `rendererSettings` (`hideOnTransparent`, `className`) та складне масштабування (рендер 330px + `transform: scale(0.5)`), що ламало ініціалізацію рендерера.

**Рішення:**

- Повернуто простий варіант Lottie з коміту, коли анімація стабільно працювала.
- У обох компонентах (`boot-screen.tsx`, `boot-error-screen.tsx`): лише `animationData`, `loop={true}`, `autoplay={true}` та `style` з `width: 120px`, `height: 120px`, `maxWidth: 90vw`.
- Прибрано `rendererSettings` та обгортку з масштабуванням.

**Файли:** `src/components/boot-screen.tsx`, `src/components/boot-error-screen.tsx`

---

## 2. Прибрано затримку старту анімації

**Проблема:** На обох екранах анімація починалась з помітною затримкою.

**Причина:** JSON анімації підвантажувався через `fetch('/images/boot-animation.json')` після монтування компонента — спочатку екран без лого, потім приходив відповідь і лише тоді Lottie стартував.

**Рішення:**

- Файл `public/images/boot-animation.json` скопійовано в `src/assets/boot-animation.json`.
- У обох компонентах додано статичний імпорт: `import bootAnimationData from '@/assets/boot-animation.json'`.
- Прибрано `useState` для `animationData` та `useEffect` з fetch.
- Lottie одразу отримує `animationData={bootAnimationData}` — дані в бандлі при збірці, затримки немає.

**Файли:** `src/assets/boot-animation.json` (новий), `src/components/boot-screen.tsx`, `src/components/boot-error-screen.tsx`

---

## 3. Зменшення зернистості фону на малих екранах

**Проблема:** На MacBook та подібних екранах фон виглядав занадто зернистим; на великих екранах — нормально.

**Рішення:**

- Фон винесено в окремий шар у глобальних стилях (клас `.boot-background-layer`).
- Той самий файл фону: `url(/images/boot-background-clean.png)`, `background-size: cover`, `background-position: center`.
- Для екранів шириною ≤1680px застосовано CSS `filter: blur(2px)` — зернистість згладжується.
- Для екранів >1680px blur не застосовується — вигляд без змін.

**Файли:** `src/app/globals.css`, `src/components/boot-screen.tsx`, `src/components/boot-error-screen.tsx`

---

## 4. Виправлення структури фону (фон зламався)

**Проблема:** Після введення окремого шару фону він перестав відображатись.

**Причина:** У `.boot-background-layer` використовувався `z-index: -1` — шар йшов позаду stacking context і міг не малюватись; при `overflow: hidden` обрізання по краях також могло ховати фон.

**Рішення:**

- Фоновий шар: `z-index: 0`, `inset: 0`, `width: 100%`, `height: 100%`.
- Контент (Lottie, текст, кнопки) обгорнуто в обгортку з класом `.boot-screen-content`: `position: relative`, `z-index: 1` — контент завжди поверх шару фону.
- У boot-screen: Lottie всередині `<div className="boot-screen-content" style={{ position: 'absolute', inset: 0, display: 'flex', … }}>`.
- У boot-error-screen: аналогічна обгортка з flex-колонкою для лого та блоку помилки.

**Файли:** `src/app/globals.css`, `src/components/boot-screen.tsx`, `src/components/boot-error-screen.tsx`

---

## 5. Усунення білої лінії по периметру фону

**Проблема:** Після застосування blur по краях з’явилась ледь помітна біла лінія (особливо зверху).

**Причина:** Край розмитого елемента потрапляв у видиму зону — при точно 100% розмірі шару blur створював світлу обводку по контуру.

**Рішення:**

- Фоновий шар розширено за межі контейнера: `left: -3%`, `top: -3%`, `width: 106%`, `height: 106%`.
- Батьківський контейнер має `overflow: hidden` — видима область лишається заповненою фоном, розмитий край виходить за межі і не дає білої лінії.

**Файли:** `src/app/globals.css`

---

## 6. Підбір сили blur

- Спочатку: `blur(0.8px)` — зернистість лишалась помітною.
- Потім: `blur(1.5px)` — краще, але ще зернисто.
- Фінально: `blur(2px)` на екранах ≤1680px — оптимальний баланс між згладжуванням зерна та збереженням чіткості.

**Файли:** `src/app/globals.css`

---

## Підсумок змінених файлів

| Файл                                   | Зміни                                                                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                  | Класи `.boot-background-layer`, `.boot-screen-content`, media query для blur ≤1680px, розширення шару (-3%, 106%)       |
| `src/components/boot-screen.tsx`       | Імпорт анімації з `@/assets/boot-animation.json`, прибрано fetch/useState, простий Lottie, шар фону + обгортка контенту |
| `src/components/boot-error-screen.tsx` | Те саме: імпорт з assets, прибрано fetch/useState, простий Lottie, шар фону + обгортка контенту                         |
| `src/assets/boot-animation.json`       | Копія `public/images/boot-animation.json` для статичного імпорту                                                        |

---

_Дата змін: лютий 2026_
