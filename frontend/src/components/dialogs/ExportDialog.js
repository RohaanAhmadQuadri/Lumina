import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ExportEngine } from '../../engine/ExportEngine';
import { Icon } from '../common/Icons';

export const ExportDialog = ({ isOpen, onClose, document }) => {
  const [format, setFormat] = useState('png'); // 'png', 'jpeg', 'webp'
  const [quality, setQuality] = useState(92);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [fileName, setFileName] = useState('lumina-export');
  const [isExporting, setIsExporting] = useState(false);
  const [previewSize, setPreviewSize] = useState('');

  useEffect(() => {
    if (document) {
      setWidth(document.width);
      setHeight(document.height);
      const baseName = document.name ? document.name.replace(/\.[^/.]+$/, '') : 'lumina-export';
      setFileName(`${baseName}-edited`);
    }
  }, [document, isOpen]);

  // Estimate preview file size
  useEffect(() => {
    if (!document || !isOpen) return;

    let isMounted = true;
    const updateSize = async () => {
      try {
        const comp = document.render();
        const res = await ExportEngine.exportCanvas(comp, {
          format,
          quality: quality / 100,
          width,
          height
        });
        if (isMounted) {
          // Approx size from base64 length
          const byteLen = Math.round((res.dataUrl.length * 3) / 4);
          if (byteLen > 1024 * 1024) {
            setPreviewSize(`${(byteLen / (1024 * 1024)).toFixed(2)} MB`);
          } else {
            setPreviewSize(`${(byteLen / 1024).toFixed(1)} KB`);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(updateSize, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [document, format, quality, width, height, isOpen]);

  const handleExport = async () => {
    if (!document) return;
    setIsExporting(true);

    try {
      const comp = document.render();
      const res = await ExportEngine.exportCanvas(comp, {
        format,
        quality: quality / 100,
        width,
        height
      });

      const fullName = `${fileName}.${format}`;
      await ExportEngine.saveFile(res.dataUrl, fullName, format);
      onClose();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Export Image"
      onClose={onClose}
      footer={
        <>
          <button className="lumina-btn" onClick={onClose} disabled={isExporting}>Cancel</button>
          <button className="lumina-btn primary" onClick={handleExport} disabled={isExporting}>
            <Icon name="export" size={14} />
            <span>{isExporting ? 'Exporting...' : 'Export Image'}</span>
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="lumina-form-row">
          <span className="lumina-form-label">File Name:</span>
          <input
            type="text"
            className="lumina-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{ width: 220 }}
          />
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Format:</span>
          <select
            className="lumina-select"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="png">PNG (Lossless / Alpha)</option>
            <option value="jpeg">JPEG (Compressed)</option>
            <option value="webp">WebP (Modern Web)</option>
          </select>
        </div>

        {format !== 'png' && (
          <div className="lumina-form-row">
            <span className="lumina-form-label">Quality:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                style={{ width: 120 }}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{quality}%</span>
            </div>
          </div>
        )}

        <div className="lumina-form-row">
          <span className="lumina-form-label">Dimensions:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {width} × {height} px
          </span>
        </div>

        <div className="lumina-form-row">
          <span className="lumina-form-label">Estimated File Size:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
            {previewSize || 'Calculating...'}
          </span>
        </div>
      </div>
    </Modal>
  );
};
