import datetime from "date-and-time";

const DEFAULT_FORMAT_PATTERN = "MM-DD-YYYY HH:mm:ss.SSS Z";
export const parseTimestamp = (timestampStr: string, formatPattern?: string | null) => {
  const format = formatPattern || DEFAULT_FORMAT_PATTERN;

  return datetime.parse(timestampStr, format);
};

export const formatTimestamp = (timestamp: Date, formatPattern?: string | null) => {
  const format = formatPattern || DEFAULT_FORMAT_PATTERN;

  return datetime.format(timestamp, format);
};

export const getDate = (date: DateParamType, format?: string) => {
  let dd = new Date();
  if (date instanceof Date) {
    dd = date;
  } else if (typeof date === "string") {
    dd = parseTimestamp(date, format);
  } else if (typeof date === "number") {
    dd = new Date(date);
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
 * @returns subtracted instance
 */
export const subtractDates = (endDate: DateParamType, startDate?: DateParamType, format?: string) => {
  return datetime.subtract(getDate(endDate, format), getDate(startDate, format));
};
