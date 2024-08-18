/*
 * if required to use log4j like syntax, can use one of the following modules
 * https://www.npmjs.com/package/log4js
 *
 * https://www.npmjs.com/package/debug
 *
 * https://www.npmjs.com/package/winston
 */

/**
 * log level to set
 */
enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  ERROR = 3,
}

type LogLevelType = keyof typeof LogLevel;
let defaultLogLevel: LogLevelType = "DEBUG";

/**
 *
 * @param id
 * @param logLevel override default loglevel. if baseLogger is provided, default log level will be referenced from baseLogger
 * @param parent1Logger
 * @param parent2Logger
 * @returns
 */
export const getLogger = (id: string, parent1Logger?: LoggerBase | null, parent2Logger?: LoggerBase | null, logLevel?: LogLevelType) => {
  return new LoggerBase(id, logLevel, parent1Logger, parent2Logger);
};

export class LoggerBase {
  public readonly id: string;
  private logLevel: LogLevel;

  constructor(id: string, logLevel?: LogLevelType, baseLogger1?: LoggerBase | null, baseLogger2?: LoggerBase | null) {
    let convertedId = id;
    if (baseLogger1?.id) {
      convertedId = baseLogger1.id + "." + convertedId;
    }

    if (baseLogger2?.id) {
      convertedId = baseLogger2.id + "." + convertedId;
    }

    this.id = convertedId;

    const level = logLevel || baseLogger2?.getLogLevelType() || baseLogger1?.getLogLevelType() || defaultLogLevel;
    this.logLevel = LogLevel[level];
  }

  public getLogLevelType() {
    let level: LogLevelType;
    switch (this.logLevel) {
      case LogLevel.DEBUG:
        level = "DEBUG";
        break;
      case LogLevel.ERROR:
        level = "ERROR";
        break;
      case LogLevel.INFO:
      default:
        level = "INFO";
    }
    return level;
  }

  public debug(...args: any[]) {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.printToConsole("debug", args);
    }
  }

  public info(...args: any[]) {
    if (this.logLevel <= LogLevel.INFO) {
      this.printToConsole("info", args);
    }
  }

  public log(...args: any[]) {
    if (this.logLevel <= LogLevel.INFO) {
      this.printToConsole("log", args);
    }
  }

  public warn(...args: any[]) {
    if (this.logLevel <= LogLevel.ERROR) {
      this.printToConsole("warn", args);
    }
  }

  public error(...args: any[]) {
    if (this.logLevel <= LogLevel.ERROR) {
      this.printToConsole("error", args);
    }
  }

  private printToConsole(ctype: ConsoleLogType, ...args: any[]) {
    const p = [new Date(), this.id, ...args.flatMap((a) => a)];
    consoleprint(ctype, ...p);
  }
}

type ConsoleLogType = "trace" | "debug" | "log" | "error" | "warn" | "info";
const consoleprint = (ctype: ConsoleLogType, ...args: any[]) => {
  const p = args.flatMap((a) => a);

  if (p.length === 0) return;
  if (p.length === 1) console[ctype](p[0]);
  else if (p.length === 2) console[ctype](p[0], p[1]);
  else if (p.length === 3) console[ctype](p[0], p[1], p[2]);
  else if (p.length === 4) console[ctype](p[0], p[1], p[2], p[3]);
  else if (p.length === 5) console[ctype](p[0], p[1], p[2], p[3], p[4]);
  else if (p.length === 6) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5]);
  else if (p.length === 7) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6]);
  else if (p.length === 8) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]);
  else if (p.length === 9) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8]);
  else if (p.length === 10) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9]);
  else if (p.length === 11) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10]);
  else if (p.length === 12) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11]);
  else if (p.length === 13) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12]);
  else if (p.length === 14) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13]);
  else if (p.length === 15) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14]);
  else if (p.length === 16) console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15]);
  else if (p.length === 17)
    console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15], p[16]);
  else if (p.length === 18)
    console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15], p[16], p[17]);
  else if (p.length === 19)
    console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15], p[16], p[17], p[18]);
  else if (p.length === 20)
    console[ctype](p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15], p[16], p[17], p[18], p[19]);
  else
    console[ctype](
      p[0],
      p[1],
      p[2],
      p[3],
      p[4],
      p[5],
      p[6],
      p[7],
      p[8],
      p[9],
      p[10],
      p[11],
      p[12],
      p[13],
      p[14],
      p[15],
      p[16],
      p[17],
      p[18],
      p[19],
      p[20],
      ...p.slice(21)
    );
};
