import datetime from "date-and-time";
import ms, { StringValue } from "ms";

const DEFAULT_FORMAT_PATTERN = "MM-DD-YYYY HH:mm:ss.SSS Z";
export const parseTimestamp = (timestampStr: string, formatPattern?: string | null) => {
  const format = formatPattern || DEFAULT_FORMAT_PATTERN;

  return datetime.parse(timestampStr, format);
};

export const formatTimestamp = (timestamp: Date, formatPattern?: string | null) => {
  const format = formatPattern || DEFAULT_FORMAT_PATTERN;

  return datetime.format(timestamp, format);
};

export const getDateInstanceDefaultNewDate = (date: DateParamType, format?: string) => {
  const dateInstance = getDateInstance(date, format);
  if (dateInstance) {
    return dateInstance;
  }
  return new Date();
};

export const getDateInstance = (date: DateParamType, format?: string) => {
  let dd: Date | null = new Date();
  if (date instanceof Date) {
    dd = date;
  } else if (typeof date === "string") {
    const parsedDate = parseTimestamp(date, format);
    if (parsedDate.toString() !== new Date(NaN).toString()) {
      dd = parsedDate;
    } else {
      dd = null;
    }
  } else if (typeof date === "number") {
    dd = new Date(date);
  }

  return dd;
};

export const getDateString = (date: DateParamType, format?: string, defaultValue?: string) => {
  let dd = null;
  if (!date && defaultValue) {
    return defaultValue;
  }

  if (date && typeof date === "string") {
    dd = date;
  } else {
    dd = getDateInstance(date);
    if (!dd) {
      dd = defaultValue;
    }
  }

  if (dd instanceof Date) {
    return formatTimestamp(dd, format);
  }

  return dd;
};

type DateParamType = string | null | undefined | number | Date;
/**
 *  Subtracting date2 from date1. date1 - date2
 *
 * @param fromDate if string, will convert to date instance to subtract. if null or undefined, will use current time to subtract
 * @param toDate if string, will convert to date instance to subtract. if null or undefined, will use current time to subtract
 * @param format if not provided, will apply default
 * @returns subtracted instance if provided correct formatted date otherwise null
 */
export const subtractDatesDefaultToZero = (endDate: DateParamType, startDate?: DateParamType, format?: string) => {
  const diff = subtractDates(endDate, startDate, format);
  if (diff) {
    return diff;
  }
  const defaultDiffZero: datetime.SubtractResult = {
    toDays: () => 0,
    toHours: () => 0,
    toMilliseconds: () => 0,
    toMinutes: () => 0,
    toSeconds: () => 0
  };
  return defaultDiffZero;
};
/**
 *  Subtracting date2 from date1. date1 - date2
 *
 * @param fromDate if string, will convert to date instance to subtract. if null or undefined, will use current time to subtract
 * @param toDate if string, will convert to date instance to subtract. if null or undefined, will use current time to subtract
 * @param format if not provided, will apply default
 * @returns subtracted instance if provided correct formatted date otherwise null
 */
export const subtractDates = (endDate: DateParamType, startDate?: DateParamType, format?: string) => {
  const endDateInstance = getDateInstance(endDate, format);
  const startDateInstance = getDateInstance(startDate, format);
  if (endDateInstance && startDateInstance) {
    return datetime.subtract(endDateInstance, startDateInstance);
  }
  return null;
};

export const sleep = (wait: StringValue): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms(wait));
  });
};
