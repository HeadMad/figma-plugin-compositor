## 🚀 Figma Plugin Svelte 5 Template

Добро пожаловать в высокопроизводительный, модульный и ультралегкий каркас для промышленной разработки плагинов Figma.
В основе архитектуры шаблона лежат принципы атомарности (Control-Only компоненты), декларативного управления и двустороннего асинхронного RPC-моста данных на базе JS Proxy и Svelte 5 Runes.

------------------------------

## 📁 Структура папок

Проект разделен на две независимые изолированные среды выполнения: бэкенд (песочница Figma API) и фронтенд (веб-интерфейс Svelte 5 внутри iframe).

```txt
src/
├── code/                         # 🛠️ ПЕСОЧНИЦА FIGMA API (Бэкенд)
│   ├── actions/                  # Атомарные экшены (один файл — один экшен)
│   │   ├── clearLayers.js        # Пример: Очистка выделенных слоев
│   │   ├── createShape.js        # Пример: Создание фигур
│   │   ├── manageStorage.js      # Единый экшен постоянной памяти Figma
│   │   └── resize.js             # Экшен изменения размеров окна
│   └── main.js                   # Точка входа бэкенда (инициализация)
│
└── ui/                           # 🎨 ВЕБ-ИНТЕРФЕЙС SVELTE 5 (Фронтенд)
    ├── components/               # Библиотека Control-Only компонентов
    │   ├── feedback/
    │   │   └── Toast.svelte      # Функциональные уведомления
    │   ├── form/
    │   │   ├── NumberInput.svelte# Счетчик инкремента/декремента (+/−)
    │   │   └── Toggle.svelte     # Минималистичный тумблер
    │   ├── layout/
    │   │   └── Tabs.svelte       # Диспетчер вкладок (на базе svelte-super)
    │   └── overlay/
    │       └── Modal.svelte      # Всеядная функциональная модалка
    ├── pages/                    # Страницы (экраны) плагина для табов
    │   ├── ShapesPage.svelte     # Пример: Экран создания геометрии
    │   └── OverlaysPage.svelte   # Пример: Экран тостов и модалок
    ├── styles/                   # Дизайн-система и сетка (.form-panel)
    │   ├── variables.css         # Нативные CSS-переменные темы Figma
    │   ├── inputs.css            # Авто-выравнивание форм по тегам
    │   └── global.css            # Сброс стилей, холст (html, body)
    ├── utils/                    # Вспомогательные утилиты интерфейса
    │   ├── autoresize.js         # Авто-подгонка iframe под высоту Svelte
    │   ├── clickOutside.js       # Сниппет-аттачмент Svelte 5 для клика мимо
    │   └── figma.js              # Реактивный Proxy-мост связи с Figma
    ├── settings.svelte.js        # Постоянный стор (figma.clientStorage)
    ├── session.svelte.js         # Сессионный стор (In-Memory Cache)
    └── App.svelte                # Корневой диспетчер (роутер) UI
```

⚠️ Автоматизация сборки: В проекте настроен pre-build скрипт, который автоматически генерирует реэкспорты (index.js) для папок src/code/actions/, src/code/utils/ и src/ui/utils/. Любой файл, добавляемый в эти директории, обязан иметь имя, точно совпадающее с именем экспортируемой по дефолту (export default) функции или переменной.

------------------------------

## 🔌 Документация и Примеры API figma
Все взаимодействия интерфейса с Figma холстом и памятью инкапсулированы в объекте figma и импортируются строго именованным образом:

import { figma } from './utils/index.js';

## 1. Асинхронные RPC-запросы (figma.send)

Отправляет команду на бэкенд и возвращает Promise с ответом. Избавляет от написания "зеркальных" сообщений. Любой экшен бэкенда обязан возвращать объект с флагом ok: true или ok: false.

## Пример вызова на фронтенде (src/ui/pages/ToolsPage.svelte):
```js
async function deleteSelectedElements() {
  // Асинхронно шлем команду на бэкенд
  const response = await figma.send('clearLayers');

  if (response && response.ok) {
    showToast('Слои успешно удалены', 'success');
  } else {
    showToast(response?.error || 'Выделите слои на холсте', 'info');
  }
}
```

## Пример обработчика на бэкенде (src/code/actions/clearLayers.js):

```js
export default function clearLayers() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    return { ok: false, error: 'Массив выделения пуст' };
  }

  try {
    for (const node of selection) {
      if (!node.removed) node.remove();
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
```

## 2. Стрим фоновых событий холста (figma.addEventListener)

Позволяет интерфейсу Svelte слушать нативные изменения в Figma (клики пользователя по слоям, смену страниц макета). Функция возвращает метод автоматической отписки для предотвращения утечек памяти.

