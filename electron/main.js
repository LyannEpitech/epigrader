const { app, BrowserWindow, ipcMain, dialog, shell, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// Configuration paths
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const dbPath = path.join(userDataPath, 'data');

let mainWindow = null;
let setupWindow = null;
let backendProcess = null;
let backendPort = null;

// Ensure directories exist
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Load or create config
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return {
    moonshotApiKey: '',
    githubToken: '',
    firstRun: true
  };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error('Error saving config:', e);
    return false;
  }
}

// Create .env file for backend
function createEnvFile(config) {
  const isDev = !app.isPackaged;
  let backendPath;
  
  if (isDev) {
    backendPath = path.join(__dirname, '..', '..', 'backend');
  } else {
    // In production, backend is in extraResources
    backendPath = path.join(process.resourcesPath, 'backend');
  }
  
  const envContent = `NODE_ENV=production
PORT=0
MOONSHOT_API_KEY=${config.moonshotApiKey || ''}
GITHUB_TOKEN=${config.githubToken || ''}
DB_PATH=${dbPath}
`;
  
  fs.writeFileSync(path.join(backendPath, '.env'), envContent);
  return backendPath;
}

function createSetupWindow() {
  setupWindow = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    title: 'EpiGrader - Configuration',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    center: true,
  });

  setupWindow.loadFile(path.join(__dirname, 'setup.html'));

  setupWindow.once('ready-to-show', () => {
    setupWindow.show();
  });

  setupWindow.on('closed', () => {
    setupWindow = null;
    if (!mainWindow) {
      app.quit();
    }
  });
}

function createMainWindow() {
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

  // Show loading screen first
  mainWindow.loadFile(path.join(__dirname, 'loading.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools with F12 in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Toggle DevTools with F12
  globalShortcut.register('F12', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend(config) {
  const backendPath = createEnvFile(config);
  const serverPath = path.join(backendPath, 'dist', 'index.js');
  
  console.log('Starting backend from:', serverPath);
  
  // Check if node.exe exists in packaged app
  let nodeExecutable = 'node';
  
  // On Windows, check for packaged node
  if (process.platform === 'win32') {
    const packagedNode = path.join(process.resourcesPath, 'node', 'node.exe');
    if (fs.existsSync(packagedNode)) {
      nodeExecutable = packagedNode;
    }
  }
  
  backendProcess = spawn(nodeExecutable, [serverPath], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ELECTRON_RUN: 'true'
    },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Backend]: ${output}`);
    
    // Extract port from output
    const match = output.match(/:(\d+)/);
    if (match && !backendPort) {
      backendPort = match[1];
      console.log(`Backend running on port ${backendPort}`);
      
      // Load the app
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.loadURL(`http://localhost:${backendPort}`);
        }
      }, 1000);
    }
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error]: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend exited with code ${code}`);
    backendProcess = null;
    backendPort = null;
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// IPC handlers
ipcMain.handle('save-config', (event, config) => {
  const currentConfig = loadConfig();
  const newConfig = { ...currentConfig, ...config, firstRun: false };
  
  if (saveConfig(newConfig)) {
    // Close setup window and open main window
    if (setupWindow) {
      setupWindow.close();
    }
    
    createMainWindow();
    startBackend(newConfig);
    
    return { success: true };
  }
  
  return { success: false, error: 'Failed to save configuration' };
});

ipcMain.handle('get-config', () => {
  return loadConfig();
});

ipcMain.handle('check-backend', async () => {
  if (!backendPort) {
    return { running: false };
  }
  
  try {
    const response = await fetch(`http://localhost:${backendPort}/health`);
    return { running: true, ok: response.ok, port: backendPort };
  } catch (error) {
    return { running: false, error: error.message };
  }
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

// App lifecycle
app.whenReady().then(() => {
  const config = loadConfig();
  
  if (config.firstRun || !config.moonshotApiKey) {
    createSetupWindow();
  } else {
    createMainWindow();
    startBackend(config);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const config = loadConfig();
      if (config.firstRun || !config.moonshotApiKey) {
        createSetupWindow();
      } else {
        createMainWindow();
      }
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

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});