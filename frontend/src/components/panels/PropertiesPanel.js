import React from 'react';

export const PropertiesPanel = ({ document }) => {
  if (!document) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No active document</div>;
  }

  const activeLayer = document.getActiveLayer();
  const megapixels = ((document.width * document.height) / 1000000).toFixed(2);
  const memoryEstMB = ((document.width * document.height * 4 * document.layers.length) / (1024 * 1024)).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="lumina-panel-section-title">Document Properties</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        <div className="lumina-form-row">
          <span className="lumina-form-label">Name:</span>
          <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>{document.name}</span>
        </div>
        <div className="lumina-form-row">
          <span className="lumina-form-label">Dimensions:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{document.width} × {document.height} px</span>
        </div>
        <div className="lumina-form-row">
          <span className="lumina-form-label">Resolution:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{megapixels} MP</span>
        </div>
        <div className="lumina-form-row">
          <span className="lumina-form-label">Color Space:</span>
          <span>sRGB 8-bit</span>
        </div>
        <div className="lumina-form-row">
          <span className="lumina-form-label">Estimated Memory:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>~{memoryEstMB} MB</span>
        </div>
        {document.filePath && (
          <div className="lumina-form-row" style={{ alignItems: 'flex-start' }}>
            <span className="lumina-form-label">Path:</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all', maxWidth: 180, textAlign: 'right' }}>
              {document.filePath}
            </span>
          </div>
        )}
      </div>

      {activeLayer && (
        <>
          <div className="lumina-panel-section-title">Selected Layer Properties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Layer Name:</span>
              <span style={{ color: 'var(--text-bright)' }}>{activeLayer.name}</span>
            </div>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Layer Type:</span>
              <span>{activeLayer.type.toUpperCase()}</span>
            </div>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Position:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>X: {Math.round(activeLayer.x)}, Y: {Math.round(activeLayer.y)}</span>
            </div>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Layer Size:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{activeLayer.width} × {activeLayer.height} px</span>
            </div>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Blend Mode:</span>
              <span>{activeLayer.blendMode}</span>
            </div>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Opacity:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(activeLayer.opacity * 100)}%</span>
            </div>
            <div className="lumina-form-row">
              <span className="lumina-form-label">Locked:</span>
              <span>{activeLayer.locked ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
