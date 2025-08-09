import dotenv from 'dotenv';

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
    if (!process.env.HELP_FORUM_IDS) {
      console.error("Missing HELP_FORUM_IDS environment variable. \nPlease supply one either via setting the environment variable or in a .env file.")
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
    const helpForumIds = process.env.HELP_FORUM_IDS!.split(",")
    for (const id of helpForumIds) {
      if (!/^[0-9]+$/.test(id)) {
        console.error(
          `HELP_FORUM_IDS: ID "${id}" does not seem to be a valid ID. 
Please verify the following:

- The HELP_FORUM_IDS variable is set to either a single Discord channel ID or multiple IDs separated by commas.
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

  getHelpForumIds = () => {
    return process.env.HELP_FORUM_IDS!.split(",")
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

