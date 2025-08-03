import Database from 'better-sqlite3';

export type DatabaseType = InstanceType<typeof Database>;

export class BotDatabaseManager {
  db: DatabaseType

  constructor() {
    
    // Load (or create) sqlite db
    this.db = new Database('./data/bot-data.db');

  }

  getDatabase() {
    return this.db;
  }

  closeDatabase() {
    this.db.close()
  }

}
