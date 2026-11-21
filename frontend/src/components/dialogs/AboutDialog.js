import React from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icons';

export const AboutDialog = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      title="About LUMINA"
      onClose={onClose}
      footer={<button className="lumina-btn primary" onClick={onClose}>Done</button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00d2b4 0%, #38bdf8 50%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)'
          }}
        >
          <Icon name="lumina" size={32} color="#ffffff" />
        </div>

        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-bright)', letterSpacing: 1.5 }}>
            LUMINA
          </h2>
          <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600, marginTop: 2 }}>
            Advanced Professional Photo Editor
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Version 1.0.0 (Windows Desktop Release)
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 380 }}>
          LUMINA is a high-performance desktop photo editing application engineered with React, Electron, and HTML5 Canvas. Featuring multi-layer compositing, non-destructive color adjustments, creative convolution filters, vector shapes, smooth brush engine, and high-fidelity image export.
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Designed and built for professional digital artists and photographers.
        </div>
      </div>
    </Modal>
  );
};
