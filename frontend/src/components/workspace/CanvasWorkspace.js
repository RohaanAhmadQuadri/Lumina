import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingEngine } from '../../engine/DrawingEngine';
import { Icon } from '../common/Icons';

export const CanvasWorkspace = ({
  document,
  activeTool,
  primaryColor,
  secondaryColor,
  brushOptions,
  eraserOptions,
  textOptions,
  shapeOptions,
  cropPreset,
  isComparing,
  onUpdateDocument,
  onSampleColor,
  onCursorMove,
  zoom,
  setZoom,
  pan,
  setPan,
  onOpenImage,
  onNewDocument,
  hasCropActive,
  setHasCropActive,
  cropRect,
  setCropRect,
  onApplyCrop,
  onCancelCrop,
  renderTrigger
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isInteracting = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastPoint = useRef({ x: 0, y: 0 });
  const cropDragMode = useRef(null); // 'move', 'tl', 'tr', 'bl', 'br', 'tc', 'bc', 'lc', 'rc', 'new'
  const cropStartPt = useRef({ x: 0, y: 0 });
  const origCropRect = useRef(null);
  const prevToolRef = useRef(activeTool);

  const [mouseScreenPos, setMouseScreenPos] = useState({ x: -100, y: -100, visible: false });
  const [shapePreview, setShapePreview] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Initial Auto-Fit & Centering when document opens or changes
  const fitToScreen = useCallback(() => {
    if (!document || !containerRef.current) return;
    const container = containerRef.current;
    const padding = 60;
    const availW = Math.max(100, container.clientWidth - padding);
    const availH = Math.max(100, container.clientHeight - padding);

    const fitZoom = Math.min(1.0, Math.min(availW / document.width, availH / document.height));
    const initZoom = Math.max(0.05, Math.min(5.0, fitZoom));

    setZoom(initZoom);
    setPan({
      x: (container.clientWidth - document.width * initZoom) / 2,
      y: (container.clientHeight - document.height * initZoom) / 2
    });
  }, [document, setPan, setZoom]);

  useEffect(() => {
    if (document) {
      fitToScreen();
    }
  }, [document, document?.width, document?.height, fitToScreen]);

  // When switching to crop tool, initialize crop bounds if switching into it
  useEffect(() => {
    if (activeTool === 'crop' && prevToolRef.current !== 'crop' && document) {
      setHasCropActive(true);
      setCropRect({
        x: Math.round(document.width * 0.05),
        y: Math.round(document.height * 0.05),
        width: Math.round(document.width * 0.9),
        height: Math.round(document.height * 0.9)
      });
    }
    prevToolRef.current = activeTool;
  }, [activeTool, document, setHasCropActive, setCropRect]);

  // Main Canvas Render
  const renderWorkspaceCanvas = useCallback(() => {
    if (!document || !canvasRef.current) return;
    const canvas = canvasRef.current;
    if (canvas.width !== document.width) canvas.width = document.width;
    if (canvas.height !== document.height) canvas.height = document.height;
    const ctx = canvas.getContext('2d');

    if (isComparing) {
      const orig = document.renderOriginal();
      ctx.drawImage(orig, 0, 0);
    } else {
      const comp = document.render();
      ctx.drawImage(comp, 0, 0);
    }
  }, [document, isComparing]);

  useEffect(() => {
    renderWorkspaceCanvas();
  }, [
    renderWorkspaceCanvas,
    renderTrigger,
    document?.width,
    document?.height,
    document?.isDirty,
    document?.adjustments,
    document?.filterId,
    document?.filterIntensity
  ]);

  // Exact Pixel-Perfect Coordinate Mapping
  const getCanvasCoords = (e) => {
    if (!canvasRef.current || !document) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };

    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    return {
      x: normX * document.width,
      y: normY * document.height
    };
  };

  // Wheel Zoom Towards Mouse Pointer
  const handleWheel = (e) => {
    if (!document || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Canvas coordinate currently under cursor:
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;

    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.05, Math.min(10.0, zoom * factor));

    // Keep point under cursor invariant
    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Mouse Down
  const handleMouseDown = (e) => {
    if (!document) return;

    // Panning (Hand tool or middle-click or spacebar)
    if (e.button === 1 || activeTool === 'hand' || e.spaceKey) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return; // Only primary button for editing

    const pt = getCanvasCoords(e);
    isInteracting.current = true;
    lastPoint.current = pt;

    // Eyedropper tool
    if (activeTool === 'eyedropper') {
      const activeLayer = document.getActiveLayer();
      if (activeLayer) {
        const sampled = DrawingEngine.sampleColor(activeLayer.ctx, pt.x - activeLayer.x, pt.y - activeLayer.y);
        onSampleColor(sampled.hex);
      }
      return;
    }

    // Zoom tool
    if (activeTool === 'zoom') {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const canvasX = (mouseX - pan.x) / zoom;
      const canvasY = (mouseY - pan.y) / zoom;

      const factor = e.altKey ? 0.75 : 1.33;
      const newZoom = Math.max(0.05, Math.min(10.0, zoom * factor));
      setZoom(newZoom);
      setPan({
        x: mouseX - canvasX * newZoom,
        y: mouseY - canvasY * newZoom
      });
      return;
    }

    // Crop Tool Handle or Box Drag
    if (activeTool === 'crop') {
      const target = e.target;
      const handleType = target.dataset?.handle;

      if (handleType) {
        cropDragMode.current = handleType;
        cropStartPt.current = pt;
        origCropRect.current = { ...cropRect };
        return;
      }

      if (target.closest('.lumina-crop-box')) {
        cropDragMode.current = 'move';
        cropStartPt.current = pt;
        origCropRect.current = { ...cropRect };
        return;
      }

      // Clicked outside existing box -> start new crop box
      cropDragMode.current = 'new';
      cropStartPt.current = pt;
      setHasCropActive(true);
      setCropRect({ x: pt.x, y: pt.y, width: 0, height: 0 });
      return;
    }

    // Selection Marquee / Lasso
    if (activeTool === 'select-rect' || activeTool === 'select-lasso') {
      document.selection = {
        active: true,
        type: activeTool === 'select-rect' ? 'rect' : 'lasso',
        bounds: { x: pt.x, y: pt.y, width: 0, height: 0 },
        points: [pt]
      };
      onUpdateDocument();
      return;
    }

    // Brush or Eraser Initial Dab
    if (activeTool === 'brush' || activeTool === 'eraser') {
      const activeLayer = document.getActiveLayer();
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;

      const opts = activeTool === 'brush' ? {
        size: brushOptions.size,
        color: primaryColor,
        opacity: brushOptions.opacity,
        hardness: brushOptions.hardness,
        isEraser: false
      } : {
        size: eraserOptions.size,
        opacity: eraserOptions.opacity,
        hardness: eraserOptions.hardness,
        isEraser: true
      };

      const relPt = { x: pt.x - activeLayer.x, y: pt.y - activeLayer.y };
      DrawingEngine.drawStroke(activeLayer.ctx, relPt, relPt, opts);

      // Instant onscreen rendering
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.save();
        ctx.globalAlpha = activeLayer.opacity;
        ctx.globalCompositeOperation = activeLayer.blendMode || 'source-over';
        DrawingEngine.drawStroke(ctx, pt, pt, opts);
        ctx.restore();
      }
      return;
    }

    // Text Tool Insertion
    if (activeTool === 'text') {
      const textToInsert = prompt('Enter text to insert:', 'LUMINA Photo Editor');
      if (textToInsert && textToInsert.trim()) {
        const textLayer = document.addLayer({
          name: `Text (${textToInsert.slice(0, 8)}...)`,
          type: 'text',
          x: Math.round(pt.x),
          y: Math.round(pt.y),
          textConfig: {
            ...textOptions,
            text: textToInsert.trim()
          }
        });
        textLayer.renderText();
        document.saveHistoryState('Insert Text');
        onUpdateDocument();
        renderWorkspaceCanvas();
      }
    }
  };

  // Mouse Move
  const handleMouseMove = (e) => {
    // Update cursor position and visual ring
    setMouseScreenPos({ x: e.clientX, y: e.clientY, visible: true });
    const pt = getCanvasCoords(e);
    onCursorMove(Math.round(pt.x), Math.round(pt.y));

    // Panning
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      panStart.current = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (!isInteracting.current || !document) return;

    // Move Layer Tool
    if (activeTool === 'move') {
      const activeLayer = document.getActiveLayer();
      if (activeLayer && !activeLayer.locked) {
        const dx = pt.x - lastPoint.current.x;
        const dy = pt.y - lastPoint.current.y;
        activeLayer.x += dx;
        activeLayer.y += dy;
        lastPoint.current = pt;
        renderWorkspaceCanvas();
      }
      return;
    }

    // Brush or Eraser Stroke
    if (activeTool === 'brush' || activeTool === 'eraser') {
      const activeLayer = document.getActiveLayer();
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;

      const opts = activeTool === 'brush' ? {
        size: brushOptions.size,
        color: primaryColor,
        opacity: brushOptions.opacity,
        hardness: brushOptions.hardness,
        isEraser: false
      } : {
        size: eraserOptions.size,
        opacity: eraserOptions.opacity,
        hardness: eraserOptions.hardness,
        isEraser: true
      };

      const p1 = { x: lastPoint.current.x - activeLayer.x, y: lastPoint.current.y - activeLayer.y };
      const p2 = { x: pt.x - activeLayer.x, y: pt.y - activeLayer.y };
      DrawingEngine.drawStroke(activeLayer.ctx, p1, p2, opts);

      // Instant onscreen rendering
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.save();
        ctx.globalAlpha = activeLayer.opacity;
        ctx.globalCompositeOperation = activeLayer.blendMode || 'source-over';
        DrawingEngine.drawStroke(ctx, lastPoint.current, pt, opts);
        ctx.restore();
      }

      lastPoint.current = pt;
      return;
    }

    // Shape Drag Preview
    if (activeTool === 'shape') {
      setShapePreview({
        start: lastPoint.current,
        current: pt,
        options: shapeOptions
      });
      return;
    }

    // Crop Drag Operations
    if (activeTool === 'crop' && cropDragMode.current) {
      const mode = cropDragMode.current;
      const start = cropStartPt.current;
      const orig = origCropRect.current;

      if (mode === 'move' && orig) {
        const dx = pt.x - start.x;
        const dy = pt.y - start.y;
        setCropRect({
          x: Math.max(0, Math.min(document.width - orig.width, orig.x + dx)),
          y: Math.max(0, Math.min(document.height - orig.height, orig.y + dy)),
          width: orig.width,
          height: orig.height
        });
      } else if (mode === 'new') {
        let w = pt.x - start.x;
        let h = pt.y - start.y;
        if (cropPreset === '1:1') {
          const s = Math.max(Math.abs(w), Math.abs(h));
          w = w < 0 ? -s : s;
          h = h < 0 ? -s : s;
        }
        setCropRect({
          x: w < 0 ? pt.x : start.x,
          y: h < 0 ? pt.y : start.y,
          width: Math.abs(w),
          height: Math.abs(h)
        });
      } else if (orig) {
        // Handle resizing
        let nx = orig.x;
        let ny = orig.y;
        let nw = orig.width;
        let nh = orig.height;
        const dx = pt.x - start.x;
        const dy = pt.y - start.y;

        if (mode.includes('l')) { nx = orig.x + dx; nw = orig.width - dx; }
        if (mode.includes('r')) { nw = orig.width + dx; }
        if (mode.includes('t')) { ny = orig.y + dy; nh = orig.height - dy; }
        if (mode.includes('b')) { nh = orig.height + dy; }

        if (nw > 10 && nh > 10) {
          setCropRect({ x: nx, y: ny, width: nw, height: nh });
        }
      }
      return;
    }

    // Selection Drag
    if (activeTool === 'select-rect') {
      const sx = Math.min(lastPoint.current.x, pt.x);
      const sy = Math.min(lastPoint.current.y, pt.y);
      const sw = Math.abs(pt.x - lastPoint.current.x);
      const sh = Math.abs(pt.y - lastPoint.current.y);

      document.selection = {
        active: true,
        type: 'rect',
        bounds: { x: sx, y: sy, width: sw, height: sh },
        points: []
      };
      onUpdateDocument();
      return;
    }

    if (activeTool === 'select-lasso') {
      document.selection.points.push(pt);
      onUpdateDocument();
      return;
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    isPanning.current = false;

    if (!isInteracting.current || !document) return;
    isInteracting.current = false;
    cropDragMode.current = null;

    if (activeTool === 'brush') {
      document.saveHistoryState('Brush Stroke');
      onUpdateDocument();
      renderWorkspaceCanvas();
    } else if (activeTool === 'eraser') {
      document.saveHistoryState('Eraser Stroke');
      onUpdateDocument();
      renderWorkspaceCanvas();
    } else if (activeTool === 'move') {
      document.saveHistoryState('Move Layer');
      onUpdateDocument();
      renderWorkspaceCanvas();
    } else if (activeTool === 'shape' && shapePreview) {
      const activeLayer = document.getActiveLayer();
      if (activeLayer && !activeLayer.locked) {
        DrawingEngine.drawShape(activeLayer.ctx, shapePreview.start, shapePreview.current, shapeOptions);
        document.saveHistoryState(`Draw ${shapeOptions.shapeType}`);
        setShapePreview(null);
        onUpdateDocument();
        renderWorkspaceCanvas();
      }
    }
  };

  const handleMouseLeave = () => {
    isInteracting.current = false;
    isPanning.current = false;
    setMouseScreenPos((prev) => ({ ...prev, visible: false }));
  };

  // Drag and Drop files
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            onNewDocument({
              name: file.name,
              initialImage: img
            });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Render brush ring diameter in on-screen pixels
  const brushDiameterScreen = (activeTool === 'brush' ? brushOptions.size : eraserOptions.size) * zoom;

  if (!document) {
    return (
      <div
        className="lumina-workspace"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="lumina-empty-state">
          <div className={`lumina-empty-card ${isDraggingOver ? 'drag-over' : ''}`}>
            <Icon name="image" size={54} color="var(--accent-primary)" />
            <div className="lumina-empty-title">Welcome to LUMINA</div>
            <div className="lumina-empty-desc">
              Open an existing photo or create a new blank canvas to begin professional editing.
            </div>
            <div className="lumina-empty-actions">
              <button className="lumina-btn primary" onClick={onOpenImage}>
                <Icon name="upload" size={14} />
                <span>Open Image</span>
              </button>
              <button className="lumina-btn" onClick={() => onNewDocument()}>
                <Icon name="plus" size={14} />
                <span>New Canvas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normCrop = (hasCropActive && document) ? (() => {
    const x1 = Math.min(cropRect.x, cropRect.x + cropRect.width);
    const y1 = Math.min(cropRect.y, cropRect.y + cropRect.height);
    const x2 = Math.max(cropRect.x, cropRect.x + cropRect.width);
    const y2 = Math.max(cropRect.y, cropRect.y + cropRect.height);
    const nx = Math.max(0, Math.min(document.width, Math.round(x1)));
    const ny = Math.max(0, Math.min(document.height, Math.round(y1)));
    const nw = Math.max(0, Math.min(document.width, Math.round(x2))) - nx;
    const nh = Math.max(0, Math.min(document.height, Math.round(y2))) - ny;
    return { x: nx, y: ny, width: nw, height: nh };
  })() : null;

  return (
    <div
      ref={containerRef}
      className={`lumina-workspace tool-${activeTool}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Photoshop Brush Size Ring Indicator */}
      {(activeTool === 'brush' || activeTool === 'eraser') && mouseScreenPos.visible && brushDiameterScreen > 3 && (
        <div
          className="lumina-brush-cursor-circle"
          style={{
            left: mouseScreenPos.x,
            top: mouseScreenPos.y,
            width: brushDiameterScreen,
            height: brushDiameterScreen
          }}
        />
      )}

      {/* Viewport Transform Stage */}
      <div
        className="lumina-canvas-viewport"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          width: document.width,
          height: document.height
        }}
      >
        <div
          className="lumina-canvas-container lumina-checkerboard"
          style={{
            width: document.width,
            height: document.height
          }}
        >
          <canvas
            ref={canvasRef}
            className="lumina-render-canvas"
            width={document.width}
            height={document.height}
          />

          {/* Live Shape Preview Overlay */}
          {shapePreview && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: document.width,
                height: document.height,
                pointerEvents: 'none'
              }}
            >
              {shapePreview.options.shapeType === 'rectangle' && (
                <rect
                  x={Math.min(shapePreview.start.x, shapePreview.current.x)}
                  y={Math.min(shapePreview.start.y, shapePreview.current.y)}
                  width={Math.abs(shapePreview.current.x - shapePreview.start.x)}
                  height={Math.abs(shapePreview.current.y - shapePreview.start.y)}
                  fill={shapePreview.options.fill}
                  stroke={shapePreview.options.stroke}
                  strokeWidth={shapePreview.options.strokeWidth}
                />
              )}
              {shapePreview.options.shapeType === 'circle' && (
                <ellipse
                  cx={(shapePreview.start.x + shapePreview.current.x) / 2}
                  cy={(shapePreview.start.y + shapePreview.current.y) / 2}
                  rx={Math.abs(shapePreview.current.x - shapePreview.start.x) / 2}
                  ry={Math.abs(shapePreview.current.y - shapePreview.start.y) / 2}
                  fill={shapePreview.options.fill}
                  stroke={shapePreview.options.stroke}
                  strokeWidth={shapePreview.options.strokeWidth}
                />
              )}
              {shapePreview.options.shapeType === 'line' && (
                <line
                  x1={shapePreview.start.x}
                  y1={shapePreview.start.y}
                  x2={shapePreview.current.x}
                  y2={shapePreview.current.y}
                  stroke={shapePreview.options.stroke}
                  strokeWidth={shapePreview.options.strokeWidth}
                />
              )}
            </svg>
          )}

          {/* Interactive Crop Box Overlay */}
          {activeTool === 'crop' && hasCropActive && normCrop && normCrop.width > 5 && normCrop.height > 5 && (
            <div className="lumina-crop-overlay">
              <div
                className="lumina-crop-box"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (onApplyCrop) onApplyCrop();
                }}
                style={{
                  left: normCrop.x,
                  top: normCrop.y,
                  width: normCrop.width,
                  height: normCrop.height
                }}
              >
                <div className="lumina-crop-grid-h1" />
                <div className="lumina-crop-grid-h2" />
                <div className="lumina-crop-grid-v1" />
                <div className="lumina-crop-grid-v2" />

                <div className="lumina-crop-handle tl" data-handle="tl" />
                <div className="lumina-crop-handle tr" data-handle="tr" />
                <div className="lumina-crop-handle bl" data-handle="bl" />
                <div className="lumina-crop-handle br" data-handle="br" />
                <div className="lumina-crop-handle tc" data-handle="tc" />
                <div className="lumina-crop-handle bc" data-handle="bc" />
                <div className="lumina-crop-handle lc" data-handle="lc" />
                <div className="lumina-crop-handle rc" data-handle="rc" />
              </div>
            </div>
          )}

          {/* Selection Marching Ants Box */}
          {document.selection && document.selection.active && document.selection.type === 'rect' && (
            <div
              className="lumina-selection-box"
              style={{
                left: document.selection.bounds.x,
                top: document.selection.bounds.y,
                width: document.selection.bounds.width,
                height: document.selection.bounds.height
              }}
            />
          )}

          {/* Lasso Selection Polygon */}
          {document.selection && document.selection.active && document.selection.type === 'lasso' && document.selection.points.length > 1 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: document.width,
                height: document.height,
                pointerEvents: 'none'
              }}
            >
              <polyline
                points={document.selection.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="rgba(56, 189, 248, 0.15)"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
