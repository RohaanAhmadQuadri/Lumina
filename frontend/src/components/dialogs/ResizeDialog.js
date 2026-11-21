import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export const ResizeDialog = ({ isOpen, onClose, document, onResize }) => {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [lockAspect, setLockAspect] = useState(true);

  useEffect(() => {
    if (document) {
      setWidth(document.width);
      setHeight(document.height);
    }
  }, [document, isOpen]);

  const handleWidthChange = (val) => {
    setWidth(val);
    if (lockAspect && document && document.width > 0) {
      const ratio = document.height / document.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val) => {
    setHeight(val);
    if (lockAspect && document && document.height > 0) {
      const ratio = document.width / document.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleApply = () => {
    if (width > 0 && height > 0) {
      onResize(width, height);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Resize Image"
      onClose={onClose}
      footer={
        <>
          <button className="lumina-btn" onClick={onClose}>Cancel</button>
          <button className="lumina-btn primary" onClick={handleApply}>Apply Resize</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Resamples the image pixels to new dimensions using high-quality interpolation.
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Current Size:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {document?.width} × {document?.height} px
          </span>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">New Width:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              className="lumina-input"
              value={width}
              min="1"
              max="16000"
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">New Height:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              className="lumina-input"
              value={height}
              min="1"
              max="16000"
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>

        <div className="lumina-form-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
            />
            <span>Constrain Aspect Ratio</span>
          </label>
        </div>
      </div>
    </Modal>
  );
};
