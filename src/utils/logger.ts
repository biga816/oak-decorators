// Logger interface
type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
};

// Logger variable, initially null
let logger: Logger | null = null;

// Function to set the logger
export function setLogger(newLogger: Logger): void {
  logger = newLogger;
}

// Proxy handler
const handler: ProxyHandler<{}> = {
  get(_target, prop, _receiver) {
    if (logger && typeof prop === "string" && prop in logger) {
      return (...args: unknown[]) => {
        // Call the corresponding method on the logger if it exists
        (logger as Logger)[prop as keyof Logger](...args);
      };
    }
    // Default behavior for methods not in logger
    return () => {};
  },
};

// Create the Proxy
const defaultExport = new Proxy({}, handler);

export default defaultExport as Logger;
