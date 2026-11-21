const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { createApplicationMenu } = require('./menu');

let mainWindow = null;

// Paths & config
const recentFilesPath = path.join(app.getPath('userData'), 'lumina_recent_files.json');

function loadRecentFiles() {
  try {
    if (fs.existsSync(recentFilesPath)) {
      const data = fs.readFileSync(recentFilesPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read recent files:', err);
  }
  return [];
}

function saveRecentFiles(list) {
  try {
    fs.writeFileSync(recentFilesPath, JSON.stringify(list.slice(0, 15), null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save recent files:', err);
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.bmp': return 'image/bmp';
    default: return 'application/octet-stream';
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#18191c',
    title: 'LUMINA — Professional Photo Editor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false
    }
  });

  createApplicationMenu(mainWindow);

  const startUrl = process.env.ELECTRON_START_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null);

  if (startUrl) {
    mainWindow.loadURL(startUrl);
  } else {
    const indexPath = path.join(__dirname, '../frontend/build/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL('http://localhost:3000');
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('lumina:open-file', async () => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Image — LUMINA',
    properties: ['openFile'],
    filters: [
      { name: 'Supported Images (*.png, *.jpg, *.jpeg, *.webp)', extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp'] },
      { name: 'PNG Image (*.png)', extensions: ['png'] },
      { name: 'JPEG Image (*.jpg, *.jpeg)', extensions: ['jpg', 'jpeg'] },
      { name: 'WebP Image (*.webp)', extensions: ['webp'] },
      { name: 'All Files (*.*)', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const mime = getMimeType(filePath);
    const dataUrl = `data:${mime};base64,${fileBuffer.toString('base64')}`;
    const stats = fs.statSync(filePath);

    // Save to recents
    let recents = loadRecentFiles().filter(item => item.path !== filePath);
    recents.unshift({
      path: filePath,
      name: path.basename(filePath),
      lastOpened: Date.now()
    });
    saveRecentFiles(recents);

    return {
      canceled: false,
      filePath,
      fileName: path.basename(filePath),
      dataUrl,
      size: stats.size
    };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});

ipcMain.handle('lumina:show-save-dialog', async (event, options = {}) => {
  if (!mainWindow) return { canceled: true };
  const ext = options.defaultExtension || 'png';
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Export Image — LUMINA',
    defaultPath: options.defaultPath || `lumina-export.${ext}`,
    filters: [
      { name: 'PNG Image (*.png)', extensions: ['png'] },
      { name: 'JPEG Image (*.jpg, *.jpeg)', extensions: ['jpg', 'jpeg'] },
      { name: 'WebP Image (*.webp)', extensions: ['webp'] }
    ]
  });
  return result;
});

ipcMain.handle('lumina:save-file', async (event, { filePath, base64Data }) => {
  try {
    // Strip data url prefix if present
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('lumina:read-file', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { error: 'File does not exist' };
    }
    const buffer = fs.readFileSync(filePath);
    const mime = getMimeType(filePath);
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    const stats = fs.statSync(filePath);
    return {
      filePath,
      fileName: path.basename(filePath),
      dataUrl,
      size: stats.size
    };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('lumina:get-recent', async () => {
  return loadRecentFiles();
});

ipcMain.handle('lumina:add-recent', async (event, filePath) => {
  let recents = loadRecentFiles().filter(item => item.path !== filePath);
  recents.unshift({
    path: filePath,
    name: path.basename(filePath),
    lastOpened: Date.now()
  });
  saveRecentFiles(recents);
  return recents;
});

ipcMain.handle('lumina:clear-recent', async () => {
  saveRecentFiles([]);
  return [];
});

ipcMain.handle('lumina:show-message-box', async (event, options) => {
  if (!mainWindow) return { response: 0 };
  return dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('lumina:set-title', async (event, title) => {
  if (mainWindow) {
    mainWindow.setTitle(title ? `${title} — LUMINA` : 'LUMINA — Professional Photo Editor');
  }
  return true;
});
