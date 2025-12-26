import { format, eachDayOfInterval, parseISO, differenceInDays, isWeekend, isSameDay, startOfMonth, endOfMonth, isWithinInterval, startOfQuarter, endOfQuarter, startOfYear, endOfYear, eachMonthOfInterval, eachQuarterOfInterval } from 'date-fns';
import { Granularity } from './types';

export interface DayColumn {
  date: Date;
  label: string;
  dayOfWeek: string;
  isWeekend: boolean;
  isToday: boolean;
}

export interface MonthColumn {
  date: Date;
  label: string;
  isCurrentMonth: boolean;
}

export interface QuarterColumn {
  date: Date;
  label: string;
  isCurrentQuarter: boolean;
}

export function generateDayColumns(startDate: Date, endDate: Date): DayColumn[] {
  const today = new Date();
  return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
    date,
    label: format(date, 'dd'),
    dayOfWeek: format(date, 'EEE'),
    isWeekend: isWeekend(date),
    isToday: isSameDay(date, today),
  }));
}

export function generateMonthColumns(startDate: Date, endDate: Date): MonthColumn[] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
    date,
    label: format(date, 'MMM'),
    isCurrentMonth: date.getMonth() === currentMonth && date.getFullYear() === currentYear,
  }));
}

export function generateQuarterColumns(startDate: Date, endDate: Date): QuarterColumn[] {
  const today = new Date();
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const currentYear = today.getFullYear();
  
  return eachQuarterOfInterval({ start: startDate, end: endDate }).map(date => ({
    date,
    label: `Q${Math.floor(date.getMonth() / 3) + 1}`,
    isCurrentQuarter: Math.floor(date.getMonth() / 3) === currentQuarter && date.getFullYear() === currentYear,
  }));
}

export function getEventPosition(
  eventStart: string,
  eventEnd: string,
  rangeStart: Date,
  rangeEnd: Date,
  colWidth: number
): { left: number; width: number; visible: boolean } {
  const start = parseISO(eventStart);
  const end = parseISO(eventEnd);

  // Check if event is within visible range
  const eventInRange = isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
                       isWithinInterval(end, { start: rangeStart, end: rangeEnd }) ||
                       (start <= rangeStart && end >= rangeEnd);

  if (!eventInRange) {
    return { left: 0, width: 0, visible: false };
  }

  // Clamp dates to visible range
  const visibleStart = start < rangeStart ? rangeStart : start;
  const visibleEnd = end > rangeEnd ? rangeEnd : end;

  const leftDays = differenceInDays(visibleStart, rangeStart);
  const durationDays = differenceInDays(visibleEnd, visibleStart) + 1;

  return {
    left: leftDays * colWidth,
    width: durationDays * colWidth - 4, // 4px gap
    visible: true,
  };
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getQuarterRange(year: number, quarter: number): { start: Date; end: Date } {
  const date = new Date(year, quarter * 3, 1);
  return {
    start: startOfQuarter(date),
    end: endOfQuarter(date),
  };
}

export function getYearRange(year: number): { start: Date; end: Date } {
  const date = new Date(year, 0, 1);
  return {
    start: startOfYear(date),
    end: endOfYear(date),
  };
}

export function getDateRangeForGranularity(
  currentDate: Date,
  granularity: Granularity
): { start: Date; end: Date; label: string } {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const quarter = Math.floor(month / 3);

  switch (granularity) {
    case 'Day':
    case 'Month':
      return {
        ...getMonthRange(year, month),
        label: format(currentDate, 'MMMM yyyy'),
      };
    case 'Quarter':
      return {
        ...getQuarterRange(year, quarter),
        label: `Q${quarter + 1} ${year}`,
      };
    case 'Year':
      return {
        ...getYearRange(year),
        label: String(year),
      };
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}
