import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export const PRESETS = [
  { name: '1080p Full HD', width: 1920, height: 1080 },
  { name: '4K Ultra HD', width: 3840, height: 2160 },
  { name: 'Square Post', width: 1080, height: 1080 },
  { name: 'Social Story', width: 1080, height: 1920 },
  { name: 'Web Standard', width: 1440, height: 900 },
  { name: 'Classic Photo', width: 1800, height: 1200 }
];

export const NewDocumentDialog = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('Untitled-1');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [background, setBackground] = useState('white'); // 'white' or 'transparent'

  const handleCreate = () => {
    onCreate({
      name: name.trim() || 'Untitled',
      width: parseInt(width) || 1200,
      height: parseInt(height) || 800,
      background
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create New Document"
      onClose={onClose}
      footer={
        <>
          <button className="lumina-btn" onClick={onClose}>Cancel</button>
          <button className="lumina-btn primary" onClick={handleCreate}>Create</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="lumina-form-row">
          <span className="lumina-form-label">Document Name:</span>
          <input
            type="text"
            className="lumina-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: 220 }}
          />
        </div>

        <div>
          <span className="lumina-form-label" style={{ display: 'block', marginBottom: 8 }}>Preset Sizes:</span>
          <div className="lumina-preset-grid">
            {PRESETS.map((p) => (
              <div
                key={p.name}
                className={`lumina-preset-card ${width === p.width && height === p.height ? 'active' : ''}`}
                onClick={() => { setWidth(p.width); setHeight(p.height); }}
              >
                <span className="lumina-preset-name">{p.name}</span>
                <span className="lumina-preset-dims">{p.width} × {p.height} px</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Width:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              className="lumina-input"
              value={width}
              min="10"
              max="16000"
              onChange={(e) => setWidth(parseInt(e.target.value) || 100)}
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
              min="10"
              max="16000"
              onChange={(e) => setHeight(parseInt(e.target.value) || 100)}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Background:</span>
          <select
            className="lumina-select"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="white">White</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};
