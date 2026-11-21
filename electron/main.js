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

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.tif'];

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.bmp': return 'image/bmp';
    case '.gif': return 'image/gif';
    case '.tiff':
    case '.tif': return 'image/tiff';
    default: return 'application/octet-stream';
  }
}

function getFilePathFromArgs(argv) {
  if (!argv || !Array.isArray(argv)) return null;
  for (let i = 1; i < argv.length; i++) {
    let arg = argv[i];
    if (!arg || typeof arg !== 'string') continue;
    arg = arg.trim();
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
      arg = arg.slice(1, -1);
    }
    if (arg.startsWith('--') || arg.startsWith('-') || arg === '.') continue;

    const ext = path.extname(arg).toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
      try {
        const resolved = path.resolve(arg);
        if (fs.existsSync(resolved)) {
          return resolved;
        }
      } catch (err) {
        // continue
      }
    }
  }
  return null;
}

function createFilePayload(filePath) {
  try {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) return null;

    const buffer = fs.readFileSync(resolved);
    const mime = getMimeType(resolved);
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    const stats = fs.statSync(resolved);

    // Save to recents
    let recents = loadRecentFiles().filter(item => item.path !== resolved);
    recents.unshift({
      path: resolved,
      name: path.basename(resolved),
      lastOpened: Date.now()
    });
    saveRecentFiles(recents);

    return {
      filePath: resolved,
      fileName: path.basename(resolved),
      dataUrl,
      size: stats.size
    };
  } catch (err) {
    console.error('Failed to create file payload for:', filePath, err);
    return null;
  }
}

function sendFileToWindow(filePath) {
  if (!mainWindow || !filePath) return;
  const payload = createFilePayload(filePath);
  if (payload) {
    mainWindow.webContents.send('lumina:open-image-payload', payload);
  }
}

let initialFilePath = getFilePathFromArgs(process.argv);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#18191c',
    icon: path.join(__dirname, '../assets/icon.ico'),
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

  // Fallback: If initialFilePath hasn't been consumed yet by renderer, send it once loaded
  mainWindow.webContents.on('did-finish-load', () => {
    if (initialFilePath) {
      sendFileToWindow(initialFilePath);
      initialFilePath = null;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const filePath = getFilePathFromArgs(commandLine);
      if (filePath) {
        sendFileToWindow(filePath);
      }
    }
  });

  // Cross-platform open-file event
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    if (mainWindow && mainWindow.webContents) {
      sendFileToWindow(filePath);
    } else {
      initialFilePath = filePath;
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
ipcMain.handle('lumina:get-initial-file', async () => {
  if (!initialFilePath) return null;
  const filePath = initialFilePath;
  initialFilePath = null;
  return createFilePayload(filePath);
});

ipcMain.handle('lumina:open-file', async () => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Image — LUMINA',
    properties: ['openFile'],
    filters: [
      { name: 'Supported Images (*.jpg, *.jpeg, *.png, *.webp, *.bmp, *.gif, *.tiff, *.tif)', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'tif'] },
      { name: 'JPEG Image (*.jpg, *.jpeg)', extensions: ['jpg', 'jpeg'] },
      { name: 'PNG Image (*.png)', extensions: ['png'] },
      { name: 'WebP Image (*.webp)', extensions: ['webp'] },
      { name: 'Bitmap Image (*.bmp)', extensions: ['bmp'] },
      { name: 'GIF Image (*.gif)', extensions: ['gif'] },
      { name: 'TIFF Image (*.tiff, *.tif)', extensions: ['tiff', 'tif'] },
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
