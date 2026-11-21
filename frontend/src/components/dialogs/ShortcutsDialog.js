import React from 'react';
import { Modal } from '../common/Modal';

export const ShortcutsDialog = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + N', desc: 'New Document' },
    { key: 'Ctrl + O', desc: 'Open Image' },
    { key: 'Ctrl + S', desc: 'Save File' },
    { key: 'Ctrl + Shift + S', desc: 'Export / Save As' },
    { key: 'Ctrl + W', desc: 'Close Active Document' },
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y', desc: 'Redo' },
    { key: 'Ctrl + A', desc: 'Select All' },
    { key: 'Ctrl + D', desc: 'Deselect Selection' },
    { key: 'Delete', desc: 'Delete Selected Pixels / Layer' },
    { key: 'Ctrl + +', desc: 'Zoom In' },
    { key: 'Ctrl + -', desc: 'Zoom Out' },
    { key: 'Ctrl + 0', desc: 'Fit Canvas to Screen' },
    { key: 'Ctrl + 1', desc: 'Actual Pixels (100%)' },
    { key: '\\', desc: 'Toggle Before/After Comparison' },
    { key: 'V', desc: 'Move Layer Tool' },
    { key: 'M', desc: 'Rectangular Marquee Tool' },
    { key: 'L', desc: 'Lasso Selection Tool' },
    { key: 'C', desc: 'Crop Tool' },
    { key: 'B', desc: 'Brush Tool' },
    { key: 'E', desc: 'Eraser Tool' },
    { key: 'T', desc: 'Text Tool' },
    { key: 'U', desc: 'Shape Tool' },
    { key: 'I', desc: 'Eyedropper Tool' },
    { key: 'H / Space', desc: 'Hand / Pan Tool' },
    { key: 'Z', desc: 'Zoom Tool' },
    { key: 'Ctrl + Shift + N', desc: 'New Layer' },
    { key: 'Ctrl + J', desc: 'Duplicate Layer' },
    { key: 'F1', desc: 'Open Shortcuts Guide' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      title="Keyboard Shortcuts"
      onClose={onClose}
      footer={<button className="lumina-btn primary" onClick={onClose}>Close</button>}
    >
      <table className="lumina-shortcut-table">
        <tbody>
          {shortcuts.map((s, idx) => (
            <tr key={idx}>
              <td style={{ width: '45%' }}>
                <kbd className="lumina-shortcut-kbd">{s.key}</kbd>
              </td>
              <td style={{ color: 'var(--text-primary)' }}>{s.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
};
