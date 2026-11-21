/**
 * LUMINA Image Editing Engine — Adjustments Processor
 * High-performance pixel manipulation and color grading algorithms.
 */

export class AdjustmentsEngine {
  /**
   * Default adjustments state
   */
  static getDefaultAdjustments() {
    return {
      brightness: 0,    // -100 to +100
      contrast: 0,      // -100 to +100
      saturation: 0,    // -100 to +100
      exposure: 0,      // -100 to +100
      temperature: 0,   // -100 to +100
      tint: 0,          // -100 to +100
      highlights: 0,    // -100 to +100
      shadows: 0,       // -100 to +100
      whites: 0,        // -100 to +100
      blacks: 0,        // -100 to +100
      sharpness: 0,     // 0 to 100
      vibrance: 0,      // -100 to +100
      gamma: 1.0,       // 0.2 to 2.5
      hue: 0            // -180 to +180
    };
  }

  /**
   * Check if any adjustments are applied
   */
  static hasActiveAdjustments(adj) {
    if (!adj) return false;
    return (
      adj.brightness !== 0 ||
      adj.contrast !== 0 ||
      adj.saturation !== 0 ||
      adj.exposure !== 0 ||
      adj.temperature !== 0 ||
      adj.tint !== 0 ||
      adj.highlights !== 0 ||
      adj.shadows !== 0 ||
      adj.whites !== 0 ||
      adj.blacks !== 0 ||
      adj.sharpness !== 0 ||
      adj.vibrance !== 0 ||
      (adj.gamma !== undefined && adj.gamma !== 1.0) ||
      adj.hue !== 0
    );
  }

  /**
   * Apply all active adjustments directly to an ImageData object
   */
  static applyAdjustments(imageData, adjustments) {
    if (!this.hasActiveAdjustments(adjustments)) {
      return imageData;
    }

    const data = imageData.data;
    const len = data.length;

    // Precalculate factors for speed
    const brightness = (adjustments.brightness || 0) * 2.55;
    
    // Contrast factor: [-100, 100] -> [0.1, 3.0]
    const cVal = adjustments.contrast || 0;
    const contrastFactor = cVal < 0 ? (100 + cVal) / 100 : 1 + (cVal / 50) * 1.5;

    // Exposure factor: [-100, 100] -> pow(2, exp / 50)
    const exposureFactor = Math.pow(2, (adjustments.exposure || 0) / 40);

    // Saturation factor
    const sat = (adjustments.saturation || 0) / 100;

    // Temperature & Tint
    const temp = adjustments.temperature || 0;
    const tint = adjustments.tint || 0;
    const rTemp = temp > 0 ? 1 + (temp / 100) * 0.4 : 1;
    const bTemp = temp < 0 ? 1 + (-temp / 100) * 0.4 : 1;
    const gTint = tint < 0 ? 1 + (-tint / 100) * 0.3 : 1;
    const mTint = tint > 0 ? (tint / 100) * 0.3 : 0;

    // Highlights & Shadows
    const hl = (adjustments.highlights || 0) / 100;
    const sh = (adjustments.shadows || 0) / 100;
    const wh = (adjustments.whites || 0) * 1.5;
    const bl = (adjustments.blacks || 0) * 1.5;

    // Vibrance
    const vibrance = (adjustments.vibrance || 0) / 100;

    // Gamma
    const gamma = adjustments.gamma || 1.0;
    const invGamma = 1.0 / gamma;

    // Hue rotation radians
    const hueDeg = adjustments.hue || 0;
    const hueRad = (hueDeg * Math.PI) / 180;
    const cosHue = Math.cos(hueRad);
    const sinHue = Math.sin(hueRad);

    // Hue rotation matrix constants
    const h1 = 0.299 + 0.701 * cosHue + 0.168 * sinHue;
    const h2 = 0.587 - 0.587 * cosHue + 0.330 * sinHue;
    const h3 = 0.114 - 0.114 * cosHue - 0.497 * sinHue;
    const h4 = 0.299 - 0.299 * cosHue - 0.328 * sinHue;
    const h5 = 0.587 + 0.413 * cosHue + 0.035 * sinHue;
    const h6 = 0.114 - 0.114 * cosHue + 0.288 * sinHue;
    const h7 = 0.299 - 0.300 * cosHue + 1.250 * sinHue;
    const h8 = 0.587 - 0.588 * cosHue - 1.050 * sinHue;
    const h9 = 0.114 + 0.886 * cosHue - 0.203 * sinHue;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Exposure
      if (adjustments.exposure !== 0) {
        r *= exposureFactor;
        g *= exposureFactor;
        b *= exposureFactor;
      }

      // 2. Brightness
      if (adjustments.brightness !== 0) {
        r += brightness;
        g += brightness;
        b += brightness;
      }

      // 3. Contrast (around 128)
      if (adjustments.contrast !== 0) {
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
      }

      // 4. White & Black levels
      if (adjustments.whites !== 0) {
        r += (r / 255) * wh;
        g += (g / 255) * wh;
        b += (b / 255) * wh;
      }
      if (adjustments.blacks !== 0) {
        r += ((255 - r) / 255) * bl;
        g += ((255 - g) / 255) * bl;
        b += ((255 - b) / 255) * bl;
      }

      // 5. Highlights & Shadows
      if (adjustments.highlights !== 0 || adjustments.shadows !== 0) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (hl !== 0 && lum > 128) {
          const factor = ((lum - 128) / 127) * hl * 60;
          r += factor;
          g += factor;
          b += factor;
        }
        if (sh !== 0 && lum < 128) {
          const factor = ((128 - lum) / 128) * sh * 60;
          r += factor;
          g += factor;
          b += factor;
        }
      }

