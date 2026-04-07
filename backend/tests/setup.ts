// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

// Mock environment variables
process.env.MOONSHOT_API_KEY = 'test-api-key';
process.env.GITHUB_TOKEN = 'test-github-token';

// Mock sqlite3
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
  writeFileSync: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(() => '/mock/dir'),
}));

// Mock console to reduce noise but keep errors
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};