import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export const CanvasSizeDialog = ({ isOpen, onClose, document, onCanvasSize }) => {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [anchor, setAnchor] = useState('center');

  useEffect(() => {
    if (document) {
      setWidth(document.width);
      setHeight(document.height);
    }
  }, [document, isOpen]);

  const handleApply = () => {
    if (width > 0 && height > 0) {
      onCanvasSize(width, height, anchor);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Canvas Size"
      onClose={onClose}
      footer={
        <>
          <button className="lumina-btn" onClick={onClose}>Cancel</button>
          <button className="lumina-btn primary" onClick={handleApply}>Apply</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Expands or trims the canvas boundary without scaling existing image pixels.
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Current Canvas:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {document?.width} × {document?.height} px
          </span>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Width:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              className="lumina-input"
              value={width}
              min="1"
              max="16000"
              onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Height:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              className="lumina-input"
              value={height}
              min="1"
              max="16000"
              onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Anchor Alignment:</span>
          <select
            className="lumina-select"
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="center">Center</option>
            <option value="top-left">Top-Left</option>
            <option value="bottom-right">Bottom-Right</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};
