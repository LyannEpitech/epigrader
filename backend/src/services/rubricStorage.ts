import { Criterion } from '../types/rubric.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import type { Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const initDb = async () => {
  if (db) return db;
  
  db = await open({
    filename: './data/epigrader.db',
    driver: sqlite3.Database,
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

export const rubricStorage = {
  saveRubric: async (name: string, criteria: Criterion[]): Promise<string> => {
    const database = await initDb();
    const id = Date.now().toString();
    const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
    
    await database.run(
      'INSERT INTO rubrics (id, name, criteria, totalPoints, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, name, JSON.stringify(criteria), totalPoints, new Date().toISOString()]
    );
    
    return id;
  },

  getAllRubrics: async () => {
    const database = await initDb();
    const rows = await database.all('SELECT * FROM rubrics ORDER BY createdAt DESC');
    return rows.map((row: any) => ({
      ...row,
      criteria: JSON.parse(row.criteria as string),
    }));
  },

  getRubric: async (id: string) => {
    const database = await initDb();
    const row = await database.get('SELECT * FROM rubrics WHERE id = ?', id);
    if (!row) return undefined;
    return {
      ...row,
      criteria: JSON.parse(row.criteria as string),
    };
  },

  deleteRubric: async (id: string): Promise<void> => {
    const database = await initDb();
    await database.run('DELETE FROM rubrics WHERE id = ?', id);
  },
};

export default rubricStorage;