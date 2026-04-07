// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

// Mock environment variables
process.env.MOONSHOT_API_KEY = 'test-api-key';
process.env.GITHUB_TOKEN = 'test-github-token';

// Mock sqlite
jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => ({
    run: jest.fn((sql, params, callback) => callback && callback(null)),
    get: jest.fn((sql, params, callback) => callback && callback(null, null)),
    all: jest.fn((sql, params, callback) => callback && callback(null, [])),
    close: jest.fn((callback) => callback && callback(null)),
  })),
  verbose: jest.fn(),
}));

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(''),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};