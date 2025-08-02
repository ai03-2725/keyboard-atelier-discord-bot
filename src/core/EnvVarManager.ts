import dotenv from 'dotenv';

import {
  generateKeySync
} from 'node:crypto'


export class EnvVarManager {

  encryptionKey: Buffer;

  constructor() {
    if (!this.loadEnvVars()) {
      process.exit(1);
    }
    if (!this.sanityCheckEnvVars()) {
      process.exit(1);
    }
    
  }

  loadEnvVars: () => boolean = () => {
    // Load dotenv values
    dotenv.config({ quiet: !this.getLogDebug() });
    // Make sure all necessary vars exist
    if (!process.env.APP_TOKEN) {
      console.error("Error: Missing APP_TOKEN environment variable. \nPlease supply one either via setting the environment variable or in a .env file.");
      return false
    }
    if (!process.env.APPLICATION_ID) {
      console.error("Error: Missing APPLICATION_ID environment variable. \nPlease supply one either via setting the environment variable or in a .env file.");
      return false
    }
    if (!process.env.MENTIONING_ALLOWED_ROLE_IDS) {
      console.error("Missing MENTIONING_ALLOWED_ROLE_IDS environment variable. \nPlease supply one either via setting the environment variable or in a .env file.")
      return false
    }
    if (!process.env.FREELY_PINGABLE_ROLE_IDS) {
      console.error("Missing FREELY_PINGABLE_ROLE_IDS environment variable. \nPlease supply one either via setting the environment variable or in a .env file.")
      return false
    }
    return true
  }

  sanityCheckEnvVars: () => boolean = () => {
    const loggingDebug = process.env.LOG_DEBUG
    if (loggingDebug !== undefined && loggingDebug !== "true" && loggingDebug !== "false") {
      console.error("Environment variable LOG_DEBUG is set to a value other than true or false.")
      return false
    }
    const loggingAudit = process.env.LOG_AUDIT
    if (loggingAudit !== undefined && loggingAudit !== "true" && loggingAudit !== "false") {
      console.error("Environment variable LOG_AUDIT is set to a value other than true or false.")
      return false
    }

    // Sanity check mentioning-allowed IDs
    const mentioningAllowedIds = process.env.MENTIONING_ALLOWED_ROLE_IDS!.split(",")
    for (const id of mentioningAllowedIds) {
      if (!/^[0-9]+$/.test(id)) {
        console.error(
          `MENTIONING_ALLOWED_ROLE_IDS: ID "${id}" does not seem to be a valid ID. 
Please verify the following:

- The MENTIONING_ALLOWED_ROLE_IDS variable is set to either a single Discord role ID or multiple IDs separated by commas.
- If supplying multiple, there should be no commas before the first ID or trailing the last ID.
- If supplying multiple, there should be no spaces, tabs, or other characters - only IDs and commas.`
        )
        return false
      }
    }

    // Sanity check mentioning-allowed IDs
    const freelyPingableIds = process.env.FREELY_PINGABLE_ROLE_IDS!.split(",")
    for (const id of freelyPingableIds) {
      if (!/^[0-9]+$/.test(id)) {
        console.error(
          `FREELY_PINGABLE_ROLE_IDS: ID "${id}" does not seem to be a valid ID. 
Please verify the following:

- The FREELY_PINGABLE_ROLE_IDS variable is set to either a single Discord role ID or multiple IDs separated by commas.
- If supplying multiple, there should be no commas before the first ID or trailing the last ID.
- If supplying multiple, there should be no spaces, tabs, or other characters - only IDs and commas.`
        )
        return false
      }
    }

    return true
  }

  // Getters
  getAppToken = () => {
    return process.env.APP_TOKEN!
  }

  getApplicationId = () => {
    return process.env.APPLICATION_ID!
  }

  getMentioningAllowedRoleIds = () => {
    return process.env.MENTIONING_ALLOWED_ROLE_IDS!.split(",")
  }

  getFreelyPingableRoleIds = () => {
    return process.env.FREELY_PINGABLE_ROLE_IDS!.split(",")
  }

  getLogDebug = () => {
    // Don't log debug unless explicitly specified
    return process.env.LOG_DEBUG === "true"
  }

  getLogAudit = () => {
    // Log audits by default 
    return (process.env.LOG_AUDIT === "true" || process.env.LOG_AUDIT === undefined)
  }

}

