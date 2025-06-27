class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(...args: any[]) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: any[]) {
    if (this.isDevelopment) {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  debug(...args: any[]) {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();
export default logger; 