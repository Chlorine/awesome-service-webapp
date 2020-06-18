import { format, parseISO } from 'date-fns';
import RU from 'date-fns/locale/ru';

export class DateUtils {
  static format(isoDate: string, fmt: string) {
    return format(parseISO(isoDate), fmt, {
      locale: RU,
    });
  }
}
