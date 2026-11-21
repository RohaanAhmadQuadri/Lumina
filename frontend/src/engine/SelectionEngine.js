/**
 * LUMINA Image Editing Engine — Selection System
 * Rectangular, Elliptical, and Lasso selections with pixel deletion and manipulation.
 */

export class SelectionEngine {
  /**
   * Delete pixels inside active selection on target layer
   */
  static deleteSelection(layer, selection) {
    if (!layer || !selection || !selection.active) return;

    const ctx = layer.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    if (selection.type === 'rect') {
      const { x, y, width, height } = selection.bounds;
      ctx.fillRect(x - layer.x, y - layer.y, width, height);
    } else if (selection.type === 'ellipse') {
      const { x, y, width, height } = selection.bounds;
      ctx.beginPath();
      ctx.ellipse(
        x - layer.x + width / 2,
        y - layer.y + height / 2,
        Math.abs(width / 2),
        Math.abs(height / 2),
        0, 0, Math.PI * 2
      );
      ctx.fill();
    } else if (selection.type === 'lasso' && selection.points && selection.points.length > 2) {
      ctx.beginPath();
      const pts = selection.points;
      ctx.moveTo(pts[0].x - layer.x, pts[0].y - layer.y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x - layer.x, pts[i].y - layer.y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Test if point is inside current selection
   */
  static isPointInSelection(point, selection) {
    if (!selection || !selection.active) return false;

    if (selection.type === 'rect') {
      const b = selection.bounds;
      return point.x >= b.x && point.x <= b.x + b.width && point.y >= b.y && point.y <= b.y + b.height;
    }

    if (selection.type === 'ellipse') {
      const b = selection.bounds;
      const rx = b.width / 2;
      const ry = b.height / 2;
      const cx = b.x + rx;
      const cy = b.y + ry;
      const normX = (point.x - cx) / rx;
      const normY = (point.y - cy) / ry;
      return normX * normX + normY * normY <= 1;
    }

    if (selection.type === 'lasso' && selection.points && selection.points.length > 2) {
      // Ray-casting point-in-polygon
      const pts = selection.points;
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x, yi = pts[i].y;
        const xj = pts[j].x, yj = pts[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
          (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    return false;
  }
}
