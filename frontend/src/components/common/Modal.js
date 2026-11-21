import React, { useEffect } from 'react';
import { Icon } from './Icons';

export const Modal = ({ isOpen, title, onClose, children, footer, maxWidth = 480 }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lumina-modal-backdrop" onClick={onClose}>
      <div
        className="lumina-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lumina-modal-header">
          <div className="lumina-modal-title">{title}</div>
          <button className="lumina-modal-close" onClick={onClose} title="Close">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="lumina-modal-body">
          {children}
        </div>
        {footer && (
          <div className="lumina-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
