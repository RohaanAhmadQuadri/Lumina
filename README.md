# LUMINA — Advanced Professional Photo Editor

[![Platform](https://img.shields.io/badge/Platform-Windows%20Desktop-0078D6.svg?logo=windows)](https://microsoft.com)
[![Framework](https://img.shields.io/badge/Framework-Electron.js%2034-47848F.svg?logo=electron)](https://electronjs.org)
[![Frontend](https://img.shields.io/badge/Frontend-React.js%2019-61DAFB.svg?logo=react)](https://react.dev)
[![Engine](https://img.shields.io/badge/Rendering-HTML5%20Canvas%20API-E34F26.svg?logo=html5)](https://w3.org)
[![Installer](https://img.shields.io/badge/Installer-Lumina--Setup.exe-00c896.svg)]()
[![Documentation](https://img.shields.io/badge/Documentation-Complete%20Guide-blueviolet.svg)](DOCUMENTATION.md)

**LUMINA** is a high-performance, professional desktop photo editing application engineered from the ground up for Windows. Inspired by creative suites like Adobe Photoshop and Lightroom, LUMINA pairs a dark theme interface with a pure HTML5 Canvas image manipulation engine, multi-layer compositing, non-destructive color grading, and native Windows desktop integration.

---

## Key Features

### 1. Central Canvas Workspace
- **Zoom & Pan Engine**: Smooth mouse wheel zoom (5% to 1000%), grab pan tool, and middle-mouse panning.
- **Transparent Checkerboard**: Studio-grade checkerboard pattern preserving visibility for transparent PNG/WebP layers.
- **Before / After Comparison**: Press `\` or click the top bar button to instantly toggle between the edited image and original raw capture.
- **Rule-of-Thirds Cropping**: Interactive bounding box with 8-point handles and standard aspect ratios (1:1, 4:3, 16:9, 3:2, Freeform).
- **Fit-to-Screen**: One-click (`Ctrl+0`) intelligent viewport centering.

### 2. Comprehensive 14-Point Image Adjustments
Non-destructive, real-time pixel processing with numeric inputs, fine-nudge sliders, and instant reset:
- **Brightness & Contrast**: Midpoint balanced color dynamics.
- **Exposure**: Photographic stop scale adjusting luminance without clipping shadows.
- **White Balance**: Correlated Color Temperature (warm orange to cool blue) & Tint (green to magenta).
- **Highlights & Shadows**: Intelligent luminance-mask curve correction.
- **Whites & Blacks**: Threshold expansion for deep blacks and pure whites.
- **Color Grading**: Saturation, Vibrance (skin-tone protected), and 360° Hue angle rotation.
- **Sharpness & Gamma**: 3×3 Laplacian convolution unsharp mask and power-law gamma correction.
- **Live RGB Histogram**: High-speed real-time RGB and Luminance channel visualizer.

### 3. Creative Filters & Convolution Effects
- **Grayscale**: Rec. 709 luminance-weighted monochrome conversion.
- **Sepia**: Classic warm archival silver gelatin tone.
- **Vintage 1970s**: Film-stock color grade with lifted blacks and warm highlights.
- **B&W High Contrast**: Deep noir tonal curve.
- **Gaussian Blur**: Fast 2-pass separable convolution filter.
- **Sharpen Detail**: Laplacian edge enhancement kernel.
- **Vignette**: Radial inverse-distance lens falloff with intensity control.
- **Pixelate**: Block sampling retro effect.
- **3D Emboss**: Directional topographical convolution.
- **Edge Detection**: Sobel gradient operator.
- **Film Grain Noise**: Realistic analog camera sensor grain.
- **Warm Sunset & Cool Teal**: Cinematic dual-tone color lookup.

### 4. Advanced Layer Management
- **Layer Hierarchy**: Visual layer stack with live thumbnail previews.
- **Blend Modes**: Standard 12 blend modes (`Normal`, `Multiply`, `Screen`, `Overlay`, `Darken`, `Lighten`, `Color Dodge`, `Color Burn`, `Hard Light`, `Soft Light`, `Difference`, `Exclusion`).
- **Opacity Control**: 0% to 100% fine transparency slider.
- **Layer Organization**: Create, duplicate, rename, lock, reorder (up/down), and delete layers.
- **Layer Types**: Image layers, raster paint layers, vector text layers, and geometric shape layers.

### 5. Drawing & Creative Tools
- **Brush Tool (`B`)**: Adjustable radius (1–200px), opacity, hardness falloff, and color picker.
- **Eraser Tool (`E`)**: Pixel-accurate `destination-out` erasing with adjustable hardness.
- **Text Tool (`T`)**: Typography insertion with custom fonts, sizes, bold/italic, alignment, and color.
- **Vector Shapes (`U`)**: Rectangles, circles/ellipses, lines, and triangles with stroke and fill.
- **Selection Tools (`M`, `L`)**: Rectangular marquee and freehand lasso with marching-ants indicator and pixel deletion (`Del`).
- **Eyedropper (`I`)**: Real-time canvas pixel color sampler with Hex/RGB readout.
- **Hand Tool (`H`) & Zoom Tool (`Z`)**: Fluid canvas navigation.

### 6. History & Undo/Redo Engine
- Bounded memory snapshot state manager.
- Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`).
- Visual **History Panel** tracking every stroke, adjustment, layer creation, and transformation.
- Direct jump to any historical state.

### 7. Native Windows Integration
- **Standalone Installer & Executable**: Self-contained installation via `Lumina-Setup.exe` with desktop shortcut and Start Menu entry. Zero prerequisite runtime installation required.
- **Windows "Open with" Association**: Registered as a recognized image editor for `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.gif`, `.tiff`, and `.tif`.
- **Single-Instance Image Routing**: Opening images while LUMINA is already running automatically routes the image into a new tab in the active window without spawning duplicate processes.
- **Portable Explorer Scripts**: Includes one-click scripts (`register_open_with.bat` and `unregister_open_with.bat`) for portable setups.

### 8. Professional Export System
- Export formats: **PNG** (lossless with full alpha transparency), **JPEG** (custom quality compression 1–100%), and **WebP** (modern high-compression web format).
- Live export file size estimation.
- Native Windows File Save Dialog via secure Electron IPC bridge.

---

## Tech Stack & Architecture

LUMINA follows a clean three-tier decoupled architecture:

```
LUMINA/
├── assets/                   # Application icon (.ico, .png)
├── electron/                 # Electron Desktop Layer
│   ├── installer.nsh         # NSIS Windows registry & shell integration hooks
│   ├── main.js               # Window lifecycle, secure IPC, CLI argument parsing
│   ├── menu.js               # Native Windows application menu & accelerators
│   └── preload.js            # Secure contextBridge exposing window.luminaAPI
│
├── frontend/                 # React UI & Image Processing Engine
│   ├── src/
│   │   ├── engine/           # Decoupled Pure JS/Canvas Editing Engine
│   │   │   ├── Document.js           # Document model, layers, history, viewport
│   │   │   ├── Layer.js              # Layer canvas, blend mode, opacity, type
│   │   │   ├── Compositor.js         # Multi-layer canvas compositing pipeline
│   │   │   ├── AdjustmentsEngine.js  # 14-point pixel math & RGB histogram
│   │   │   ├── FiltersEngine.js      # Convolution kernels, vignette, noise
│   │   │   ├── DrawingEngine.js      # Brush, eraser, shapes, color sampling
│   │   │   ├── SelectionEngine.js    # Rect & lasso selection masks
│   │   │   ├── TransformEngine.js    # Rotate, flip, crop, resample
│   │   │   ├── HistoryEngine.js      # Undo/redo stack & state snapshots
│   │   │   └── ExportEngine.js       # PNG, JPEG, WebP export pipeline
│   │   ├── components/       # Modular UI Components
│   │   │   ├── navbar/       # TopNavBar, DocumentTabs
│   │   │   ├── toolbar/      # LeftToolbar, ToolOptionsBar
│   │   │   ├── workspace/    # CanvasWorkspace, ViewportCanvas
│   │   │   ├── panels/       # Adjustments, Filters, Layers, History, Properties
│   │   │   ├── dialogs/      # NewDocument, Resize, CanvasSize, Export, Shortcuts, About
│   │   │   └── common/       # Crisp SVG Icons, SliderControl, Modal
│   │   ├── styles/           # Pure CSS3 Styling & Photoshop-inspired Dark Theme
│   │   ├── App.js            # Main Application Root & Image Load Dispatcher
│   │   └── index.js
│   └── package.json
│
├── scripts/                  # Portable Windows utilities
│   ├── register_open_with.bat    # Register portable build with Windows Open with
│   └── unregister_open_with.bat  # Cleanly unregister portable Open with associations
├── DOCUMENTATION.md          # Comprehensive architecture & engine documentation
├── package.json              # Electron packaging & file associations configuration
└── README.md
```

### Electron Security Best Practices
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` compliant preload bridge
- Restricted IPC communication via `contextBridge.exposeInMainWorld('luminaAPI', ...)`
- Standard Content-Security-Policy (CSP) enforcing strict script and style execution.

---

## Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl + N` | Create New Document |
| `Ctrl + O` | Open Image File |
| `Ctrl + S` | Save Current Document |
| `Ctrl + Shift + S` | Export As (PNG / JPEG / WebP) |
| `Ctrl + W` | Close Document |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + A` | Select All |
| `Ctrl + D` | Deselect |
| `Delete` | Delete Selected Pixels / Layer |
| `Ctrl + +` | Zoom In |
| `Ctrl + -` | Zoom Out |
| `Ctrl + 0` | Fit to Screen |
| `Ctrl + 1` | Actual Size (100%) |
| `\` | Toggle Before / After Comparison |
| `V` | Move Tool |
| `M` | Rectangular Marquee Tool |
| `L` | Lasso Selection Tool |
| `C` | Crop Tool |
| `B` | Brush Tool |
| `E` | Eraser Tool |
| `T` | Text Tool |
| `U` | Shape Tool |
| `I` | Eyedropper Tool |
| `H` / `Space` | Hand / Pan Tool |
| `Z` | Zoom Tool |
| `Ctrl + Shift + N` | New Layer |
| `Ctrl + J` | Duplicate Layer |
| `F1` | Keyboard Shortcuts Reference |

---

## Building and Packaging

### Development Workflow
```powershell
# 1. Build React frontend
npm run frontend:build

# 2. Launch Electron desktop application
npm run electron:start
```

### Windows Standalone Installer & Executable
```powershell
# Produces standalone Lumina-Setup.exe and portable win-unpacked/ in dist/
npm run dist
```
- **Installer**: `dist/Lumina-Setup.exe` (NSIS installer with Desktop and Start Menu shortcut creation)
- **Portable App**: `dist/win-unpacked/LUMINA.exe` (Can be launched directly without installation)

### Windows "Open with" Integration
LUMINA registers as an editor for `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.gif`, `.tiff`, and `.tif`.
- **Installed App**: Registered automatically via NSIS installer macros during setup and cleanly removed on uninstall.
- **Portable App**: Run `scripts/register_open_with.bat` to integrate the portable executable with Windows Explorer, or `scripts/unregister_open_with.bat` to remove it.

---

## Author & License
Engineered by Lumina Creative Systems. All rights reserved.
