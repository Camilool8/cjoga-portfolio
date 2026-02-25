const isDevelopment = process.env.NODE_ENV !== "production";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
};

const formatObject = (obj) => {
  if (!obj) return "";
  try {
    return JSON.stringify(obj, null, isDevelopment ? 2 : 0);
  } catch (e) {
    return String(obj);
  }
};

const logger = {
  debug: (message, obj) => {
    if (isDevelopment) {
      console.debug(
        `${colors.blue}${formatMessage("debug", message)}${colors.reset}`,
        obj ? formatObject(obj) : ""
      );
    }
  },

  info: (message, obj) => {
    console.info(
      `${colors.green}${formatMessage("info", message)}${colors.reset}`,
      obj ? formatObject(obj) : ""
    );
  },

  warn: (message, obj) => {
    console.warn(
      `${colors.yellow}${formatMessage("warn", message)}${colors.reset}`,
      obj ? formatObject(obj) : ""
    );
  },

  error: (message, obj) => {
    console.error(
      `${colors.red}${formatMessage("error", message)}${colors.reset}`,
      obj ? formatObject(obj) : ""
    );

    if (isDevelopment && obj && obj.stack) {
      console.error(`${colors.red}Stack: ${obj.stack}${colors.reset}`);
    }
  },
};

export default logger;
