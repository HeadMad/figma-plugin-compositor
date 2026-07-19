/**
 * Утилита-аттачмент Svelte 5 для отслеживания кликов вне элемента.
 * Возвращает функцию-замыкание, которую Svelte автоматически применяет к DOM-узлу.
 * 
 * @param {Function} callback - Функция, вызываемая при клике в любое место снаружи элемента
 * @returns {import('svelte/attachments').Attachment} Каноничный аттачмент Svelte 5
 */
export function clickOutside(callback) {
  return (element) => {
    /**
     * Обработчик клика по документу
     * @param {MouseEvent} event 
     */
    const handleClick = (event) => {
      // Проверяем, что элемент существует, клик был не по нему и событие не отменено
      if (element && !element.contains(event.target) && !event.defaultPrevented) {
        callback();
      }
    };

    // Вешаем перехватывающий слушатель на весь документ iframe плагина
    document.addEventListener('click', handleClick, true);

    // Возвращаем функцию очистки. Svelte 5 автоматически вызовет её 
    // при скрытии/размонтировании элемента из DOM
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  };
}

export default clickOutside;
