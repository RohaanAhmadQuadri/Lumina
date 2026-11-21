import React from 'react';

export const BottomStatusBar = ({
  document,
  zoom,
  cursorPos,
  activeToolName
}) => {
  return (
    <footer className="lumina-statusbar">
      <div className="lumina-status-section">
        {document ? (
          <>
            <div className="lumina-status-item">
              <span>Doc:</span>
              <span className="lumina-status-value">{document.name}</span>
            </div>
            <div className="lumina-status-item">
              <span>Dimensions:</span>
              <span className="lumina-status-value">
                {document.width} × {document.height} px
              </span>
            </div>
            <div className="lumina-status-item">
              <span>Layers:</span>
              <span className="lumina-status-value">{document.layers.length}</span>
            </div>
          </>
        ) : (
          <span>No Document Open</span>
        )}
      </div>

      <div className="lumina-status-section">
        <div className="lumina-status-item">
          <span>Tool:</span>
          <span className="lumina-status-value">{activeToolName}</span>
        </div>

        {document && (
          <>
            <div className="lumina-status-item">
              <span>X:</span>
              <span className="lumina-status-value">{cursorPos.x}</span>
              <span>Y:</span>
              <span className="lumina-status-value">{cursorPos.y}</span>
            </div>
            <div className="lumina-status-item">
              <span>Zoom:</span>
              <span className="lumina-status-value">{Math.round(zoom * 100)}%</span>
            </div>
          </>
        )}
      </div>
    </footer>
  );
};
