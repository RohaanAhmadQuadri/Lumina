import React, { useState } from 'react';
import { Icon } from '../common/Icons';

export const TopNavBar = ({
  document,
  canUndo,
  canRedo,
  zoom,
  isComparing,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onActualSize,
  onToggleCompare,
  onOpenExport,
  onNewDocument,
  onOpenImage,
  onSaveDocument,
  onCloseDocument,
  onRotateCW,
  onRotateCCW,
  onFlipH,
  onFlipV,
  onOpenResize,
  onOpenCanvasSize,
  onSelectAll,
  onDeselect,
  onDeleteSelection,
  onNewLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onOpenShortcuts,
  onOpenAbout
}) => {
  const [openMenu, setOpenMenu] = useState(null);

  const handleMenuClick = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const closeMenu = () => setOpenMenu(null);

  return (
    <div className="lumina-topbar">
      {/* Left: Branding & App Menus */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="lumina-brand">
          <div className="lumina-brand-logo">
            <Icon name="lumina" size={16} color="#ffffff" />
          </div>
          <span className="lumina-brand-title">LUMINA</span>
          <span className="lumina-brand-badge">PRO</span>
        </div>

        <nav className="lumina-menu-bar" onMouseLeave={closeMenu}>
          {/* File Menu */}
          <div style={{ position: 'relative' }}>
            <button className="lumina-menu-btn" onClick={() => handleMenuClick('file')}>
              File
            </button>
            {openMenu === 'file' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 180,
                  zIndex: 200,
                  padding: '4px 0'
                }}
              >
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%' }}
                  onClick={() => { closeMenu(); onNewDocument(); }}
                >
                  <span>New Document...</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+N</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%' }}
                  onClick={() => { closeMenu(); onOpenImage(); }}
                >
                  <span>Open Image...</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+O</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onSaveDocument(); } }}
                >
                  <span>Save</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+S</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onOpenExport(); } }}
                >
                  <span>Export As...</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+Shift+S</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onCloseDocument(); } }}
                >
                  <span>Close Document</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+W</span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div style={{ position: 'relative' }}>
            <button className="lumina-menu-btn" onClick={() => handleMenuClick('edit')}>
              Edit
            </button>
            {openMenu === 'edit' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 180,
                  zIndex: 200,
                  padding: '4px 0'
                }}
              >
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: canUndo ? 1 : 0.5 }}
                  onClick={() => { if (canUndo) { closeMenu(); onUndo(); } }}
                >
                  <span>Undo</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+Z</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: canRedo ? 1 : 0.5 }}
                  onClick={() => { if (canRedo) { closeMenu(); onRedo(); } }}
                >
                  <span>Redo</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+Y</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onSelectAll(); } }}
                >
                  <span>Select All</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+A</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onDeselect(); } }}
                >
                  <span>Deselect</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+D</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onDeleteSelection(); } }}
                >
                  <span>Delete Selection</span>
                  <span style={{ color: 'var(--text-muted)' }}>Del</span>
                </div>
              </div>
            )}
          </div>

          {/* Image Menu */}
          <div style={{ position: 'relative' }}>
            <button className="lumina-menu-btn" onClick={() => handleMenuClick('image')}>
              Image
            </button>
            {openMenu === 'image' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 200,
                  zIndex: 200,
                  padding: '4px 0'
                }}
              >
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onRotateCW(); } }}
                >
                  <span>Rotate 90° CW</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+Alt+R</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onRotateCCW(); } }}
                >
                  <span>Rotate 90° CCW</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+Alt+L</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onFlipH(); } }}
                >
                  <span>Flip Horizontal</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onFlipV(); } }}
                >
                  <span>Flip Vertical</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onOpenResize(); } }}
                >
                  <span>Resize Image...</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onOpenCanvasSize(); } }}
                >
                  <span>Canvas Size...</span>
                </div>
              </div>
            )}
          </div>

          {/* Layer Menu */}
          <div style={{ position: 'relative' }}>
            <button className="lumina-menu-btn" onClick={() => handleMenuClick('layer')}>
              Layer
            </button>
            {openMenu === 'layer' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 190,
                  zIndex: 200,
                  padding: '4px 0'
                }}
              >
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onNewLayer(); } }}
                >
                  <span>New Layer</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+Shift+N</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document ? 1 : 0.5 }}
                  onClick={() => { if (document) { closeMenu(); onDuplicateLayer(); } }}
                >
                  <span>Duplicate Layer</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ctrl+J</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%', opacity: document && document.layers.length > 1 ? 1 : 0.5 }}
                  onClick={() => { if (document && document.layers.length > 1) { closeMenu(); onDeleteLayer(); } }}
                >
                  <span>Delete Layer</span>
                </div>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div style={{ position: 'relative' }}>
            <button className="lumina-menu-btn" onClick={() => handleMenuClick('help')}>
              Help
            </button>
            {openMenu === 'help' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 190,
                  zIndex: 200,
                  padding: '4px 0'
                }}
              >
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%' }}
                  onClick={() => { closeMenu(); onOpenShortcuts(); }}
                >
                  <span>Keyboard Shortcuts</span>
                  <span style={{ color: 'var(--text-muted)' }}>F1</span>
                </div>
                <div
                  className="lumina-menu-btn"
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', width: '100%' }}
                  onClick={() => { closeMenu(); onOpenAbout(); }}
                >
                  <span>About LUMINA</span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Center: Quick Controls (Undo, Redo, Zoom, Before/After) */}
      <div className="lumina-top-center-controls">
        <button
          className="lumina-btn icon-only"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
        >
          <Icon name="undo" size={14} />
        </button>
        <button
          className="lumina-btn icon-only"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
        >
          <Icon name="redo" size={14} />
        </button>

        <div className="lumina-divider-v" />

        <div className="lumina-zoom-group">
          <button className="lumina-btn icon-only small" onClick={onZoomOut} title="Zoom Out (Ctrl+-)">
            <Icon name="zoom-out" size={13} />
          </button>
          <span className="lumina-zoom-display">{Math.round(zoom * 100)}%</span>
          <button className="lumina-btn icon-only small" onClick={onZoomIn} title="Zoom In (Ctrl++)">
            <Icon name="zoom-in" size={13} />
          </button>
        </div>

        <button className="lumina-btn small" onClick={onFitScreen} title="Fit to Screen (Ctrl+0)">
          <Icon name="fit-screen" size={13} />
          <span>Fit</span>
        </button>

        <button className="lumina-btn small" onClick={onActualSize} title="Actual Pixels 100% (Ctrl+1)">
          <Icon name="actual-size" size={13} />
          <span>100%</span>
        </button>

        <div className="lumina-divider-v" />

        <button
          className={`lumina-btn small ${isComparing ? 'primary' : ''}`}
          onClick={onToggleCompare}
          disabled={!document}
          title="Toggle Before/After Comparison (\)"
        >
          <Icon name="compare" size={13} />
          <span>{isComparing ? 'Showing Original' : 'Before / After'}</span>
        </button>
      </div>

      {/* Right: Export Button */}
      <div className="lumina-top-right-controls">
        <button
          className="lumina-btn primary"
          disabled={!document}
          onClick={onOpenExport}
          title="Export Image (Ctrl+Shift+S)"
        >
          <Icon name="export" size={14} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
