const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getConfig: () => ipcRenderer.invoke('get-config'),
  
  // Backend
  checkBackend: () => ipcRenderer.invoke('check-backend'),
  
  // Dialog
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
});

// Expose app version
contextBridge.exposeInMainWorld('appVersion', {
  version: process.env.npm_package_version || '1.0.0',
});