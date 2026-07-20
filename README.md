# Compositor — Figma Plugin

Плагин для Figma, который создаёт печатный лист заданных размеров и раскладывает на нём максимальное количество копий шейпа без наложений.

## Возможности

- Создание листа (фрейма) с размерами в мм или px
- Пресеты: A3, A4, A5, A6
- Генерация компонента-шаблона и инстансов на листе
- Сеточная раскладка с настраиваемым зазором и отступом от края
- Выравнивание: по краю, по центру, равномерно (по горизонтали и вертикали)
- Layout Guides — направляющие сетки на фрейме
- Live-превью раскладки в интерфейсе
- Клик по превью циклически переключает режим выравнивания
- Повторная генерация — новый лист смещается вправо без наложения на предыдущий
- Настройки сохраняются в Document storage (привязаны к файлу Figma)

## Установка

1. Клонируйте репозиторий и установите зависимости:

```bash
git clone <url>
cd compositor
pnpm install
```

2. Запустите разработку:

```bash
pnpm run dev
```

3. В Figma: Plugins → Development → Import plugin from manifest → выберите `dist/manifest.json`

## Сборка

```bash
pnpm run build
```

Выход: папка `dist/` с `manifest.json`, `code.js` и `ui.html`.

## Структура проекта

```
src/
├── code/                        # Бэкенд (Figma API)
│   ├── actions/
│   │   ├── createSheet.js       # Создание фрейма-листа
│   │   ├── packShapes.js        # Раскладка шейпов + layout guides
│   │   └── ...
│   ├── utils/
│   │   ├── hexToFigmaRgb.js     # Конвертация HEX → RGB
│   │   └── sendToUi.js          # RPC-мост: обработка сообщений из UI
│   └── main.js                  # Точка входа
│
└── ui/                          # Фронтенд (Svelte 5)
    ├── components/
    │   └── form/
    │       └── InputWithSuffix.svelte  # Универсальный инпут с суффиксом
    ├── pages/
    │   └── CompositorPage.svelte       # Основной интерфейс
    ├── styles/                         # Дизайн-система
    ├── utils/
    │   └── figma.js                    # RPC-мост: Proxy для figma.send()
    ├── settings.svelte.js              # Document storage (настройки)
    └── App.svelte
```

## Архитектура

Проект разделён на две изолированные среды — бэкенд и фронтенд — которые общаются через RPC-мост:

- **UI → Backend**: `figma.send('actionName', params)` → Promise
- **Backend → UI**: `sendToUi('event', data)` → `figma.addEventListener()`

Бэкенд-экшены (`src/code/actions/`):
- Принимают объект параметров
- Возвращают `{ ok: true }` или `{ ok: false, error: '...' }`
- Автоматически регистрируются через barrel-экспорт (имя файла = имя экшена)

## Используемые компоненты

| Компонент | Описание |
|-----------|----------|
| `InputWithSuffix` | Универсальный инпут с суффиксом (мм, px). Пробрасывает все пропсы в `<input>` |
| `Dropdown` | Выпадающий список на базе Popover |
| `Toggle` | Чекбокс-тумблер |
| `Tabs` / `Tab` | Система вкладок |
| `Toast` | Всплывающие уведомления |
| `Modal` | Модальные окна |
| `Popover` | Выпадающие меню |

## Стек

- [Svelte 5](https://svelte.dev/) (runes: `$state`, `$effect`, `$props`, `$bindable`)
- [Vite](https://vitejs.dev/) с `vite-plugin-singlefile`
- [svelte-super](https://github.com/nickolasburr/svelte-super) (Tabs)
- Document storage для сохранения настроек

## Лицензия

MIT
