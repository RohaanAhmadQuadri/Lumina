const { Menu, app } = require('electron');

function createApplicationMenu(mainWindow) {
  const isMac = process.platform === 'darwin';

  const send = (action, payload = null) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('lumina:menu-action', action, payload);
    }
  };

  const template = [
    ...(isMac ? [{
      label: 'LUMINA',
      submenu: [
        { role: 'about', label: 'About LUMINA' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: 'Hide LUMINA' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit LUMINA' }
      ]
    }] : []),
    {
      label: '&File',
      submenu: [
        {
          label: 'New Document...',
          accelerator: 'CmdOrCtrl+N',
          click: () => send('file:new')
        },
        {
          label: 'Open Image...',
          accelerator: 'CmdOrCtrl+O',
          click: () => send('file:open')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => send('file:save')
        },
        {
          label: 'Export / Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => send('file:export')
        },
        { type: 'separator' },
        {
          label: 'Close Document',
          accelerator: 'CmdOrCtrl+W',
          click: () => send('file:close')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '&Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => send('edit:undo')
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Y',
          click: () => send('edit:redo')
        },
        { type: 'separator' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          click: () => send('edit:select-all')
        },
        {
          label: 'Deselect',
          accelerator: 'CmdOrCtrl+D',
          click: () => send('edit:deselect')
        },
        {
          label: 'Delete Selection',
          accelerator: 'Delete',
          click: () => send('edit:delete-selection')
        }
      ]
    },
    {
      label: '&Image',
      submenu: [
        {
          label: 'Rotate 90° Clockwise',
          accelerator: 'CmdOrCtrl+Alt+R',
          click: () => send('image:rotate-cw')
        },
        {
          label: 'Rotate 90° Counter-Clockwise',
          accelerator: 'CmdOrCtrl+Alt+L',
          click: () => send('image:rotate-ccw')
        },
        {
          label: 'Rotate 180°',
          click: () => send('image:rotate-180')
        },
        { type: 'separator' },
        {
          label: 'Flip Horizontally',
          click: () => send('image:flip-h')
        },
        {
          label: 'Flip Vertically',
          click: () => send('image:flip-v')
        },
        { type: 'separator' },
        {
          label: 'Resize Image...',
          click: () => send('image:resize')
        },
        {
          label: 'Canvas Size...',
          click: () => send('image:canvas-size')
        },
        {
          label: 'Crop to Selection',
          accelerator: 'C',
          click: () => send('image:crop')
        }
      ]
    },
    {
      label: '&Layer',
      submenu: [
        {
          label: 'New Layer',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => send('layer:new')
        },
        {
          label: 'Duplicate Layer',
          accelerator: 'CmdOrCtrl+J',
          click: () => send('layer:duplicate')
        },
        {
          label: 'Delete Layer',
          click: () => send('layer:delete')
        },
        { type: 'separator' },
        {
          label: 'Toggle Visibility',
          click: () => send('layer:toggle-visibility')
        },
        {
          label: 'Merge Down',
          accelerator: 'CmdOrCtrl+E',
          click: () => send('layer:merge-down')
        }
      ]
    },
    {
      label: 'Fi&lter',
      submenu: [
        {
          label: 'Gaussian Blur',
          click: () => send('filter:gaussian-blur')
        },
        {
          label: 'Sharpen',
          click: () => send('filter:sharpen')
        },
        {
          label: 'Vignette',
          click: () => send('filter:vignette')
        },
        { type: 'separator' },
        {
          label: 'Grayscale',
          click: () => send('filter:grayscale')
        },
        {
          label: 'Sepia',
          click: () => send('filter:sepia')
        },
        {
          label: 'Vintage Film',
          click: () => send('filter:vintage')
        },
        {
          label: 'Black & White High Contrast',
          click: () => send('filter:bw')
        },
        { type: 'separator' },
        {
          label: 'Emboss',
          click: () => send('filter:emboss')
        },
        {
          label: 'Edge Detection',
          click: () => send('filter:edges')
        },
        {
          label: 'Pixelate',
          click: () => send('filter:pixelate')
        },
        {
          label: 'Film Noise',
          click: () => send('filter:noise')
        }
      ]
    },
    {
      label: '&View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => send('view:zoom-in')
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => send('view:zoom-out')
        },
        {
          label: 'Fit on Screen',
          accelerator: 'CmdOrCtrl+0',
          click: () => send('view:fit-screen')
        },
        {
          label: 'Actual Pixels (100%)',
          accelerator: 'CmdOrCtrl+1',
          click: () => send('view:actual-size')
        },
        { type: 'separator' },
        {
          label: 'Toggle Before / After',
          accelerator: 'CmdOrCtrl+\\',
          click: () => send('view:toggle-comparison')
        },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Full Screen' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' }
      ]
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'F1',
          click: () => send('help:shortcuts')
        },
        { type: 'separator' },
        {
          label: 'About LUMINA Photo Editor',
          click: () => send('help:about')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createApplicationMenu };
