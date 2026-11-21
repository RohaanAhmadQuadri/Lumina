/**
 * LUMINA Image Editing Engine — Layer Model
 * Manages layer data, canvas context, blend modes, and drawing operations.
 */

export class Layer {
  constructor(options = {}) {
    this.id = options.id || 'layer_' + Math.random().toString(36).substr(2, 9);
    this.name = options.name || 'Layer 1';
    this.type = options.type || 'raster'; // 'image', 'raster', 'text', 'shape'
    this.visible = options.visible !== undefined ? options.visible : true;
    this.locked = options.locked !== undefined ? options.locked : false;
    this.opacity = options.opacity !== undefined ? options.opacity : 1.0;
    this.blendMode = options.blendMode || 'source-over'; // standard CanvasCompositeOperation
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 800;
    this.height = options.height || 600;

    // Optional text & shape config
    this.textConfig = options.textConfig || {
      text: 'Sample Text',
      fontFamily: 'Arial',
      fontSize: 48,
      color: '#ffffff',
      bold: false,
      italic: false,
      align: 'left'
    };

    this.shapeConfig = options.shapeConfig || {
      shapeType: 'rectangle', // 'rectangle', 'circle', 'line', 'triangle'
      fill: '#38bdf8',
      stroke: '#ffffff',
      strokeWidth: 2,
      x2: 100,
      y2: 100
    };

    // Internal Layer Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    if (options.initialImage) {
      this.drawImage(options.initialImage);
    } else if (this.type === 'text') {
      this.renderText();
    } else if (this.type === 'shape') {
      this.renderShape();
    }
  }

  /**
   * Draw an HTMLImageElement or ImageBitmap onto this layer
   */
  drawImage(img, dx = 0, dy = 0, dw = this.width, dh = this.height) {
    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  /**
   * Render text layer onto its internal canvas
   */
  renderText() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { text, fontFamily, fontSize, color, bold, italic, align } = this.textConfig;
    this.ctx.save();
    this.ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align || 'left';
    this.ctx.textBaseline = 'top';

    let tx = 20;
    if (align === 'center') tx = this.width / 2;
    if (align === 'right') tx = this.width - 20;

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.25;
    lines.forEach((line, index) => {
      this.ctx.fillText(line, tx, 20 + index * lineHeight);
    });
    this.ctx.restore();
  }

  /**
   * Render vector shape layer onto its internal canvas
   */
  renderShape() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { shapeType, fill, stroke, strokeWidth, x2, y2 } = this.shapeConfig;
    this.ctx.save();
    this.ctx.fillStyle = fill || 'transparent';
    this.ctx.strokeStyle = stroke || 'transparent';
    this.ctx.lineWidth = strokeWidth || 1;

    this.ctx.beginPath();
    const w = x2 || (this.width - 40);
    const h = y2 || (this.height - 40);
    const sx = 20;
    const sy = 20;

    if (shapeType === 'rectangle') {
      this.ctx.rect(sx, sy, w, h);
    } else if (shapeType === 'circle') {
      this.ctx.ellipse(sx + w / 2, sy + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
    } else if (shapeType === 'line') {
      this.ctx.moveTo(sx, sy);
      this.ctx.lineTo(sx + w, sy + h);
    } else if (shapeType === 'triangle') {
      this.ctx.moveTo(sx + w / 2, sy);
      this.ctx.lineTo(sx + w, sy + h);
      this.ctx.lineTo(sx, sy + h);
      this.ctx.closePath();
    }

    if (fill && fill !== 'transparent') this.ctx.fill();
    if (stroke && stroke !== 'transparent' && strokeWidth > 0) this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Clone this layer with complete pixel data
   */
  clone() {
    const cloned = new Layer({
      id: 'layer_' + Math.random().toString(36).substr(2, 9),
      name: `${this.name} Copy`,
      type: this.type,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      blendMode: this.blendMode,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      textConfig: { ...this.textConfig },
      shapeConfig: { ...this.shapeConfig }
    });

    cloned.ctx.drawImage(this.canvas, 0, 0);
    return cloned;
  }

  /**
   * Get thumbnail data URL for the layer panel
   */
  getThumbnail(size = 48) {
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = size;
    thumbCanvas.height = size;
    const thumbCtx = thumbCanvas.getContext('2d');

    const aspect = this.width / this.height;
    let dw = size;
    let dh = size;
    let dx = 0;
    let dy = 0;

    if (aspect > 1) {
      dh = size / aspect;
      dy = (size - dh) / 2;
    } else {
      dw = size * aspect;
      dx = (size - dw) / 2;
    }

    thumbCtx.drawImage(this.canvas, dx, dy, dw, dh);
    return thumbCanvas.toDataURL('image/png');
  }

  /**
   * Crop layer canvas to given boundary offset
   */
  crop(normX, normY, normW, normH) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = normW;
    newCanvas.height = normH;
    const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });

    newCtx.drawImage(this.canvas, this.x - normX, this.y - normY);

    this.width = normW;
    this.height = normH;
    this.x = 0;
    this.y = 0;
    this.canvas = newCanvas;
    this.ctx = newCtx;
  }

  /**
   * Resize internal layer canvas
   */
  resize(newWidth, newHeight) {
    const temp = document.createElement('canvas');
    temp.width = this.width;
    temp.height = this.height;
    temp.getContext('2d').drawImage(this.canvas, 0, 0);

    this.width = newWidth;
    this.height = newHeight;
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.ctx.drawImage(temp, 0, 0, newWidth, newHeight);
  }
}
