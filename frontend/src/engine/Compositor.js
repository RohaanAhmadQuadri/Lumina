/**
 * LUMINA Image Editing Engine — Layer Compositor
 * Combines all visible layers using HTML5 Canvas blend modes and applies global adjustments/filters.
 */

import { AdjustmentsEngine } from './AdjustmentsEngine';
import { FiltersEngine } from './FiltersEngine';

export class Compositor {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.outputCanvas = document.createElement('canvas');
    this.outputCanvas.width = width;
    this.outputCanvas.height = height;
    this.ctx = this.outputCanvas.getContext('2d', { willReadFrequently: true });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.outputCanvas.width = width;
    this.outputCanvas.height = height;
  }

  /**
   * Render document layers, global adjustments, and filters onto output canvas
   * @param {Array} layers List of Layer instances
   * @param {Object} adjustments Adjustments dictionary
   * @param {String} filterId Active filter ID
   * @param {Number} filterIntensity Filter intensity [0..1]
   */
  compose(layers, adjustments = null, filterId = 'none', filterIntensity = 1.0) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Composite all visible layers from bottom to top
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.visible || layer.opacity <= 0) continue;

      this.ctx.save();
      this.ctx.globalAlpha = layer.opacity;
      this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';
      this.ctx.drawImage(layer.canvas, layer.x, layer.y);
      this.ctx.restore();
    }

    // 2. Apply non-destructive adjustments & filters if any are active
    const hasAdj = AdjustmentsEngine.hasActiveAdjustments(adjustments);
    const hasFilt = filterId && filterId !== 'none' && filterIntensity > 0;

    if (hasAdj || hasFilt) {
      const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

      if (hasAdj) {
        AdjustmentsEngine.applyAdjustments(imageData, adjustments);
      }
      if (hasFilt) {
        FiltersEngine.applyFilter(imageData, filterId, filterIntensity);
      }

      this.ctx.putImageData(imageData, 0, 0);
    }

    return this.outputCanvas;
  }

  /**
   * Render original unadjusted composite (for Before/After comparison)
   */
  composeOriginal(layers) {
    const origCanvas = document.createElement('canvas');
    origCanvas.width = this.width;
    origCanvas.height = this.height;
    const origCtx = origCanvas.getContext('2d');

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.visible || layer.opacity <= 0) continue;
      origCtx.save();
      origCtx.globalAlpha = layer.opacity;
      origCtx.globalCompositeOperation = layer.blendMode || 'source-over';
      origCtx.drawImage(layer.canvas, layer.x, layer.y);
      origCtx.restore();
    }

    return origCanvas;
  }
}
