import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek,
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays, 
  subWeeks, 
  subMonths,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  differenceInDays,
  parseISO
} from 'date-fns';
import type { DateRange } from '@/types';

/**
 * Format date for display
 * @param date - Date to format
 * @param formatStr - Format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

/**
 * Format date with time
 * @param date - Date to format
 * @returns Formatted date-time string
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm');
};

/**
 * Format time only
 * @param date - Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

/**
 * Get relative date string (Today, Yesterday, etc.)
 * @param date - Date to check
 * @returns Relative date string
 */
export const getRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return format(d, 'EEEE'); // Day name
  if (isThisMonth(d)) return format(d, 'dd MMM');
  if (isThisYear(d)) return format(d, 'dd MMM');
  return format(d, 'dd/MM/yyyy');
};

/**
 * Get predefined date ranges for reports
 * @returns Array of date range options
 */
export const getDateRanges = (): DateRange[] => {
  const today = new Date();
  
  return [
    {
      label: 'Today',
      startDate: startOfDay(today),
      endDate: endOfDay(today),
    },
    {
      label: '3 Days',
      startDate: startOfDay(subDays(today, 2)),
      endDate: endOfDay(today),
    },
    {
      label: 'Week',
      startDate: startOfWeek(today, { weekStartsOn: 1 }),
      endDate: endOfWeek(today, { weekStartsOn: 1 }),
    },
    {
      label: '2 Weeks',
      startDate: startOfDay(subWeeks(today, 2)),
      endDate: endOfDay(today),
    },
    {
      label: '3 Weeks',
      startDate: startOfDay(subWeeks(today, 3)),
      endDate: endOfDay(today),
    },
    {
      label: 'Month',
      startDate: startOfMonth(today),
      endDate: endOfMonth(today),
    },
    {
      label: 'Previous Month',
      startDate: startOfMonth(subMonths(today, 1)),
      endDate: endOfMonth(subMonths(today, 1)),
    },
    {
      label: '2 Months',
      startDate: startOfMonth(subMonths(today, 1)),
      endDate: endOfDay(today),
    },
    {
      label: '3 Months',
      startDate: startOfMonth(subMonths(today, 2)),
      endDate: endOfDay(today),
    },
    {
      label: '6 Months',
      startDate: startOfMonth(subMonths(today, 5)),
      endDate: endOfDay(today),
    },
    {
      label: '1 Year',
      startDate: startOfYear(today),
      endDate: endOfYear(today),
    },
  ];
};

/**
 * Get today's date range
 * @returns Date range for today
 */
export const getTodayRange = (): DateRange => ({
  label: 'Today',
  startDate: startOfDay(new Date()),
  endDate: endOfDay(new Date()),
});

/**
 * Get this month's date range
 * @returns Date range for current month
 */
export const getThisMonthRange = (): DateRange => ({
  label: 'This Month',
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
});

/**
 * Check if a date falls within a date range
 * @param date - Date to check
 * @param range - Date range
 * @returns Whether date is in range
 */
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.startDate && date <= range.endDate;
};

/**
 * Get the number of days in a date range
 * @param range - Date range
 * @returns Number of days
 */
export const getDaysInRange = (range: DateRange): number => {
  return differenceInDays(range.endDate, range.startDate) + 1;
};

/**
 * Format date range for display
 * @param range - Date range
 * @returns Formatted range string
 */
export const formatDateRange = (range: DateRange): string => {
  const start = format(range.startDate, 'dd MMM yyyy');
  const end = format(range.endDate, 'dd MMM yyyy');
  return `${start} - ${end}`;
};

/**
 * Get dates between two dates for charting
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of date strings
 */
export const getDatesBetween = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

/**
 * Parse a date string to Date object safely
 * @param dateStr - Date string
 * @returns Date object or null
 */
export const parseDate = (dateStr: string): Date | null => {
  try {
    const date = parseISO(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};
