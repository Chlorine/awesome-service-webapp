import {
  format,
  parseISO,
  isSameYear,
  isSameMonth,
  isSameDay,
  getDate,
} from 'date-fns';

import RU from 'date-fns/locale/ru';

export function formatEventDates(eventStart: string, eventEnd: string): string {
  const start = parseISO(eventStart);
  const end = parseISO(eventEnd);

  if (isSameYear(start, end)) {
    if (isSameMonth(start, end)) {
      if (isSameDay(start, end)) {
        return format(start, 'd MMMM yyyy', { locale: RU });
      } else {
        return `${getDate(start)}-${getDate(end)} ${format(end, 'MMMM yyyy', {
          locale: RU,
        })}`;
      }
    } else {
      return `${format(start, 'd MMMM', { locale: RU })} - ${format(
        end,
        'd MMMM yyyy',
        { locale: RU },
      )}`;
    }
  }

  return `${format(start, 'd MMMM yyyy', { locale: RU })} - ${format(
    end,
    'd MMMM yyyy',
    { locale: RU },
  )}`;
}
