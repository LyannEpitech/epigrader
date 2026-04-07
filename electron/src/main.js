const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// Configuration paths
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const dbPath = path.join(userDataPath, 'data');

let mainWindow = null;
let backendProcess = null;

// Ensure directories exist
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Load or create config
function loadConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return {
    moonshotApiKey: '',
    githubToken: '',
    firstRun: true
  };
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Create .env file for backend
function createEnvFile(config) {
  const envContent = `NODE_ENV=production
PORT=0
MOONSHOT_API_KEY=${config.moonshotApiKey || ''}
DB_PATH=${dbPath}
`;
  
  const backendPath = path.join(process.resourcesPath, 'backend');
  fs.writeFileSync(path.join(backendPath, '.env'), envContent);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'EpiGrader',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    titleBarStyle: 'default',
  });

  // Load the app
  const config = loadConfig();
  
  if (config.firstRun || !config.moonshotApiKey) {
    mainWindow.loadFile(path.join(__dirname, 'setup.html'));
  } else {
    startBackend(config);
    mainWindow.loadURL('http://localhost:3002');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend(config) {
  createEnvFile(config);
  
  const backendPath = path.join(process.resourcesPath, 'backend');
  const serverPath = path.join(backendPath, 'dist', 'index.js');
  
  console.log('Starting backend from:', serverPath);
  
  backendProcess = spawn(process.execPath, [serverPath], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ELECTRON_RUN: 'true'
    },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend]: ${data}`);
    // Extract port from output
    const match = data.toString().match(/:(\d+)/);
    if (match && mainWindow) {
      const port = match[1];
      setTimeout(() => {
        mainWindow.loadURL(`http://localhost:${port}`);
      }, 1000);
    }
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error]: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend exited with code ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

// IPC handlers
ipcMain.handle('save-config', (event, config) => {
  const currentConfig = loadConfig();
  const newConfig = { ...currentConfig, ...config, firstRun: false };
  saveConfig(newConfig);
  createEnvFile(newConfig);
  
  // Start backend after config is saved
  startBackend(newConfig);
  
  return true;
});

ipcMain.handle('get-config', () => {
  return loadConfig();
});

ipcMain.handle('check-backend', async () => {
  try {
    const response = await fetch('http://localhost:3002/health');
    return { running: true, ok: response.ok };
  } catch (error) {
    return { running: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});