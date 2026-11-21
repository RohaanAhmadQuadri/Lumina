import React, { useRef, useEffect } from 'react';
import { AdjustmentsEngine } from '../../engine/AdjustmentsEngine';

export const HistogramPanel = ({ document }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!document || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Get current composed image data
    const comp = document.render();
    const imgData = comp.getContext('2d').getImageData(0, 0, comp.width, comp.height);
    const { r, g, b, max } = AdjustmentsEngine.computeHistogram(imgData);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#141518';
    ctx.fillRect(0, 0, w, h);

    // Draw channels with alpha blending
    const drawChannel = (channelData, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        const barH = (channelData[i] / max) * (h - 4);
        const y = h - barH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawChannel(r, 'rgba(239, 68, 68, 0.7)');   // Red
    drawChannel(g, 'rgba(34, 197, 94, 0.7)');   // Green
    drawChannel(b, 'rgba(56, 189, 248, 0.7)');  // Blue
  }, [document]);

  return (
    <div className="lumina-histogram-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
        <span>HISTOGRAM</span>
        <span>RGB</span>
      </div>
      <canvas ref={canvasRef} className="lumina-histogram-canvas" width={280} height={70} />
      <div className="lumina-histogram-channels">
        <span style={{ color: '#ef4444' }}>● Red</span>
        <span style={{ color: '#22c55e' }}>● Green</span>
        <span style={{ color: '#38bdf8' }}>● Blue</span>
      </div>
    </div>
  );
};
