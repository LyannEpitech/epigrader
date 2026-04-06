import { Criterion } from '../types/rubric.js';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const RUBRICS_FILE = path.join(DATA_DIR, 'rubrics.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load existing rubrics from file
const loadRubrics = (): Map<string, any> => {
  try {
    if (fs.existsSync(RUBRICS_FILE)) {
      const data = fs.readFileSync(RUBRICS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error('Failed to load rubrics:', error);
  }
  return new Map();
};

// Save rubrics to file
const saveRubrics = (rubrics: Map<string, any>) => {
  try {
    const data = Object.fromEntries(rubrics);
    fs.writeFileSync(RUBRICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save rubrics:', error);
  }
};

// In-memory storage with file persistence
const rubrics = loadRubrics();

export const rubricStorage = {
  saveRubric: (name: string, criteria: Criterion[]): string => {
    const id = Date.now().toString();
    const rubric = {
      id,
      name,
      criteria,
      totalPoints: criteria.reduce((sum, c) => sum + c.maxPoints, 0),
      createdAt: new Date().toISOString(),
    };
    rubrics.set(id, rubric);
    saveRubrics(rubrics);
    return id;
  },

  getAllRubrics: () => {
    return Array.from(rubrics.values());
  },

  getRubric: (id: string) => {
    return rubrics.get(id);
  },

  deleteRubric: (id: string): void => {
    rubrics.delete(id);
    saveRubrics(rubrics);
  },
};

export default rubricStorage;