/**
 * Форматирует ISO-строку в локальное время (Новосибирск, UTC+7)
 * @param {string} isoString - дата в формате ISO (например, "2026-08-28T02:00:00.000Z")
 * @param {Object} options - дополнительные опции форматирования
 * @returns {string} отформатированная дата и время
 */
export function formatLocalDateTime(isoString, options = {}) {
  if (!isoString) return '—';

  const date = new Date(isoString);
  
  // Проверка на валидность даты
  if (isNaN(date.getTime())) return '—';

  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Novosibirsk', // явно указываем зону Новосибирска (UTC+7)
  };

  return date.toLocaleString('ru-RU', { ...defaultOptions, ...options });
}

/**
 * Форматирует только дату (без времени)
 */
export function formatLocalDate(isoString, options = {}) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';

  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Novosibirsk',
  };
  return date.toLocaleString('ru-RU', { ...defaultOptions, ...options });
}

/**
 * Форматирует только время
 */
export function formatLocalTime(isoString, options = {}) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';

  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Novosibirsk',
  };
  return date.toLocaleString('ru-RU', { ...defaultOptions, ...options });
}

/**
 * Форматирует дату в формате YYYY-MM-DD в DD.MM.YYYY
 */
export function formatDateOnly(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}.${month}.${year}`;
}