# ✂️ Truncate long texts by number of lines

## ✨ Features

-   Truncate text by number of lines.
-   Truncate form end, start or middle.
-   Custom ellipsis.

## 🔧 Installation

```bash
npm i -S @konforti/truncate
```

```bash
yarn add @konforti/truncate
```

## ✏️ Usage

```js
import truncate from '@konforti/truncate';

const res = truncate(
    longTextWrapper,
    longText, // default "".
    lines, // default 1.
    truncFrom, // default "end".
    ellipsis, // default "...".
    wrapperOffset // default 5
);
```

## 🔖 Types Definition

```js
function truncate(
    longTextWrapper: HTMLElement,
    longText: string
    lines: number
    truncFrom: 'start' | 'middle' | 'end'
    ellipsis:  string
    wrapperOffset:  number
): {text: string, truncated: boolean} {}
```