## Пример использования в компоненте:

```svelte
<script>
  import { figma } from '../utils/index.js';

  let selectedCount = $state(0);

  $effect(() => {
    // Подписываемся на стрим изменения выделения в Figma
    const removeSelectionListener = figma.addEventListener('selectionchange', (data) => {
      if (data && typeof data.count === 'number') {
        selectedCount = data.count; // Реактивно обновляем счетчик в UI
      }
    });

    // Svelte 5 автоматически вызовет это при размонтировании экрана
    return () => removeSelectionListener();
  });
</script>

<header>Выбрано элементов на холсте: {selectedCount}</header>
```

Для принудительного тотального сброса всех фоновых подписок (например, при выходе из плагина) используется метод: `figma.removeEventListeners();`.

------------------------------

## 💾 Управление реактивной памятью (Сторы)
В шаблоне реализована двухуровневая система памяти на базе JS Proxy [2.1]. Сторы создаются строго в файлах с расширением .svelte.js (требование компилятора Svelte 5 для руны $state).
Передача реактивного $state(defaults) в Proxy-мост обеспечивает глобальную сквозную реактивность между любыми независимыми экранами и вкладками, а дефолтные значения автоматически заменяются сохраненным кэшем при старте плагина.

## 1. Постоянная память (figma.getClientStorage)

Помнит настройки пользователя (пресеты цвета, включенные тумблеры) между закрытием и повторным открытием плагина во всех файлах на данном ПК. Вся синхронизация с постоянной памятью Figma API ведется через единый фоновый бэкенд-экшен manageStorage.

## Шаг А: Создание стора настроек (src/ui/settings.svelte.js):

```js
import { figma } from './utils/index.js';
// Задаем базовый реактивный стейт с дефолтными значениямиconst data = $state({
  count: 1,
  rectColor: '#0C8CE9',
  showAdvancedSettings: false
});
// Оборачиваем в Proxy клиентской памяти. При старте figma сама подставит кэшconst settings = figma.getClientStorage('plugin-persistent-config', data);
export default settings;
```

## Шаг Б: Двустороннее связывание инпутов на странице:

Вам больше не нужны блоки $effect для загрузки и автосохранения. Вы привязываете нативные теги напрямую к переменным стора. Изменили значение — Proxy-перехватчик сам мгновенно отправил слепок в память Figma:

```svelte
  import settings from '../settings.svelte.js'; // Импортируем наш сквозной стор
  import { Toggle, NumberInput } from '../components/index.js';
</script>

<div class="form-panel">
  <label>
    <span>Дополнительные настройки:</span>
    <Toggle bind:checked={settings.showAdvancedSettings} />
  </label>

  {#if settings.showAdvancedSettings}
    <label>
      <span>Количество фигур:</span>
      <NumberInput bind:value={settings.count} min={1} max={20} />
    </label>

    <label>
      <span>Цвет заливки:</span>
      <input type="color" bind:value={settings.rectColor} />
    </label>
  {/if}
</div>
```

## 2. Сессионная память (figma.getSessionStorage)

Идеальна для сохранения состояния между вкладками плагина (введенный временный текст, индекс текущего таба).

⚠️ Безопасность среды Figma: Из-за ограничений безопасности Chromium, Figma запускает iframe плагинов на базе инлайновых data: URL-адресов. Использование нативных window.sessionStorage и window.localStorage заблокировано на уровне ядра браузера и вызывает ошибку SecurityError.

Метод `figma.getSessionStorage` полностью решает эту проблему: под капотом он использует изолированный In-Memory Cache Map [2.1]. Данные живут в оперативной памяти Proxy-замыкания всё время, пока открыт плагин, но автоматически бесследно стираются при его закрытии, не засоряя кэш Figma [2.1].
## Создание сессионного кэша (src/ui/session.svelte.js):

```js
import { figma } from './utils/index.js';
const data = $state({
  currentTab: 'Фигуры',
  layerName: 'New Asset'
});
const session = figma.getSessionStorage('plugin-session-cache', data);export default session;
```

## 3. Облачная память макета (figma.getDocumentStorage)

Работает идентично `getClientStorage`, но записывает сериализованный JSON-слепок данных напрямую внутрь внутренностей самого файла Figma (figma.root.setPluginData). Данные синхронизируются через облако Figma и летают за пользователем между устройствами (с iMac на MacBook), но привязаны строго к этому конкретному файлу проекта.

------------------------------

## 🎨 Гайдлайны Дизайн-системы и Форм (inputs.css)
Шаблон предоставляет готовую пиксель-перфект сетку элементов управления Figma. Верстальщику страниц больше не нужно писать CSS-стили для полей ввода — достаточно обернуть блок в класс .form-panel и использовать стандартные семантические теги.

