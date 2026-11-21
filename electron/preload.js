const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('luminaAPI', {
  isElectron: true,
  platform: process.platform,

  // File dialogs & I/O
  openFileDialog: () => ipcRenderer.invoke('lumina:open-file'),
  saveFileDialog: (options) => ipcRenderer.invoke('lumina:show-save-dialog', options),
  saveImageFile: (filePath, base64Data) => ipcRenderer.invoke('lumina:save-file', { filePath, base64Data }),
  readImageFile: (filePath) => ipcRenderer.invoke('lumina:read-file', filePath),

  // Recent files
  getRecentFiles: () => ipcRenderer.invoke('lumina:get-recent'),
  addRecentFile: (filePath) => ipcRenderer.invoke('lumina:add-recent', filePath),
  clearRecentFiles: () => ipcRenderer.invoke('lumina:clear-recent'),

  // Dialogs
  showMessageBox: (options) => ipcRenderer.invoke('lumina:show-message-box', options),

  // Window title
  setDocumentTitle: (title) => ipcRenderer.invoke('lumina:set-title', title),

  // Menu IPC bridge
  onMenuAction: (callback) => {
    const handler = (event, action, payload) => callback(action, payload);
    ipcRenderer.on('lumina:menu-action', handler);
    return () => ipcRenderer.removeListener('lumina:menu-action', handler);
  }
});
