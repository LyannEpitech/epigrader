const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getConfig: () => ipcRenderer.invoke('get-config'),
  
  // Backend
  checkBackend: () => ipcRenderer.invoke('check-backend'),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});