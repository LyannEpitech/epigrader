"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rubricStorage = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
let db = null;
const initDb = async () => {
    if (db)
        return db;
    db = await (0, sqlite_1.open)({
        filename: './data/epigrader.db',
        driver: sqlite3_1.default.Database,
    });
    await db.exec(`
    CREATE TABLE IF NOT EXISTS rubrics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      criteria TEXT NOT NULL,
      totalPoints INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
    return db;
};
exports.rubricStorage = {
    saveRubric: async (name, criteria) => {
        const database = await initDb();
        const id = Date.now().toString();
        const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
        await database.run('INSERT INTO rubrics (id, name, criteria, totalPoints, createdAt) VALUES (?, ?, ?, ?, ?)', [id, name, JSON.stringify(criteria), totalPoints, new Date().toISOString()]);
        return id;
    },
    getAllRubrics: async () => {
        const database = await initDb();
        const rows = await database.all('SELECT * FROM rubrics ORDER BY createdAt DESC');
        return rows.map((row) => ({
            ...row,
            criteria: JSON.parse(row.criteria),
        }));
    },
    getRubric: async (id) => {
        const database = await initDb();
        const row = await database.get('SELECT * FROM rubrics WHERE id = ?', id);
        if (!row)
            return undefined;
        return {
            ...row,
            criteria: JSON.parse(row.criteria),
        };
    },
    deleteRubric: async (id) => {
        const database = await initDb();
        await database.run('DELETE FROM rubrics WHERE id = ?', id);
    },
};
exports.default = exports.rubricStorage;
//# sourceMappingURL=rubricStorage.js.map