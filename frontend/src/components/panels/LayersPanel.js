import React, { useState } from 'react';
import { Icon } from '../common/Icons';

export const BLEND_MODES = [
  { id: 'source-over', label: 'Normal' },
  { id: 'multiply', label: 'Multiply' },
  { id: 'screen', label: 'Screen' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'darken', label: 'Darken' },
  { id: 'lighten', label: 'Lighten' },
  { id: 'color-dodge', label: 'Color Dodge' },
  { id: 'color-burn', label: 'Color Burn' },
  { id: 'hard-light', label: 'Hard Light' },
  { id: 'soft-light', label: 'Soft Light' },
  { id: 'difference', label: 'Difference' },
  { id: 'exclusion', label: 'Exclusion' }
];

export const LayersPanel = ({ document, onUpdateDocument }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  if (!document) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No active document</div>;
  }

  const activeLayer = document.getActiveLayer();

  const handleSelectLayer = (id) => {
    document.setActiveLayer(id);
    onUpdateDocument();
  };

  const handleAddLayer = (type = 'raster') => {
    document.addLayer({ type });
    onUpdateDocument();
  };

  const handleDeleteLayer = (id) => {
    document.deleteLayer(id);
    onUpdateDocument();
  };

  const handleDuplicateLayer = (id) => {
    document.duplicateLayer(id);
    onUpdateDocument();
  };

  const handleToggleVisibility = (layer) => {
    layer.visible = !layer.visible;
    document.isDirty = true;
    onUpdateDocument();
  };

  const handleToggleLock = (layer) => {
    layer.locked = !layer.locked;
    document.isDirty = true;
    onUpdateDocument();
  };

  const handleOpacityChange = (val) => {
    if (activeLayer) {
      activeLayer.opacity = val;
      document.isDirty = true;
      onUpdateDocument();
    }
  };

  const handleBlendModeChange = (mode) => {
    if (activeLayer) {
      activeLayer.blendMode = mode;
      document.isDirty = true;
      document.saveHistoryState(`Change Blend Mode to ${mode}`);
      onUpdateDocument();
    }
  };

  const handleMoveUp = (index) => {
    if (index < document.layers.length - 1) {
      document.reorderLayers(index, index + 1);
      onUpdateDocument();
    }
  };

  const handleMoveDown = (index) => {
    if (index > 0) {
      document.reorderLayers(index, index - 1);
      onUpdateDocument();
    }
  };

  const startRename = (layer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const saveRename = (layer) => {
    if (editName.trim()) {
      layer.name = editName.trim();
      document.saveHistoryState(`Rename layer to ${layer.name}`);
      document.isDirty = true;
      onUpdateDocument();
    }
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* Active Layer Controls (Opacity & Blend Mode) */}
      {activeLayer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Blend Mode:</span>
            <select
              className="lumina-select"
              value={activeLayer.blendMode || 'source-over'}
              onChange={(e) => handleBlendModeChange(e.target.value)}
              style={{ flex: 1, height: 26, padding: '2px 20px 2px 6px' }}
            >
              {BLEND_MODES.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(activeLayer.opacity * 100)}
              onChange={(e) => handleOpacityChange(parseInt(e.target.value) / 100)}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 36, textAlign: 'right' }}>
              {Math.round(activeLayer.opacity * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="lumina-layers-controls">
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Layers ({document.layers.length})
        </span>
        <div className="lumina-layer-actions">
          <button className="lumina-btn icon-only small" onClick={() => handleAddLayer('raster')} title="New Raster Layer">
            <Icon name="plus" size={13} />
          </button>
          <button
            className="lumina-btn icon-only small"
            onClick={() => activeLayer && handleDuplicateLayer(activeLayer.id)}
            disabled={!activeLayer}
            title="Duplicate Layer"
          >
            <Icon name="copy" size={13} />
          </button>
          <button
            className="lumina-btn icon-only small danger"
            onClick={() => activeLayer && handleDeleteLayer(activeLayer.id)}
            disabled={!activeLayer || document.layers.length <= 1}
            title="Delete Layer"
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>

      {/* Layers List (Top of stack rendered at top) */}
      <div className="lumina-layers-list">
        {[...document.layers].reverse().map((layer, reverseIdx) => {
          const actualIdx = document.layers.length - 1 - reverseIdx;
          const isActive = layer.id === document.activeLayerId;

          return (
            <div
              key={layer.id}
              className={`lumina-layer-item ${isActive ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
              onClick={() => handleSelectLayer(layer.id)}
            >
              {/* Visibility Eye */}
              <button
                className={`lumina-layer-btn ${layer.visible ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(layer);
                }}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                <Icon name={layer.visible ? 'eye' : 'eye-off'} size={14} />
              </button>

              {/* Thumbnail */}
              <div className="lumina-layer-thumb lumina-checkerboard">
                <img src={layer.getThumbnail(40)} alt="" />
              </div>

              {/* Title / Renaming */}
              <div className="lumina-layer-info">
                {editingId === layer.id ? (
                  <input
                    type="text"
                    className="lumina-input"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveRename(layer)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(layer);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: '2px 4px', fontSize: 11 }}
                  />
                ) : (
                  <span
                    className="lumina-layer-name"
                    onDoubleClick={() => startRename(layer)}
                    title="Double-click to rename"
                  >
                    {layer.name}
                  </span>
                )}
                <span className="lumina-layer-meta">
                  {layer.type.toUpperCase()} • {Math.round(layer.opacity * 100)}%
                </span>
              </div>

              {/* Reorder Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  className="lumina-layer-btn"
                  style={{ padding: 1 }}
                  disabled={actualIdx === document.layers.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(actualIdx);
                  }}
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  className="lumina-layer-btn"
                  style={{ padding: 1 }}
                  disabled={actualIdx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(actualIdx);
                  }}
                  title="Move Down"
                >
                  ▼
                </button>
              </div>

              {/* Lock Toggle */}
              <button
                className={`lumina-layer-btn ${layer.locked ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock(layer);
                }}
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                <Icon name={layer.locked ? 'lock' : 'unlock'} size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
