import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Document } from './engine/Document';
import { TransformEngine } from './engine/TransformEngine';
import { SelectionEngine } from './engine/SelectionEngine';
import { ExportEngine } from './engine/ExportEngine';

import { TopNavBar } from './components/navbar/TopNavBar';
import { DocumentTabs } from './components/navbar/DocumentTabs';
import { LeftToolbar, TOOLS } from './components/toolbar/LeftToolbar';
import { ToolOptionsBar } from './components/toolbar/ToolOptionsBar';
import { CanvasWorkspace } from './components/workspace/CanvasWorkspace';
import { RightPanel } from './components/panels/RightPanel';
import { BottomStatusBar } from './components/statusbar/BottomStatusBar';

import { NewDocumentDialog } from './components/dialogs/NewDocumentDialog';
import { ResizeDialog } from './components/dialogs/ResizeDialog';
import { CanvasSizeDialog } from './components/dialogs/CanvasSizeDialog';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { ShortcutsDialog } from './components/dialogs/ShortcutsDialog';
import { AboutDialog } from './components/dialogs/AboutDialog';

function App() {
  // Document state
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Active document helper
  const activeDocument = useMemo(() => {
    return documents.find((doc) => doc.id === activeDocumentId) || null;
  }, [documents, activeDocumentId]);

  // Force re-render of React tree when engine updates
  const handleUpdateDocument = useCallback(() => {
    setRenderTrigger((prev) => prev + 1);
  }, []);

  // Tool state
  const [activeTool, setActiveTool] = useState('brush');
  const [primaryColor, setPrimaryColor] = useState('#38bdf8');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');

  // Tool Options
  const [brushOptions, setBrushOptions] = useState({ size: 18, opacity: 1.0, hardness: 0.8 });
  const [eraserOptions, setEraserOptions] = useState({ size: 24, opacity: 1.0, hardness: 0.9 });
  const [textOptions, setTextOptions] = useState({
    fontFamily: 'Arial',
    fontSize: 36,
    color: '#ffffff',
    bold: false,
    italic: false,
    align: 'left'
  });
  const [shapeOptions, setShapeOptions] = useState({
    shapeType: 'rectangle',
    fill: '#38bdf8',
    stroke: '#ffffff',
    strokeWidth: 2
  });

  // Crop State
  const [cropPreset, setCropPreset] = useState('free');
  const [hasCropActive, setHasCropActive] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Viewport State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Before/After comparison
  const [isComparing, setIsComparing] = useState(false);

  // Modal Dialogs
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const [isCanvasSizeOpen, setIsCanvasSizeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Update window title when document changes
  useEffect(() => {
    const title = activeDocument ? activeDocument.name : 'LUMINA — Professional Photo Editor';
    document.title = title;
    if (window.luminaAPI && window.luminaAPI.setDocumentTitle) {
      window.luminaAPI.setDocumentTitle(activeDocument ? activeDocument.name : '');
    }
  }, [activeDocument]);

  // Create new document
  const handleCreateDocument = useCallback((opts = {}) => {
    const newDoc = new Document(opts);
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
  }, []);

  // Initialize with a default canvas on startup
  useEffect(() => {
    handleCreateDocument({ name: 'Untitled-1', width: 1200, height: 800 });
  }, [handleCreateDocument]);

  // Open image from file data
  const handleOpenImageData = useCallback((fileName, dataUrl, filePath = null) => {
    const img = new Image();
    img.onload = () => {
      const doc = new Document({
        name: fileName,
        filePath,
        initialImage: img
      });
      setDocuments((prev) => [...prev, doc]);
      setActiveDocumentId(doc.id);
    };
    img.src = dataUrl;
  }, []);

  // Open image using Electron native dialog or browser input fallback
  const handleOpenImage = useCallback(async () => {
    if (window.luminaAPI && window.luminaAPI.openFileDialog) {
      const res = await window.luminaAPI.openFileDialog();
      if (!res.canceled && res.dataUrl) {
        handleOpenImageData(res.fileName, res.dataUrl, res.filePath);
      }
    } else {
      // Browser file input fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg,image/webp,image/jpg';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            handleOpenImageData(file.name, event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }, [handleOpenImageData]);

  // Save Document
  const handleSaveDocument = useCallback(async () => {
    if (!activeDocument) return;
    try {
      const comp = activeDocument.render();
      const ext = activeDocument.filePath ? activeDocument.filePath.split('.').pop() : 'png';
      const res = await ExportEngine.exportCanvas(comp, { format: ext });
      const saveRes = await ExportEngine.saveFile(res.dataUrl, activeDocument.name, ext);
      if (saveRes.success) {
        activeDocument.isDirty = false;
        handleUpdateDocument();
      }
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  }, [activeDocument, handleUpdateDocument]);

  // Close Document
  const handleCloseDocument = useCallback((docId) => {
    const targetId = docId || activeDocumentId;
    const docToClose = documents.find((d) => d.id === targetId);

    if (docToClose && docToClose.isDirty) {
      const confirmClose = window.confirm(`"${docToClose.name}" has unsaved changes. Do you want to close it?`);
      if (!confirmClose) return;
    }

    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== targetId);
      if (activeDocumentId === targetId) {
        setActiveDocumentId(updated.length > 0 ? updated[updated.length - 1].id : null);
      }
      return updated;
    });
  }, [activeDocumentId, documents]);

  // Image Transformations
  const handleRotateCW = useCallback(() => {
    if (!activeDocument) return;
    activeDocument.layers.forEach((layer) => {
      const rotated = TransformEngine.rotateCanvas(layer.canvas, 90);
      layer.resize(rotated.width, rotated.height);
      layer.ctx.drawImage(rotated, 0, 0);
    });
    const oldW = activeDocument.width;
    activeDocument.width = activeDocument.height;
    activeDocument.height = oldW;
    activeDocument.compositor.resize(activeDocument.width, activeDocument.height);
    activeDocument.saveHistoryState('Rotate 90° CW');
    handleUpdateDocument();
  }, [activeDocument, handleUpdateDocument]);

  const handleRotateCCW = useCallback(() => {
    if (!activeDocument) return;
    activeDocument.layers.forEach((layer) => {
      const rotated = TransformEngine.rotateCanvas(layer.canvas, -90);
      layer.resize(rotated.width, rotated.height);
      layer.ctx.drawImage(rotated, 0, 0);
    });
    const oldW = activeDocument.width;
    activeDocument.width = activeDocument.height;
    activeDocument.height = oldW;
    activeDocument.compositor.resize(activeDocument.width, activeDocument.height);
    activeDocument.saveHistoryState('Rotate 90° CCW');
    handleUpdateDocument();
  }, [activeDocument, handleUpdateDocument]);

  const handleFlipH = useCallback(() => {
    if (!activeDocument) return;
    const activeLayer = activeDocument.getActiveLayer();
    if (activeLayer && !activeLayer.locked) {
      const flipped = TransformEngine.flipCanvas(activeLayer.canvas, true, false);
      activeLayer.ctx.clearRect(0, 0, activeLayer.width, activeLayer.height);
      activeLayer.ctx.drawImage(flipped, 0, 0);
      activeDocument.saveHistoryState('Flip Horizontal');
      handleUpdateDocument();
    }
  }, [activeDocument, handleUpdateDocument]);

  const handleFlipV = useCallback(() => {
    if (!activeDocument) return;
    const activeLayer = activeDocument.getActiveLayer();
    if (activeLayer && !activeLayer.locked) {
      const flipped = TransformEngine.flipCanvas(activeLayer.canvas, false, true);
      activeLayer.ctx.clearRect(0, 0, activeLayer.width, activeLayer.height);
      activeLayer.ctx.drawImage(flipped, 0, 0);
      activeDocument.saveHistoryState('Flip Vertical');
      handleUpdateDocument();
    }
  }, [activeDocument, handleUpdateDocument]);

  // Resize Image
  const handleApplyResize = useCallback((newWidth, newHeight) => {
    if (!activeDocument) return;
    activeDocument.layers.forEach((layer) => {
      const resized = TransformEngine.resizeCanvas(layer.canvas, newWidth, newHeight);
      layer.resize(newWidth, newHeight);
      layer.ctx.drawImage(resized, 0, 0);
    });
    activeDocument.width = newWidth;
    activeDocument.height = newHeight;
    activeDocument.compositor.resize(newWidth, newHeight);
    activeDocument.saveHistoryState(`Resize to ${newWidth}x${newHeight}`);
    handleUpdateDocument();
  }, [activeDocument, handleUpdateDocument]);

  // Canvas Size
  const handleApplyCanvasSize = useCallback((newWidth, newHeight, anchor) => {
    if (!activeDocument) return;
    activeDocument.layers.forEach((layer) => {
      const resized = TransformEngine.resizeCanvasBoundary(layer.canvas, newWidth, newHeight, anchor);
      layer.resize(newWidth, newHeight);
      layer.ctx.drawImage(resized, 0, 0);
    });
    activeDocument.width = newWidth;
    activeDocument.height = newHeight;
    activeDocument.compositor.resize(newWidth, newHeight);
    activeDocument.saveHistoryState(`Canvas Size ${newWidth}x${newHeight}`);
    handleUpdateDocument();
  }, [activeDocument, handleUpdateDocument]);

  // Crop Apply
  const handleApplyCrop = useCallback(() => {
    if (!activeDocument || !hasCropActive) return;
    const x1 = Math.min(cropRect.x, cropRect.x + cropRect.width);
    const y1 = Math.min(cropRect.y, cropRect.y + cropRect.height);
    const x2 = Math.max(cropRect.x, cropRect.x + cropRect.width);
    const y2 = Math.max(cropRect.y, cropRect.y + cropRect.height);

    const normX = Math.max(0, Math.min(activeDocument.width, Math.round(x1)));
    const normY = Math.max(0, Math.min(activeDocument.height, Math.round(y1)));
    const normRight = Math.max(0, Math.min(activeDocument.width, Math.round(x2)));
    const normBottom = Math.max(0, Math.min(activeDocument.height, Math.round(y2)));

    const normW = normRight - normX;
    const normH = normBottom - normY;

    if (normW > 10 && normH > 10) {
      activeDocument.layers.forEach((layer) => {
        layer.crop(normX, normY, normW, normH);
      });
      activeDocument.width = normW;
      activeDocument.height = normH;
      activeDocument.compositor.resize(normW, normH);
      activeDocument.isDirty = true;
      activeDocument.saveHistoryState(`Crop to ${normW}x${normH}`);
      setHasCropActive(false);
      setActiveTool('move');
      handleUpdateDocument();
    }
  }, [activeDocument, hasCropActive, cropRect, handleUpdateDocument]);

  const handleCancelCrop = useCallback(() => {
    setHasCropActive(false);
    setActiveTool('move');
  }, []);

  // Selection Actions
  const handleSelectAll = useCallback(() => {
    if (!activeDocument) return;
    activeDocument.selection = {
      active: true,
      type: 'rect',
      bounds: { x: 0, y: 0, width: activeDocument.width, height: activeDocument.height },
      points: []
    };
    handleUpdateDocument();
  }, [activeDocument, handleUpdateDocument]);

  const handleDeselect = useCallback(() => {
    if (!activeDocument) return;
    activeDocument.selection = { active: false, type: 'rect', bounds: { x: 0, y: 0, width: 0, height: 0 }, points: [] };
    handleUpdateDocument();
  }, [activeDocument, handleUpdateDocument]);

  const handleDeleteSelection = useCallback(() => {
    if (!activeDocument) return;
    const activeLayer = activeDocument.getActiveLayer();
    if (activeLayer && !activeLayer.locked && activeDocument.selection.active) {
      SelectionEngine.deleteSelection(activeLayer, activeDocument.selection);
      activeDocument.saveHistoryState('Delete Selection');
      handleUpdateDocument();
    }
  }, [activeDocument, handleUpdateDocument]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (activeDocument && activeDocument.undo()) {
      handleUpdateDocument();
    }
  }, [activeDocument, handleUpdateDocument]);

  const handleRedo = useCallback(() => {
    if (activeDocument && activeDocument.redo()) {
      handleUpdateDocument();
    }
  }, [activeDocument, handleUpdateDocument]);

  // Zoom Helpers
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(10.0, z * 1.25)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.05, z * 0.8)), []);
  const handleActualSize = useCallback(() => {
    if (!activeDocument) return;
    const container = window.document.querySelector('.lumina-workspace');
    setZoom(1.0);
    if (container) {
      setPan({
        x: (container.clientWidth - activeDocument.width) / 2,
        y: (container.clientHeight - activeDocument.height) / 2
      });
    }
  }, [activeDocument]);
  const handleFitScreen = useCallback(() => {
    if (!activeDocument) return;
    const container = window.document.querySelector('.lumina-workspace');
    if (container) {
      const padding = 60;
      const fitZoom = Math.min(
        1.0,
        Math.min((container.clientWidth - padding) / activeDocument.width, (container.clientHeight - padding) / activeDocument.height)
      );
      const safeZoom = Math.max(0.05, Math.min(5.0, fitZoom));
      setZoom(safeZoom);
      setPan({
        x: (container.clientWidth - activeDocument.width * safeZoom) / 2,
        y: (container.clientHeight - activeDocument.height * safeZoom) / 2
      });
    }
  }, [activeDocument]);

  // Keyboard Shortcuts dispatcher
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd) {
        if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          handleOpenImage();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          if (e.shiftKey) {
            setIsExportOpen(true);
          } else {
            handleSaveDocument();
          }
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsNewDocOpen(true);
        } else if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          handleCloseDocument();
        } else if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          handleSelectAll();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handleDeselect();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleFitScreen();
        } else if (e.key === '1') {
          e.preventDefault();
          handleActualSize();
        }
      } else {
        // Handle Crop confirmation / cancellation via keyboard
        if (hasCropActive && (e.key === 'Enter')) {
          e.preventDefault();
          handleApplyCrop();
          return;
        }
        if (hasCropActive && (e.key === 'Escape')) {
          e.preventDefault();
          handleCancelCrop();
          return;
        }

        // Single Key Tool Shortcuts
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('move'); break;
          case 'm': setActiveTool('select-rect'); break;
          case 'l': setActiveTool('select-lasso'); break;
          case 'c': setActiveTool('crop'); break;
          case 'b': setActiveTool('brush'); break;
          case 'e': setActiveTool('eraser'); break;
          case 't': setActiveTool('text'); break;
          case 'u': setActiveTool('shape'); break;
          case 'i': setActiveTool('eyedropper'); break;
          case 'h': setActiveTool('hand'); break;
          case 'z': setActiveTool('zoom'); break;
          case '\\': setIsComparing((prev) => !prev); break;
          case 'delete':
          case 'backspace':
            handleDeleteSelection();
            break;
          case 'f1':
            e.preventDefault();
            setIsShortcutsOpen(true);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hasCropActive,
    handleApplyCrop,
    handleCancelCrop,
    handleOpenImage,
    handleSaveDocument,
    handleCloseDocument,
    handleUndo,
    handleRedo,
    handleSelectAll,
    handleDeselect,
    handleDeleteSelection,
    handleFitScreen,
    handleZoomIn,
    handleZoomOut,
    handleActualSize
  ]);

  // IPC Menu Bridge from Electron Main Process
  useEffect(() => {
    if (!window.luminaAPI || !window.luminaAPI.onMenuAction) return;

    const unsubscribe = window.luminaAPI.onMenuAction((action) => {
      switch (action) {
        case 'file:new': setIsNewDocOpen(true); break;
        case 'file:open': handleOpenImage(); break;
        case 'file:save': handleSaveDocument(); break;
        case 'file:export': setIsExportOpen(true); break;
        case 'file:close': handleCloseDocument(); break;
        case 'edit:undo': handleUndo(); break;
        case 'edit:redo': handleRedo(); break;
        case 'edit:select-all': handleSelectAll(); break;
        case 'edit:deselect': handleDeselect(); break;
        case 'edit:delete-selection': handleDeleteSelection(); break;
        case 'image:rotate-cw': handleRotateCW(); break;
        case 'image:rotate-ccw': handleRotateCCW(); break;
        case 'image:flip-h': handleFlipH(); break;
        case 'image:flip-v': handleFlipV(); break;
        case 'image:resize': setIsResizeOpen(true); break;
        case 'image:canvas-size': setIsCanvasSizeOpen(true); break;
        case 'image:crop': setActiveTool('crop'); break;
        case 'layer:new': activeDocument && activeDocument.addLayer(); handleUpdateDocument(); break;
        case 'layer:duplicate': activeDocument && activeDocument.getActiveLayer() && activeDocument.duplicateLayer(activeDocument.getActiveLayer().id); handleUpdateDocument(); break;
        case 'layer:delete': activeDocument && activeDocument.getActiveLayer() && activeDocument.deleteLayer(activeDocument.getActiveLayer().id); handleUpdateDocument(); break;
        case 'view:zoom-in': handleZoomIn(); break;
        case 'view:zoom-out': handleZoomOut(); break;
        case 'view:fit-screen': handleFitScreen(); break;
        case 'view:actual-size': handleActualSize(); break;
        case 'view:toggle-comparison': setIsComparing((prev) => !prev); break;
        case 'help:shortcuts': setIsShortcutsOpen(true); break;
        case 'help:about': setIsAboutOpen(true); break;
        default: break;
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [
    handleOpenImage,
    handleSaveDocument,
    handleCloseDocument,
    handleUndo,
    handleRedo,
    handleSelectAll,
    handleDeselect,
    handleDeleteSelection,
    handleRotateCW,
    handleRotateCCW,
    handleFlipH,
    handleFlipV,
    handleFitScreen,
    handleZoomIn,
    handleZoomOut,
    handleActualSize,
    activeDocument,
    handleUpdateDocument
  ]);

  const activeToolObj = TOOLS.find((t) => t.id === activeTool) || { name: 'Brush Tool' };

  return (
    <div className="lumina-app">
      {/* Top Navigation Bar */}
      <TopNavBar
        document={activeDocument}
        canUndo={activeDocument ? activeDocument.history.canUndo() : false}
        canRedo={activeDocument ? activeDocument.history.canRedo() : false}
        zoom={zoom}
        isComparing={isComparing}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitScreen={handleFitScreen}
        onActualSize={handleActualSize}
        onToggleCompare={() => setIsComparing((prev) => !prev)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewDocument={() => setIsNewDocOpen(true)}
        onOpenImage={handleOpenImage}
        onSaveDocument={handleSaveDocument}
        onCloseDocument={() => handleCloseDocument()}
        onRotateCW={handleRotateCW}
        onRotateCCW={handleRotateCCW}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        onOpenResize={() => setIsResizeOpen(true)}
        onOpenCanvasSize={() => setIsCanvasSizeOpen(true)}
        onSelectAll={handleSelectAll}
        onDeselect={handleDeselect}
        onDeleteSelection={handleDeleteSelection}
        onNewLayer={() => { activeDocument?.addLayer(); handleUpdateDocument(); }}
        onDuplicateLayer={() => { if (activeDocument?.getActiveLayer()) activeDocument.duplicateLayer(activeDocument.getActiveLayer().id); handleUpdateDocument(); }}
        onDeleteLayer={() => { if (activeDocument?.getActiveLayer()) activeDocument.deleteLayer(activeDocument.getActiveLayer().id); handleUpdateDocument(); }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Document Tabs Bar */}
      <DocumentTabs
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelectDocument={(id) => setActiveDocumentId(id)}
        onCloseDocument={handleCloseDocument}
        onNewDocument={() => setIsNewDocOpen(true)}
      />

      {/* Tool Context Options Bar */}
      <ToolOptionsBar
        activeTool={activeTool}
        brushOptions={brushOptions}
        onChangeBrushOptions={setBrushOptions}
        eraserOptions={eraserOptions}
        onChangeEraserOptions={setEraserOptions}
        textOptions={textOptions}
        onChangeTextOptions={setTextOptions}
        shapeOptions={shapeOptions}
        onChangeShapeOptions={setShapeOptions}
        cropPreset={cropPreset}
        onChangeCropPreset={setCropPreset}
        onApplyCrop={handleApplyCrop}
        onCancelCrop={handleCancelCrop}
        hasCropActive={hasCropActive}
      />

      {/* Main Workspace Area */}
      <div className="lumina-main-area">
        {/* Left Toolbar */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onChangePrimaryColor={setPrimaryColor}
          onChangeSecondaryColor={setSecondaryColor}
        />

        {/* Central Canvas Viewport */}
        <div className="lumina-workspace-column">
          <CanvasWorkspace
            document={activeDocument}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            brushOptions={brushOptions}
            eraserOptions={eraserOptions}
            textOptions={textOptions}
            shapeOptions={shapeOptions}
            cropPreset={cropPreset}
            isComparing={isComparing}
            onUpdateDocument={handleUpdateDocument}
            onSampleColor={(col) => setPrimaryColor(col)}
            onCursorMove={(x, y) => setCursorPos({ x, y })}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            onOpenImage={handleOpenImage}
            onNewDocument={(opts) => {
              if (opts && opts.initialImage) {
                handleCreateDocument(opts);
              } else {
                setIsNewDocOpen(true);
              }
            }}
            hasCropActive={hasCropActive}
            setHasCropActive={setHasCropActive}
            cropRect={cropRect}
            setCropRect={setCropRect}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
            renderTrigger={renderTrigger}
          />
        </div>

        {/* Right Properties & Adjustments Panel */}
        <RightPanel
          document={activeDocument}
          onUpdateDocument={handleUpdateDocument}
        />
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar
        document={activeDocument}
        zoom={zoom}
        cursorPos={cursorPos}
        activeToolName={activeToolObj.name}
      />

      {/* Modals */}
      <NewDocumentDialog
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        onCreate={handleCreateDocument}
      />

      <ResizeDialog
        isOpen={isResizeOpen}
        onClose={() => setIsResizeOpen(false)}
        document={activeDocument}
        onResize={handleApplyResize}
      />

      <CanvasSizeDialog
        isOpen={isCanvasSizeOpen}
        onClose={() => setIsCanvasSizeOpen(false)}
        document={activeDocument}
        onCanvasSize={handleApplyCanvasSize}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        document={activeDocument}
      />

      <ShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <AboutDialog
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

export default App;