* Горизонтальная строка (по умолчанию): Любой текст внутри `<span>` автоматически улетает влево, а любой атомарный Control-Only компонент (`<Toggle />`, `<NumberInput />`, нативный инпут цвета) прижимается ровно к правому краю строки с нативной высотой 28px.
```svelte
<div class="form-panel">
  <label>
    <span>Цвет заливки элемента:</span>
    <input type="color" bind:value={settings.rectColor} />
  </label>
</div>
```

* Вертикальная строка (`.form-panel__vertical`): Применяется для текстовых полей. Текст лейбла встает наверх с аккуратным зазором 4px, а само поле ввода падает вниз и растягивается на 100% ширины окна плагина.

```svelte
<div class="form-panel">
  <label class="form-panel__vertical">
    <span>Название создаваемого слоя в Figma:</span>
    <input type="text" placeholder="Введите имя..." bind:value={session.layerName} />
  </label>
</div>
```

------------------------------

## 💬 Функциональные Оверлеи и Уведомления

Всплывающие окна (модалки) и уведомления избавлены от громоздких декларативных оберток в HTML-разметке экрана и вызываются одной строчкой JavaScript-кода из любой функции. Провайдеры `<Toast />` и `<Modal />` просто монтируются один раз в корне приложения App.svelte.

## 1. Функциональные тосты (showToast)
Появляются поверх контента, поддерживают три типа модификаторов внешнего вида (info, success, error), имеют встроенную кнопку-крестик принудительного закрытия и принимают кастомное время показа в миллисекундах (по умолчанию 3000мс).

```js
import { showToast } from '../components/index.js';
function handleSave() {
  // Вызов успешного тоста на 5 секунд
  showToast('Изменения успешно применены! 🎉', 'success', 5000);
}
```

## 2. Всеядные модальные окна (showModal)
Полностью блокируют интерфейс плагина темным бэкдропом и умеют динамически рендерить внутри себя три типа контента на основе переданной конфигурации:

```js
import { showModal } from '../components/index.js';import MyCustomForm from './MyCustomForm.svelte'; // Сторонний файл компонента
function triggerAlert() {
  showModal({
    title: 'Удалить элементы?',
    // Вариант А: Рендерим обычную строку текста (Alert Dialog)
    description: 'Это действие безвозвратно сотрет выбранную графику.',
    
    // Вариант Б: Или передаем ссылку на локальный сниппет Svelte 5
    // snippet: myLocalFormSnippet,
    
    // Вариант В: Или передаем полноценный тяжелый изолированный компонент
    // component: MyCustomForm,
    // componentProps: { userId: 42 },

    buttons: [
      {
        label: 'Да, удалить',
        variant: 'destructive',
        // Каждый клик пробрасывает метод close, позволяя кнопке самой закрывать модалку при успехе
        onClick: async (close) => {
          await figma.send('clearLayers');
          close(); // Схлопываем окно
        }
      },
      {
        label: 'Отмена',
        variant: 'secondary',
        onClick: (close) => close()
      }
    ]
  });
}
```

## 3. Поповеры и Сниппет-Аттачмент {@attach clickOutside}
Компонент поповера (Popover.svelte) оборачивает в себя любую кнопку и использует передовую фабрику-аттачмент Svelte 5. Меню выбора вариантов имеет компактный фиксированный размер, нативную глубокую тень Figma и автоматически бесследно схлопывается при клике в любое пустое пространство плагина.

```svelte
<script>
  import { Popover, showToast } from '../components/index.js';
</script>

<Popover>
  <!-- Блок children: Сюда вставляется сама кнопка-триггер -->
  <button class="secondary">Выбрать режим ▾</button>
  
  <!-- Сниппет content: Сюда вставляется выпадающий нативный список опций -->
  {#snippet content({ close })}
    <button class="menu-item" onclick={() => { showToast('Режим А'); close(); }}>⚡ Быстрый режим</button>
    <button class="menu-item" onclick={() => { showToast('Режим Б'); close(); }}>🎯 Точный режим</button>
  {/snippet}
</Popover>
```

------------------------------

## 🏃‍♂️ Быстрый старт для разработки

   1. Установите зависимости проекта:
   
   npm install
   
   2. Запустите локальный сервер разработки с автоматической генерацией реэкспорт-индексов:
   
   npm run dev
   
   3. Откройте настольное приложение Figma, перейдите в меню Plugins -> Development -> Import plugin from manifest... и выберите сгенерированный файл manifest.json из папки сборки проекта (`/dist`).
