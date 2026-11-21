import React from 'react';
import { Icon } from '../common/Icons';

export const ToolOptionsBar = ({
  activeTool,
  brushOptions,
  onChangeBrushOptions,
  eraserOptions,
  onChangeEraserOptions,
  textOptions,
  onChangeTextOptions,
  shapeOptions,
  onChangeShapeOptions,
  cropPreset,
  onChangeCropPreset,
  onApplyCrop,
  onCancelCrop,
  hasCropActive
}) => {
  return (
    <div className="lumina-options-bar">
      {/* Brush Tool Options */}
      {activeTool === 'brush' && (
        <>
          <div className="lumina-option-item">
            <span className="lumina-option-label">Size:</span>
            <input
              type="range"
              min="1"
              max="200"
              value={brushOptions.size}
              onChange={(e) => onChangeBrushOptions({ ...brushOptions, size: parseInt(e.target.value) })}
              style={{ width: 80 }}
            />
            <input
              type="number"
              className="lumina-option-input-num"
              value={brushOptions.size}
              min="1"
              max="200"
              onChange={(e) => onChangeBrushOptions({ ...brushOptions, size: parseInt(e.target.value) || 1 })}
            />
            <span style={{ fontSize: 10 }}>px</span>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Opacity:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={Math.round(brushOptions.opacity * 100)}
              onChange={(e) => onChangeBrushOptions({ ...brushOptions, opacity: parseInt(e.target.value) / 100 })}
              style={{ width: 70 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {Math.round(brushOptions.opacity * 100)}%
            </span>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Hardness:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(brushOptions.hardness * 100)}
              onChange={(e) => onChangeBrushOptions({ ...brushOptions, hardness: parseInt(e.target.value) / 100 })}
              style={{ width: 70 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {Math.round(brushOptions.hardness * 100)}%
            </span>
          </div>
        </>
      )}

      {/* Eraser Tool Options */}
      {activeTool === 'eraser' && (
        <>
          <div className="lumina-option-item">
            <span className="lumina-option-label">Size:</span>
            <input
              type="range"
              min="1"
              max="200"
              value={eraserOptions.size}
              onChange={(e) => onChangeEraserOptions({ ...eraserOptions, size: parseInt(e.target.value) })}
              style={{ width: 80 }}
            />
            <input
              type="number"
              className="lumina-option-input-num"
              value={eraserOptions.size}
              min="1"
              max="200"
              onChange={(e) => onChangeEraserOptions({ ...eraserOptions, size: parseInt(e.target.value) || 1 })}
            />
            <span style={{ fontSize: 10 }}>px</span>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Opacity:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={Math.round(eraserOptions.opacity * 100)}
              onChange={(e) => onChangeEraserOptions({ ...eraserOptions, opacity: parseInt(e.target.value) / 100 })}
              style={{ width: 70 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {Math.round(eraserOptions.opacity * 100)}%
            </span>
          </div>
        </>
      )}

      {/* Text Tool Options */}
      {activeTool === 'text' && (
        <>
          <div className="lumina-option-item">
            <span className="lumina-option-label">Font:</span>
            <select
              className="lumina-select"
              value={textOptions.fontFamily}
              onChange={(e) => onChangeTextOptions({ ...textOptions, fontFamily: e.target.value })}
            >
              <option value="Arial">Arial</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
              <option value="Impact">Impact</option>
            </select>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Size:</span>
            <input
              type="number"
              className="lumina-option-input-num"
              value={textOptions.fontSize}
              min="8"
              max="200"
              onChange={(e) => onChangeTextOptions({ ...textOptions, fontSize: parseInt(e.target.value) || 12 })}
            />
            <span style={{ fontSize: 10 }}>pt</span>
          </div>

          <div className="lumina-option-item">
            <button
              className={`lumina-btn small ${textOptions.bold ? 'primary' : ''}`}
              onClick={() => onChangeTextOptions({ ...textOptions, bold: !textOptions.bold })}
              style={{ fontWeight: 'bold' }}
            >
              B
            </button>
            <button
              className={`lumina-btn small ${textOptions.italic ? 'primary' : ''}`}
              onClick={() => onChangeTextOptions({ ...textOptions, italic: !textOptions.italic })}
              style={{ fontStyle: 'italic' }}
            >
              I
            </button>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Color:</span>
            <input
              type="color"
              value={textOptions.color}
              onChange={(e) => onChangeTextOptions({ ...textOptions, color: e.target.value })}
              style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        </>
      )}

      {/* Shape Tool Options */}
      {activeTool === 'shape' && (
        <>
          <div className="lumina-option-item">
            <span className="lumina-option-label">Type:</span>
            <select
              className="lumina-select"
              value={shapeOptions.shapeType}
              onChange={(e) => onChangeShapeOptions({ ...shapeOptions, shapeType: e.target.value })}
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Ellipse / Circle</option>
              <option value="line">Line</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Fill:</span>
            <input
              type="color"
              value={shapeOptions.fill === 'transparent' ? '#38bdf8' : shapeOptions.fill}
              onChange={(e) => onChangeShapeOptions({ ...shapeOptions, fill: e.target.value })}
              style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <button
              className={`lumina-btn small ${shapeOptions.fill === 'transparent' ? 'primary' : ''}`}
              onClick={() => onChangeShapeOptions({ ...shapeOptions, fill: shapeOptions.fill === 'transparent' ? '#38bdf8' : 'transparent' })}
            >
              None
            </button>
          </div>

          <div className="lumina-option-item">
            <span className="lumina-option-label">Stroke:</span>
            <input
              type="color"
              value={shapeOptions.stroke === 'transparent' ? '#ffffff' : shapeOptions.stroke}
              onChange={(e) => onChangeShapeOptions({ ...shapeOptions, stroke: e.target.value })}
              style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <input
              type="number"
              className="lumina-option-input-num"
              value={shapeOptions.strokeWidth}
              min="0"
              max="50"
              onChange={(e) => onChangeShapeOptions({ ...shapeOptions, strokeWidth: parseInt(e.target.value) || 0 })}
            />
            <span style={{ fontSize: 10 }}>px</span>
          </div>
        </>
      )}

      {/* Crop Tool Options */}
      {activeTool === 'crop' && (
        <>
          <div className="lumina-option-item">
            <span className="lumina-option-label">Aspect Ratio:</span>
            <select
              className="lumina-select"
              value={cropPreset}
              onChange={(e) => onChangeCropPreset(e.target.value)}
            >
              <option value="free">Freeform</option>
              <option value="1:1">1:1 Square</option>
              <option value="4:3">4:3 Standard</option>
              <option value="16:9">16:9 Widescreen</option>
              <option value="3:2">3:2 Classic Photo</option>
            </select>
          </div>

          {hasCropActive && (
            <div className="lumina-option-item" style={{ marginLeft: 10 }}>
              <button className="lumina-btn primary small" onClick={onApplyCrop}>
                <Icon name="check" size={13} />
                <span>Apply Crop</span>
              </button>
              <button className="lumina-btn small" onClick={onCancelCrop}>
                <Icon name="close" size={13} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Selection Options */}
      {(activeTool === 'select-rect' || activeTool === 'select-lasso') && (
        <div className="lumina-option-item">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Drag on canvas to define selection. Press Del to erase selected region. Ctrl+D to deselect.
          </span>
        </div>
      )}

      {/* Eyedropper / Move / Hand / Zoom Hints */}
      {activeTool === 'move' && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Click and drag the active layer to reposition it on the canvas.
        </span>
      )}
      {activeTool === 'eyedropper' && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Click anywhere on the image to sample pixel color.
        </span>
      )}
      {activeTool === 'hand' && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Click and drag to pan canvas viewport. Spacebar hold also activates hand tool.
        </span>
      )}
      {activeTool === 'zoom' && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Click to Zoom In. Alt+Click to Zoom Out. Mouse wheel to zoom smoothly.
        </span>
      )}
    </div>
  );
};
