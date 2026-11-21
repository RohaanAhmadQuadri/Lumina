/**
 * LUMINA Image Editing Engine — Drawing & Creative Tools
 * Smooth brush strokes, eraser with hardness, shape drawing, and color sampling.
 */

export class DrawingEngine {
  /**
   * Draw a smooth brush or eraser stroke segment from (x1, y1) to (x2, y2)
   */
  static drawStroke(ctx, p1, p2, options = {}) {
    const {
      size = 20,
      color = '#38bdf8',
      opacity = 1.0,
      hardness = 0.8,
      isEraser = false
    } = options;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = Math.max(1, size * 0.25);
    const count = Math.max(1, Math.ceil(dist / step));

    const radius = size / 2;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = p1.x + dx * t;
      const y = p1.y + dy * t;

      if (hardness >= 0.95) {
        // Crisp circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Soft radial gradient circle
        const grad = ctx.createRadialGradient(x, y, radius * hardness, x, y, radius);
        if (isEraser) {
          grad.addColorStop(0, 'rgba(0,0,0,1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
        } else {
          // Parse color to rgb
          const rgb = this.hexToRgb(color) || { r: 56, g: 189, b: 248 };
          grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
          grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
          ctx.fillStyle = grad;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draw a preview or finalized shape onto a context
   */
  static drawShape(ctx, start, current, options = {}) {
    const {
      shapeType = 'rectangle',
      fill = '#38bdf8',
      stroke = '#ffffff',
      strokeWidth = 2
    } = options;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;

    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const w = Math.abs(current.x - start.x);
    const h = Math.abs(current.y - start.y);

    ctx.beginPath();
    if (shapeType === 'rectangle') {
      ctx.rect(x, y, w, h);
    } else if (shapeType === 'circle') {
      ctx.ellipse(x + w / 2, y + h / 2, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
    } else if (shapeType === 'line') {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(current.x, current.y);
    } else if (shapeType === 'triangle') {
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
    }

    if (fill && fill !== 'transparent') ctx.fill();
    if (stroke && stroke !== 'transparent' && strokeWidth > 0) ctx.stroke();
    ctx.restore();
  }

  /**
   * Sample pixel color at (x, y) from canvas
   */
  static sampleColor(ctx, x, y) {
    try {
      const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      return {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        a: pixel[3] / 255,
        hex: hex.toUpperCase()
      };
    } catch (err) {
      return { r: 255, g: 255, b: 255, a: 1, hex: '#FFFFFF' };
    }
  }

  static hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }
}