      // 6. Temperature & Tint
      if (temp !== 0 || tint !== 0) {
        r *= rTemp;
        b *= bTemp;
        g *= gTint;
        if (mTint > 0) {
          r += mTint * 50;
          b += mTint * 50;
        }
      }

      // 7. Hue rotation
      if (hueDeg !== 0) {
        const nr = r * h1 + g * h2 + b * h3;
        const ng = r * h4 + g * h5 + b * h6;
        const nb = r * h7 + g * h8 + b * h9;
        r = nr;
        g = ng;
        b = nb;
      }

      // 8. Saturation
      if (sat !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * (1 + sat);
        g = gray + (g - gray) * (1 + sat);
        b = gray + (b - gray) * (1 + sat);
      }

      // 9. Vibrance (smart saturation)
      if (vibrance !== 0) {
        const max = Math.max(r, Math.max(g, b));
        const avg = (r + g + b) / 3;
        const amt = ((Math.abs(max - avg) * 2) / 255) * vibrance;
        r += (r - avg) * amt;
        g += (g - avg) * amt;
        b += (b - avg) * amt;
      }

      // 10. Gamma correction
      if (gamma !== 1.0) {
        r = Math.pow(Math.max(0, r) / 255, invGamma) * 255;
        g = Math.pow(Math.max(0, g) / 255, invGamma) * 255;
        b = Math.pow(Math.max(0, b) / 255, invGamma) * 255;
      }

      // Clamp to [0, 255]
      data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }

    // 11. Sharpness pass (if requested)
    if (adjustments.sharpness > 0) {
      this.applySharpness(imageData, adjustments.sharpness);
    }

    return imageData;
  }

  /**
   * Unsharp mask convolution filter for sharpness
   */
  static applySharpness(imageData, amount) {
    const w = imageData.width;
    const h = imageData.height;
    const src = new Uint8ClampedArray(imageData.data);
    const dst = imageData.data;
    const factor = (amount / 100) * 1.5;

    // 3x3 Laplacian edge kernel
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          const center = src[idx + c];
          const top = src[((y - 1) * w + x) * 4 + c];
          const bottom = src[((y + 1) * w + x) * 4 + c];
          const left = src[(y * w + (x - 1)) * 4 + c];
          const right = src[(y * w + (x + 1)) * 4 + c];

          const edge = center * 4 - top - bottom - left - right;
          const val = center + edge * factor;
          dst[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
      }
    }
  }

  /**
   * Calculate live RGB & Luminance histogram
   */
  static computeHistogram(imageData) {
    const data = imageData.data;
    const r = new Uint32Array(256);
    const g = new Uint32Array(256);
    const b = new Uint32Array(256);
    const lum = new Uint32Array(256);

    const step = 4 * 2; // Step by 2 pixels for extreme speed
    for (let i = 0; i < data.length; i += step) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const l = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);

      r[red]++;
      g[green]++;
      b[blue]++;
      lum[l]++;
    }

    let max = 1;
    for (let i = 0; i < 256; i++) {
      if (r[i] > max) max = r[i];
      if (g[i] > max) max = g[i];
      if (b[i] > max) max = b[i];
      if (lum[i] > max) max = lum[i];
    }

    return { r, g, b, lum, max };
  }
}
