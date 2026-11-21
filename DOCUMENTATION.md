# LUMINA — Comprehensive Technical Documentation & Architecture Manual

Welcome to the comprehensive technical documentation for **LUMINA**, an advanced, professional-grade desktop image manipulation application engineered specifically for the Windows operating system. 

Inspired by industry-standard suites like Adobe Photoshop and Adobe Lightroom, LUMINA combines a studio-grade dark interface with a pure, high-performance **HTML5 Canvas** pixel processing engine, a multi-layer compositor, a 14-parameter non-destructive color grading pipeline, procedural creative filters, and a secure **Electron** desktop integration layer.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Directory Structure & Module Layout](#2-directory-structure--module-layout)
3. [The Core Canvas Engine](#3-the-core-canvas-engine)
   - [3.1 Document State Model (`Document.js`)](#31-document-state-model-documentjs)
   - [3.2 Multi-Layer Model (`Layer.js`)](#32-multi-layer-model-layerjs)
   - [3.3 Multi-Layer Compositor (`Compositor.js`)](#33-multi-layer-compositor-compositorjs)
   - [3.4 14-Point Adjustments Engine (`AdjustmentsEngine.js`)](#34-14-point-adjustments-engine-adjustmentsenginejs)
   - [3.5 Artistic Filters & Convolution Engine (`FiltersEngine.js`)](#35-artistic-filters--convolution-engine-filtersenginejs)
   - [3.6 Drawing & Brush Engine (`DrawingEngine.js`)](#36-drawing--brush-engine-drawingenginejs)
   - [3.7 Selection Engine (`SelectionEngine.js`)](#37-selection-engine-selectionenginejs)
   - [3.8 Transformation Engine (`TransformEngine.js`)](#38-transformation-engine-transformenginejs)
   - [3.9 History & State Snapshot Engine (`HistoryEngine.js`)](#39-history--state-snapshot-engine-historyenginejs)
   - [3.10 High-Fidelity Export Pipeline (`ExportEngine.js`)](#310-high-fidelity-export-pipeline-exportenginejs)
4. [Desktop Integration & Electron Layer](#4-desktop-integration--electron-layer)
   - [4.1 Window Lifecycle & Native IPC (`main.js`)](#41-window-lifecycle--native-ipc-mainjs)
   - [4.2 Secure Context Bridge (`preload.js`)](#42-secure-context-bridge-preloadjs)
   - [4.3 Native Application Menu & Accelerators (`menu.js`)](#43-native-application-menu--accelerators-menujs)
   - [4.4 Content Security Policy (CSP)](#44-content-security-policy-csp)
5. [Frontend UI Architecture & Component Hierarchy](#5-frontend-ui-architecture--component-hierarchy)
   - [5.1 State Management & Central Coordination (`App.js`)](#51-state-management--central-coordination-appjs)
   - [5.2 Viewport & Interactive Stage (`CanvasWorkspace.js`)](#52-viewport--interactive-stage-canvasworkspacejs)
   - [5.3 Tool Options & Toolbars](#53-tool-options--toolbars)
   - [5.4 Inspector & Studio Panels](#54-inspector--studio-panels)
   - [5.5 Modal Dialogs](#55-modal-dialogs)
6. [Keyboard Shortcuts Reference](#6-keyboard-shortcuts-reference)
7. [Build, Packaging & Distribution](#7-build-packaging--distribution)
   - [7.1 Development Server](#71-development-server)
   - [7.2 Production Build](#72-production-build)
   - [7.3 Standalone Executable & NSIS Installer](#73-standalone-executable--nsis-installer)

---

## 1. Architectural Overview

LUMINA is built on a clean, three-tier decoupled architectural pattern designed for maximum throughput, low memory footprint, and strict security isolation:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: ELECTRON HOST PROCESS                        │
│  - Chromium 34 Window Management & Message Loop                       │
│  - Native Windows File Dialogs (Open, Save, Export)                   │
│  - Native Windows Application Menu & Global Shortcuts                  │
│  - Persistent User Preferences & Recents History Store                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC Channels (Invoke / Handle)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              TIER 2: REACT 19 UI & INTERACTION LAYER                   │
│  - Workspace Stage & Viewport (Smooth Zoom, Subpixel Pan, Wheel Math)  │
│  - Interactive Tool Overlays (Crop Box, Brush Cursor, Marching Ants)   │
│  - Studio Panels (Layers, 14-Point Adjustments, Filters, RGB Hist)    │
│  - Modal Dialogs (New Doc, Resize, Canvas Size, Export, Shortcuts)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Pure JS State & Mutation Triggers
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             TIER 3: LUMINA PURE CANVAS ENGINE CORE                     │
│  - Document & Layer Data Graphs                                        │
│  - Multi-Layer Blending & Alpha Compositing                            │
│  - Convolution Filtering & Color Grading Pipeline                      │
│  - Stroke Interpolation & Pixel Erasure Algorithms                    │
│  - Bounded Undo/Redo Ring Buffer (Deep Canvas Snapshots)              │
│  - Lossless PNG, Compressed JPEG, and Modern WebP Encoder              │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Design Tenets
1. **Zero UI Blocking**: Pixel-heavy calculations (e.g., convolution kernels, histogram gathering, color space transformations) work directly with `TypedArray` (`Uint8ClampedArray`) buffers for direct contiguous memory access.
2. **Strict Security Isolation**: The renderer runs with `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true`. Communication with the host OS goes exclusively through a tightly scoped API bridge exposed in `preload.js`.
3. **Non-Destructive Adjustments**: Global tone curves, color temperature, tint, and artistic filters are stored as declarative parameters and composited on the fly over base layer pixel stacks. Original pixels are never permanently altered until flattened or explicitly committed.

---

## 2. Directory Structure & Module Layout

```
LUMINA/
├── .gitignore                      # Git exclusion rules (node_modules, dist, builds)
├── package.json                    # Electron packaging scripts and project metadata
├── package-lock.json               # Root lockfile
├── README.md                       # High-level overview and feature showcase
├── DOCUMENTATION.md                # In-depth architectural & technical manual
├── run.bat                         # One-click Windows launch script
├── run-lumina.bat                  # Desktop app runner & dev-mode fallback
│
├── assets/                         # Windows branding assets
│   ├── icon.ico                    # Multi-resolution Windows executable icon
│   └── icon.png                    # High-res RGBA icon
│
├── electron/                       # Native Desktop Host
│   ├── main.js                     # Application entry point, window setup, IPC handlers
│   ├── preload.js                  # Secure contextBridge exposing window.luminaAPI
│   └── menu.js                     # Native Windows top menu definition
│
├── scripts/                        # Automation & testing utilities
│   ├── generate_icon.js            # Node-based icon generator for LUMINA branding
│   ├── smoke_test.js               # Headless Electron smoke test runner
│   └── test_packaged_exe.js        # Automated test for win-unpacked executable
│
└── frontend/                       # React 19 Frontend & Image Processing Core
    ├── package.json                # Frontend dependencies & build commands
    ├── public/
    │   ├── index.html              # Shell HTML with strict Content Security Policy
    │   ├── favicon.ico             # Browser icon
    │   └── manifest.json           # Web app manifest
    └── src/
        ├── index.js                # React DOM root mounting
        ├── index.css               # Global typography & root CSS variables
        ├── App.js                  # Central state orchestrator and keyboard dispatcher
        ├── App.css                 # Main layout frame styling
        │
        ├── engine/                 # PURE JAVASCRIPT IMAGE EDITING ENGINE
        │   ├── Document.js         # Document model, active layer, dirty state
        │   ├── Layer.js            # Individual layer model, blend modes, local canvas
        │   ├── Compositor.js       # Multi-layer compositing & adjustment pipeline
        │   ├── AdjustmentsEngine.js# 14-parameter pixel manipulation & RGB histogram
        │   ├── FiltersEngine.js    # Convolution kernels, vignettes, noise, duotones
        │   ├── DrawingEngine.js    # Procedural brush strokes, hardness, shapes
        │   ├── SelectionEngine.js  # Rect/lasso masks, marching ants, pixel removal
        │   ├── TransformEngine.js  # Rotate, flip, crop, expand boundaries, resample
        │   ├── HistoryEngine.js    # 40-step bounded undo/redo snapshot stack
        │   └── ExportEngine.js     # PNG, JPEG, WebP export and scaling
        │
        ├── components/             # REACT INTERFACE COMPONENTS
        │   ├── common/             # Reusable UI primitives
        │   │   ├── Icons.js        # Crisp SVG icon library (50+ icons)
        │   │   ├── Modal.js        # Accessible dialog wrapper with backdrop
        │   │   └── SliderControl.js# Nudgeable slider with numeric display
        │   ├── navbar/             # Top navigation & document management
        │   │   ├── TopNavBar.js    # Photoshop-style menu bar & action pills
        │   │   └── DocumentTabs.js # Multi-document tab bar with dirty indicators
        │   ├── toolbar/            # Tool selection and options
        │   │   ├── LeftToolbar.js  # Vertical tool palette
        │   │   └── ToolOptionsBar.js# Dynamic contextual properties for active tool
        │   ├── workspace/          # Viewport canvas stage
        │   │   └── CanvasWorkspace.js# High-precision pan/zoom stage & tool overlays
        │   ├── panels/             # Right collapsible inspector panels
        │   │   ├── RightPanel.js   # Tabbed dock controller
        │   │   ├── AdjustmentsPanel.js# Sliders for color, light, and detail
        │   │   ├── FiltersPanel.js # Visual filter presets grid
        │   │   ├── LayersPanel.js  # Layer stack, opacity, blend modes, reordering
        │   │   ├── HistoryPanel.js # History steps list with jump-to-state
        │   │   ├── HistogramPanel.js# Live RGB & luminance channel distribution
        │   │   └── PropertiesPanel.js# Canvas size, active layer dimensions
        │   ├── dialogs/            # Modal action popups
        │   │   ├── NewDocumentDialog.js # Custom canvas creation presets
        │   │   ├── ResizeDialog.js      # Image resampling with aspect lock
        │   │   ├── CanvasSizeDialog.js  # Canvas expansion with anchor grid
        │   │   ├── ExportDialog.js      # Quality, format, and dimension export
        │   │   ├── ShortcutsDialog.js   # Keyboard shortcuts reference table
        │   │   └── AboutDialog.js       # Application version & credits
        │   └── statusbar/
        │       └── BottomStatusBar.js   # Cursor coordinates, zoom level, memory
        └── styles/                 # MODULAR CSS3 STYLESHEETS
            ├── variables.css       # Design tokens (colors, radii, typography, z-index)
            ├── layout.css          # Three-column responsive grid layout
            ├── navbar.css          # Top navigation bar styling
            ├── toolbar.css         # Left tool palette & active states
            ├── workspace.css       # Canvas viewport, checkerboard, crop handles
            ├── panels.css          # Collapsible dock panels & layer items
            ├── dialogs.css         # Modal windows & forms
            └── controls.css        # Custom range sliders, switches, buttons
```

---

## 3. The Core Canvas Engine

The engine is encapsulated in `frontend/src/engine/` as pure, testable ES6 classes that operate independently of React's render cycle.

### 3.1 Document State Model (`Document.js`)

The `Document` class represents an active editing project. It maintains layer stacks, history, active selections, global adjustments, and view parameters.

```javascript
export class Document {
  constructor(options = {}) {
    this.id = 'doc_' + Math.random().toString(36).substr(2, 9);
    this.name = options.name || 'Untitled-1';
    this.filePath = options.filePath || null;
    this.width = options.width || 1200;
    this.height = options.height || 800;
    this.isDirty = false;

    this.layers = [];              // Array of Layer instances (Index 0 = Bottom)
    this.activeLayerId = null;

    this.adjustments = AdjustmentsEngine.getDefaultAdjustments();
    this.filterId = 'none';
    this.filterIntensity = 1.0;

    this.compositor = new Compositor(this.width, this.height);
    this.history = new HistoryEngine(40);
    this.selection = { active: false, type: 'rect', bounds: {}, points: [] };
  }
}
```

#### Core Document Operations
- `initBlank()`: Spawns an initial white background raster layer.
- `initFromImage(HTMLImageElement)`: Auto-sizes the document to the natural image width/height and mounts it as an image layer.
- `addLayer(options)`: Inserts a new layer directly above the active layer.
- `deleteLayer(layerId)`: Removes the layer (with safety check preventing deletion of the final layer).
- `duplicateLayer(layerId)`: Performs a deep pixel clone of the specified layer.
- `reorderLayers(fromIndex, toIndex)`: Shifts layer ordering in the compositing stack.
- `snapshot()`: Serializes document dimensions, layer canvases, text configs, and adjustments into a snapshot object for the undo stack.
- `restoreSnapshot(snapshot)`: Rebuilds layer canvases, restoring historical state cleanly without reference leaks.

---

### 3.2 Multi-Layer Model (`Layer.js`)

Every layer in LUMINA owns an offscreen HTML5 `<canvas>` element and its corresponding 2D rendering context (`{ willReadFrequently: true }`).

```javascript
export class Layer {
  constructor(options = {}) {
    this.id = options.id || 'layer_' + Math.random().toString(36).substr(2, 9);
    this.name = options.name || 'Layer 1';
    this.type = options.type || 'raster'; // 'raster' | 'image' | 'text' | 'shape'
    this.visible = options.visible !== undefined ? options.visible : true;
    this.locked = options.locked !== undefined ? options.locked : false;
    this.opacity = options.opacity !== undefined ? options.opacity : 1.0;
    this.blendMode = options.blendMode || 'source-over';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 800;
    this.height = options.height || 600;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }
}
```

#### Supported Blend Modes
LUMINA maps directly to HTML5 Canvas `globalCompositeOperation` standards:
1. **Normal (`source-over`)**: Standard alpha blending.
2. **Multiply (`multiply`)**: Darkens by multiplying color components.
3. **Screen (`screen`)**: Lightens by inverting, multiplying, and inverting.
4. **Overlay (`overlay`)**: Combines Multiply and Screen based on base brightness.
5. **Darken (`darken`)**: Selects the darker color between source and destination.
6. **Lighten (`lighten`)**: Selects the lighter color.
7. **Color Dodge (`color-dodge`)**: Brightens base color to reflect source.
8. **Color Burn (`color-burn`)**: Darkens base color to reflect source.
9. **Hard Light (`hard-light`)**: Multiplies or screens based on source brightness.
10. **Soft Light (`soft-light`)**: Subtle dodge or burn effect.
11. **Difference (`difference`)**: Subtracts darker from lighter color.
12. **Exclusion (`exclusion`)**: Lower-contrast variant of Difference.

#### Layer Cropping Algorithm
```javascript
crop(normX, normY, normW, normH) {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = normW;
  newCanvas.height = normH;
  const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });

  // Draw the layer's pixels relative to the new document origin
  newCtx.drawImage(this.canvas, this.x - normX, this.y - normY);

  this.width = normW;
  this.height = normH;
  this.x = 0;
  this.y = 0;
  this.canvas = newCanvas;
  this.ctx = newCtx;
}
```

---

### 3.3 Multi-Layer Compositor (`Compositor.js`)

The `Compositor` is responsible for merging the multi-layer stack onto a single destination canvas and applying the post-composition adjustment and filter passes:

```javascript
compose(layers, adjustments = null, filterId = 'none', filterIntensity = 1.0) {
  this.ctx.clearRect(0, 0, this.width, this.height);

  // 1. Composite all visible layers from bottom to top
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!layer.visible || layer.opacity <= 0) continue;

    this.ctx.save();
    this.ctx.globalAlpha = layer.opacity;
    this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';
    this.ctx.drawImage(layer.canvas, layer.x, layer.y);
    this.ctx.restore();
  }

  // 2. Apply non-destructive adjustments & filters
  const hasAdj = AdjustmentsEngine.hasActiveAdjustments(adjustments);
  const hasFilt = filterId && filterId !== 'none' && filterIntensity > 0;

  if (hasAdj || hasFilt) {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    if (hasAdj) AdjustmentsEngine.applyAdjustments(imageData, adjustments);
    if (hasFilt) FiltersEngine.applyFilter(imageData, filterId, filterIntensity);
    this.ctx.putImageData(imageData, 0, 0);
  }

  return this.outputCanvas;
}
```

---

### 3.4 14-Point Adjustments Engine (`AdjustmentsEngine.js`)

The adjustments engine processes `ImageData.data` using continuous mathematical models:

| Adjustment | Range | Algorithm / Formula |
| :--- | :---: | :--- |
| **Brightness** | `[-100, 100]` | Linear offset: `val = val + (brightness * 2.55)` |
| **Contrast** | `[-100, 100]` | Midpoint scaling: `factor = c < 0 ? (100+c)/100 : 1 + (c/50)*1.5`; `val = (val - 128) * factor + 128` |
| **Exposure** | `[-100, 100]` | Photographic stop power curve: `factor = 2^(exposure / 40)`; `val = val * factor` |
| **Temperature** | `[-100, 100]` | Warm/cool shift: Warm boosts R by `1 + (temp/100)*0.4`; Cool boosts B by `1 + (-temp/100)*0.4` |
| **Tint** | `[-100, 100]` | Green/Magenta shift: Green boosts G by `1 + (-tint/100)*0.3`; Magenta adds R and B by `(tint/100)*0.3` |
| **Highlights** | `[-100, 100]` | Luminance-weighted mask: `mask = (lum / 255)^2`; `val = val + hl * 128 * mask` |
| **Shadows** | `[-100, 100]` | Inverse luminance mask: `mask = (1 - lum / 255)^2`; `val = val + sh * 128 * mask` |
| **Whites** | `[-100, 100]` | Threshold shift: `if (lum > 180) val = val + wh * ((lum - 180) / 75)` |
| **Blacks** | `[-100, 100]` | Deep shadow clamp: `if (lum < 75) val = val + bl * ((75 - lum) / 75)` |
| **Saturation** | `[-100, 100]` | Rec. 709 luminance interpolation: `lum = 0.299R + 0.587G + 0.114B`; `val = lum + (val - lum) * (1 + sat)` |
| **Vibrance** | `[-100, 100]` | Skin-tone protected saturation: `max = max(R,G,B); avg = (R+G+B)/3`; `amount = (1 - (max - avg)/255) * vibrance` |
| **Hue Rotation** | `[-180°, 180°]` | Polar transformation matrix via trigonometric projection (`cos(hue)`, `sin(hue)`) |
| **Gamma** | `[0.2, 2.5]` | Power-law gamma: `val = 255 * (val / 255)^(1 / gamma)` |
| **Sharpness** | `[0, 100]` | 3×3 Laplacian convolution kernel unsharp mask mixed via intensity weight |

#### Real-Time RGB & Luminance Histogram
```javascript
static computeHistogram(imageData) {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const l = new Uint32Array(256);

  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    r[data[i]]++;
    g[data[i + 1]]++;
    b[data[i + 2]]++;
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    l[lum]++;
  }
  return { r, g, b, l, maxCount };
}
```

---

### 3.5 Artistic Filters & Convolution Engine (`FiltersEngine.js`)

LUMINA provides 13 real-time artistic and convolution filters:

1. **Grayscale**: Rec. 709 luminance weighting (`0.299R + 0.587G + 0.114B`).
2. **Warm Sepia**: Matrix transformation (`R = 0.393R + 0.769G + 0.189B`, etc.).
3. **Vintage 1970s**: Warms midtones and lifts black floor from 0 to 25 to simulate aged chemical print stock.
4. **B&W Contrast**: Sigmoidal tonal S-curve applied to monochrome pixels for deep noir shadows.
5. **Warm Sunset**: Warm golden highlights paired with subtle shadow compression.
6. **Cool Teal**: Modern cinematic teal-tinted shadows and cool highlights.
7. **Gaussian Blur**: 2-pass separable blur with box-convolution approximation and edge clamping.
8. **Sharpen Detail**: High-pass Laplacian matrix:
   $$\begin{bmatrix} 0 & -1 & 0 \\ -1 & 5 & -1 \\ 0 & -1 & 0 \end{bmatrix}$$
9. **Classic Vignette**: Distance-squared falloff from image center:
   $$factor = 1.0 - \left(\frac{dist}{maxDist}\right)^2 \times intensity$$
10. **Pixelate Retro**: Spatial coordinate decimation mapping $N \times N$ pixel clusters to the average center color.
11. **3D Emboss**: Directional convolution kernel creating embossed surface relief:
    $$\begin{bmatrix} -2 & -1 & 0 \\ -1 & 1 & 1 \\ 0 & 1 & 2 \end{bmatrix}$$
12. **Edge Detection**: Sobel gradient magnitude approximation detecting high-frequency spatial boundaries.
13. **Film Grain Noise**: Uniform pseudo-random noise injection with intensity attenuation.

---

### 3.6 Drawing & Brush Engine (`DrawingEngine.js`)

#### Subpixel Stroke Interpolation
To avoid disjointed dots when dragging rapidly, `DrawingEngine.drawStroke` calculates Euclidean distance between mouse samples $(p_1, p_2)$ and interpolates dabs at step intervals proportional to brush size ($step = \max(1, size \times 0.25)$).

#### Hardness Falloff via Radial Gradients
- **Hardness $\ge 0.95$**: Crisp circular arc fill.
- **Hardness $< 0.95$**: Multi-stop radial gradient with inner radius set to $radius \times hardness$ and outer radius at $radius$, falling off to alpha 0.

#### Eraser Tool
Uses standard Canvas `globalCompositeOperation = 'destination-out'`. It honors brush size and hardness, clearing existing pixel alpha back to transparency.

---

### 3.7 Selection Engine (`SelectionEngine.js`)

#### Selection Types
1. **Rectangular Marquee (`select-rect`)**: Bounding box defined by origin $(x_1, y_1)$ and width/height.
2. **Polygonal / Freehand Lasso (`select-lasso`)**: Ordered point path with automatic closure.

#### Pixel Deletion Masking
When the user presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>, `SelectionEngine.deleteSelection` activates `destination-out` on the active layer's context, filling the rectangle, ellipse, or path geometry to cleanly carve out selected pixels.

---

### 3.8 Transformation Engine (`TransformEngine.js`)

- **Rotation**: Full 90° CW and CCW matrix transformations swapping dimensions and translating origins.
- **Flipping**: Horizontal and vertical flipping via negative scaling (`scale(-1, 1)` and `scale(1, -1)`).
- **Resampling**: High-quality bilinear interpolation scaling images up or down cleanly.
- **Canvas Size Expansion**: Anchor-based expansion (`center`, `top-left`, `bottom-right`) without stretching source pixels.
- **Interactive Cropping**: Normalizes bounding boxes, offsets layer coordinate systems, and crops all document layers simultaneously.

---

### 3.9 History & State Snapshot Engine (`HistoryEngine.js`)

- Maintains a bounded **40-state ring buffer** to ensure memory usage never explodes.
- Deep clones every layer canvas into an offscreen element at each commit point.
- Supports historical jump points: clicking any step in the **History Panel** jumps directly to that historical state.

---

### 3.10 High-Fidelity Export Pipeline (`ExportEngine.js`)

- **PNG**: Full 32-bit RGBA lossless export with preserved alpha transparency.
- **JPEG**: Custom quality parameter (`0.01` to `1.00`) with automatic white background matting to prevent dark artifacts from missing alpha.
- **WebP**: High-efficiency modern web export format.
- **Live Output Rescaling**: Custom width and height inputs with aspect ratio preservation.
- **Native File Dialog**: Bypasses browser download prompts, invoking Windows native save dialogs via Electron IPC.

---

## 4. Desktop Integration & Electron Layer

### 4.1 Window Lifecycle & Native IPC (`main.js`)
- Enforces a **Single Instance Lock** (`app.requestSingleInstanceLock()`). If the user launches a second executable, focus is restored to the primary window.
- Manages native OS file dialogs for opening images and saving exports.
- Maintains a persistent `lumina_recent_files.json` in the user's `AppData` directory.

### 4.2 Secure Context Bridge (`preload.js`)
LUMINA adheres strictly to Electron security practices. The renderer has zero direct access to Node.js APIs (`fs`, `child_process`, `electron`).

```javascript
contextBridge.exposeInMainWorld('luminaAPI', {
  isElectron: true,
  platform: process.platform,
  openFileDialog: () => ipcRenderer.invoke('lumina:open-file'),
  saveFileDialog: (options) => ipcRenderer.invoke('lumina:show-save-dialog', options),
  saveImageFile: (filePath, base64Data) => ipcRenderer.invoke('lumina:save-file', { filePath, base64Data }),
  readImageFile: (filePath) => ipcRenderer.invoke('lumina:read-file', filePath),
  getRecentFiles: () => ipcRenderer.invoke('lumina:get-recent'),
  setDocumentTitle: (title) => ipcRenderer.invoke('lumina:set-title', title),
  onMenuAction: (callback) => {
    const handler = (event, action, payload) => callback(action, payload);
    ipcRenderer.on('lumina:menu-action', handler);
    return () => ipcRenderer.removeListener('lumina:menu-action', handler);
  }
});
```

### 4.3 Native Application Menu & Accelerators (`menu.js`)
Builds a native Windows application menu bar with categories:
- **File**: New, Open Image, Open Recent, Save, Export As, Close Document, Exit.
- **Edit**: Undo, Redo, Select All, Deselect, Delete Selection.
- **Image**: Rotate 90° CW, Rotate 90° CCW, Flip Horizontal, Flip Vertical, Resize Image, Canvas Size, Crop to Selection.
- **Layer**: New Layer, Duplicate Layer, Delete Layer.
- **View**: Zoom In, Zoom Out, Fit to Screen, Actual Size, Toggle Before/After Comparison.
- **Help**: Keyboard Shortcuts, About LUMINA.

### 4.4 Content Security Policy (CSP)
Defined in `frontend/public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;" />
```

---

## 5. Frontend UI Architecture & Component Hierarchy

### 5.1 State Management & Central Coordination (`App.js`)
- `documents`: Array of open `Document` instances.
- `activeDocumentId`: Pointer to the focused document.
- `renderTrigger`: Fast counter triggering Canvas re-renders whenever underlying engine objects mutate.
- Global key listener dispatching accelerators to active tools.

### 5.2 Viewport & Interactive Stage (`CanvasWorkspace.js`)
- **Zoom Model**: Invariant zoom centered directly on the mouse pointer:
  $$canvasX = \frac{mouseX - panX}{zoom}$$
  $$newPanX = mouseX - canvasX \times newZoom$$
- **Middle-Mouse & Spacebar Panning**: Hold <kbd>Space</kbd> or click the middle mouse button to grab and pan across the infinite canvas.
- **Studio Checkerboard**: CSS background pattern rendering transparency with high contrast.
- **Overlays**: Interactive crop rectangle with 8 drag handles and rule-of-thirds grid lines; live brush diameter ring cursor; marching ants selection bounding box.

### 5.3 Tool Options & Toolbars
- **Left Toolbar (`LeftToolbar.js`)**: Quick selection of 11 editing tools with active state indicators and tooltips with keyboard shortcuts.
- **Tool Options Bar (`ToolOptionsBar.js`)**: Dynamic context bar reflecting active tool parameters:
  - Brush / Eraser: Size slider, Opacity, Hardness.
  - Text: Font family dropdown, font size input, bold/italic toggles, alignment, color swatch.
  - Shape: Rectangle, Circle, Line, Triangle selector, stroke width, fill/stroke colors.
  - Crop: Aspect ratio presets (`Freeform`, `1:1`, `4:3`, `16:9`, `3:2`), Apply Crop button, Cancel button.

### 5.4 Inspector & Studio Panels
- **Adjustments Panel**: 14 sliders categorized into Light, Color, and Detail groups, with direct numeric inputs and single-click reset buttons.
- **Filters Panel**: Visual gallery of 13 filter presets with real-time intensity slider.
- **Layers Panel**: Visual layer stack with thumbnail generation, visibility toggle eye, lock toggle, opacity slider, blend mode picker, rename input, and layer ordering controls.
- **History Panel**: Vertical chronological timeline of operations with one-click historical rollbacks.
- **Histogram Panel**: High-speed real-time 4-channel (Red, Green, Blue, Luminance) distribution visualizer.
- **Properties Panel**: Live readouts of document dimensions, color space, active layer bounds, and viewport coordinates.

---

## 6. Keyboard Shortcuts Reference

| Category | Shortcut | Function |
| :--- | :--- | :--- |
| **File** | `Ctrl + N` | Create New Document |
| | `Ctrl + O` | Open Image File |
| | `Ctrl + S` | Save File |
| | `Ctrl + Shift + S` | Export As (PNG / JPEG / WebP) |
| | `Ctrl + W` | Close Active Document |
| **Edit** | `Ctrl + Z` | Undo |
| | `Ctrl + Y` | Redo |
| | `Ctrl + A` | Select All |
| | `Ctrl + D` | Deselect |
| | `Delete` / `Backspace` | Delete Selected Pixels |
| **View** | `Ctrl + +` | Zoom In |
| | `Ctrl + -` | Zoom Out |
| | `Ctrl + 0` | Fit Canvas to Screen |
| | `Ctrl + 1` | Actual Pixels (100%) |
| | `\` | Toggle Before / After Comparison |
| **Tools** | `V` | Move Tool |
| | `M` | Rectangular Marquee Tool |
| | `L` | Lasso Selection Tool |
| | `C` | Crop Tool |
| | `B` | Brush Tool |
| | `E` | Eraser Tool |
| | `T` | Text Tool |
| | `U` | Shape Tool |
| | `I` | Eyedropper Tool |
| | `H` / `Space` | Hand / Pan Tool |
| | `Z` | Zoom Tool |
| | `Enter` | Confirm / Apply Crop (when Crop is active) |
| | `Escape` | Cancel Crop (when Crop is active) |
| **Layers** | `Ctrl + Shift + N` | New Layer |
| | `Ctrl + J` | Duplicate Active Layer |
| **Help** | `F1` | Open Keyboard Shortcuts Reference |

---

## 7. Build, Packaging & Distribution

### 7.1 Development Server
To launch the application in development mode with hot-reloading:
```powershell
# In terminal 1 (start frontend dev server):
npm run frontend:start

# In terminal 2 (start Electron pointing to dev server):
npm run electron:start
```

### 7.2 Production Build
To compile the optimized production web assets:
```powershell
npm run frontend:build
```
This builds static JavaScript, CSS, and HTML into `frontend/build/`.

### 7.3 Standalone Executable & NSIS Installer
LUMINA uses **electron-builder** to generate standalone desktop distributions:
```powershell
# Build web assets and package standalone Windows distribution:
npm run dist
```
This produces:
- `dist/LUMINA Setup 1.0.0.exe`: Standalone Windows NSIS installer with desktop and Start Menu shortcut creation.
- `dist/win-unpacked/LUMINA.exe`: Portable, standalone executable ready for instant deployment without installation.

---

## 8. Summary & Specifications

- **Application Name**: LUMINA
- **Category**: Professional Desktop Photo Editor
- **Target OS**: Windows 10 / Windows 11 (64-bit)
- **Runtime**: Electron 34 + React 19 + HTML5 Canvas API
- **Rendering Architecture**: Pure Client-Side GPU-Accelerated 2D Canvas Engine
- **Memory Management**: Bounded 40-step snapshot cache with automatic resource reclamation
- **Security Profile**: Isolated Context Bridge, Zero Direct Node Injection in Renderer, Strict Content Security Policy
