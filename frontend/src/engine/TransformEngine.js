/**
 * LUMINA Image Editing Engine — Transformations
 * Rotate, Flip, Crop, and Resample operations for documents and individual layers.
 */

export class TransformEngine {
  /**
   * Rotate a canvas by 90, 180, or 270 degrees
   * @param {HTMLCanvasElement} srcCanvas
   * @param {Number} degrees 90, 180, or -90 (270)
   */
  static rotateCanvas(srcCanvas, degrees) {
    const rad = (degrees * Math.PI) / 180;
    const isQuarter = Math.abs(degrees) === 90 || Math.abs(degrees) === 270;
    const newWidth = isQuarter ? srcCanvas.height : srcCanvas.width;
    const newHeight = isQuarter ? srcCanvas.width : srcCanvas.height;

    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = newWidth;
    dstCanvas.height = newHeight;
    const ctx = dstCanvas.getContext('2d');

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(rad);
    ctx.drawImage(srcCanvas, -srcCanvas.width / 2, -srcCanvas.height / 2);
    ctx.restore();

    return dstCanvas;
  }

  /**
   * Flip a canvas horizontally or vertically
   * @param {HTMLCanvasElement} srcCanvas
   * @param {Boolean} horizontal
   * @param {Boolean} vertical
   */
  static flipCanvas(srcCanvas, horizontal = true, vertical = false) {
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = srcCanvas.width;
    dstCanvas.height = srcCanvas.height;
    const ctx = dstCanvas.getContext('2d');

    ctx.save();
    ctx.translate(horizontal ? srcCanvas.width : 0, vertical ? srcCanvas.height : 0);
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
    ctx.drawImage(srcCanvas, 0, 0);
    ctx.restore();

    return dstCanvas;
  }

  /**
   * Crop canvas to specified rect
   */
  static cropCanvas(srcCanvas, cropX, cropY, cropWidth, cropHeight) {
    const cw = Math.max(1, Math.round(cropWidth));
    const ch = Math.max(1, Math.round(cropHeight));

    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = cw;
    dstCanvas.height = ch;
    const ctx = dstCanvas.getContext('2d');

    ctx.drawImage(
      srcCanvas,
      -Math.round(cropX), -Math.round(cropY)
    );

    return dstCanvas;
  }

  /**
   * Resize/Resample canvas with smooth bilinear interpolation
   */
  static resizeCanvas(srcCanvas, targetWidth, targetHeight) {
    const tw = Math.max(1, Math.round(targetWidth));
    const th = Math.max(1, Math.round(targetHeight));

    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = tw;
    dstCanvas.height = th;
    const ctx = dstCanvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(srcCanvas, 0, 0, tw, th);

    return dstCanvas;
  }

  /**
   * Expand or shrink canvas boundaries with anchor positioning
   * @param {HTMLCanvasElement} srcCanvas
   * @param {Number} newWidth
   * @param {Number} newHeight
   * @param {String} anchor 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
   */
  static resizeCanvasBoundary(srcCanvas, newWidth, newHeight, anchor = 'center') {
    const nw = Math.max(1, Math.round(newWidth));
    const nh = Math.max(1, Math.round(newHeight));

    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = nw;
    dstCanvas.height = nh;
    const ctx = dstCanvas.getContext('2d');

    let dx = 0;
    let dy = 0;

    if (anchor === 'center') {
      dx = (nw - srcCanvas.width) / 2;
      dy = (nh - srcCanvas.height) / 2;
    } else if (anchor === 'bottom-right') {
      dx = nw - srcCanvas.width;
      dy = nh - srcCanvas.height;
    }

    ctx.drawImage(srcCanvas, Math.round(dx), Math.round(dy));
    return dstCanvas;
  }
}
