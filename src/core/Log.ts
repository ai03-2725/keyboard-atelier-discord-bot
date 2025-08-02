import { envVarManagerInstance } from "..";

export enum LogLevel {
  "DEBUG" = 0,
  "INFO" = 1,
  "WARN" = 2,
  "ERROR" = 3,
  "AUDIT" = 4,
}


const writePrefix = (level: LogLevel) => {
  switch (level) {
    case LogLevel.DEBUG:
      if (!envVarManagerInstance.getLogDebug()) return;
      process.stdout.write(`${new Date().toISOString()} [${LogLevel[level]}] `)  
      break;
    case LogLevel.AUDIT:
      if (envVarManagerInstance.getLogDebug() || envVarManagerInstance.getLogAudit()) {
        process.stdout.write(`${new Date().toISOString()} [${LogLevel[level]}] `)  
      } else {
        return;
      }
      break;
    case LogLevel.INFO:
      process.stdout.write(`${new Date().toISOString()} [${LogLevel[level]}] `)  
      break;
    case LogLevel.WARN:
    case LogLevel.ERROR:
      process.stderr.write(`${new Date().toISOString()} [${LogLevel[level]}] `)
      break;
  } 
}


export const logDebug = (obj: unknown) => {
  if (!envVarManagerInstance.getLogDebug()) return;
  writePrefix(LogLevel.DEBUG)
  console.log(obj)
}

export const logInfo = (obj: unknown) => {
  writePrefix(LogLevel.INFO)
  console.log(obj)
}

export const logWarn = (obj: unknown) => {
  writePrefix(LogLevel.WARN)
  console.error(obj)
}

export const logError = (obj: unknown) => {
  writePrefix(LogLevel.ERROR)
  console.error(obj)
}

export const logAudit = (obj: unknown) => {
  writePrefix(LogLevel.AUDIT)
  console.log(obj)
}