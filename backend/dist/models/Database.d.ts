import * as sqlite3 from 'sqlite3';
declare class Database {
    private db;
    constructor(dbPath?: string);
    private init;
    getDatabase(): sqlite3.Database;
    close(): Promise<void>;
}
export default Database;
//# sourceMappingURL=Database.d.ts.map