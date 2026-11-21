/**
 * LUMINA Image Editing Engine — Filters & Artistic Effects
 * Includes convolution kernels, color matrices, vignette, and grain generation.
 */

export class FiltersEngine {
  static FILTERS = [
    { id: 'none', name: 'Original', icon: 'image' },
    { id: 'grayscale', name: 'Grayscale', icon: 'disc' },
    { id: 'sepia', name: 'Warm Sepia', icon: 'sun' },
    { id: 'vintage', name: 'Vintage 1970s', icon: 'camera' },
    { id: 'bw', name: 'B&W Contrast', icon: 'circle' },
    { id: 'warm', name: 'Warm Sunset', icon: 'sunset' },
    { id: 'cool', name: 'Cool Teal', icon: 'droplet' },
    { id: 'blur', name: 'Gaussian Blur', icon: 'eye-off' },
    { id: 'sharpen', name: 'Sharpen Detail', icon: 'zap' },
    { id: 'vignette', name: 'Classic Vignette', icon: 'circle-dot' },
    { id: 'pixelate', name: 'Pixelate Retro', icon: 'grid' },
    { id: 'emboss', name: '3D Emboss', icon: 'box' },
    { id: 'edges', name: 'Edge Detection', icon: 'activity' },
    { id: 'noise', name: 'Film Grain Noise', icon: 'sliders' }
  ];

  /**
   * Apply selected filter with intensity [0.0 - 1.0]
   */
  static applyFilter(imageData, filterId, intensity = 1.0) {
    if (!filterId || filterId === 'none' || intensity <= 0) {
      return imageData;
    }

    // Clone source data for blend interpolation
    const original = new Uint8ClampedArray(imageData.data);
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    switch (filterId) {
      case 'grayscale':
        this.filterGrayscale(data);
        break;
      case 'sepia':
        this.filterSepia(data);
        break;
      case 'vintage':
        this.filterVintage(data);
        break;
      case 'bw':
        this.filterBWHighContrast(data);
        break;
      case 'warm':
        this.filterWarm(data);
        break;
      case 'cool':
        this.filterCool(data);
        break;
      case 'blur':
        this.filterGaussianBlur(data, w, h, Math.max(1, Math.round(intensity * 6)));
        break;
      case 'sharpen':
        this.filterSharpen(data, w, h);
        break;
      case 'vignette':
        this.filterVignette(data, w, h, intensity);
        break;
      case 'pixelate':
        this.filterPixelate(data, w, h, Math.max(2, Math.round(intensity * 16)));
        break;
      case 'emboss':
        this.filterEmboss(data, w, h);
        break;
      case 'edges':
        this.filterEdgeDetection(data, w, h);
        break;
      case 'noise':
        this.filterNoise(data, intensity * 40);
        break;
      default:
        break;
    }

    // Blend between original and filtered based on intensity (except where filter already handled it)
    if (intensity < 1.0 && filterId !== 'blur' && filterId !== 'pixelate' && filterId !== 'vignette' && filterId !== 'noise') {
      const inv = 1.0 - intensity;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(original[i] * inv + data[i] * intensity);
        data[i + 1] = Math.round(original[i + 1] * inv + data[i + 1] * intensity);
        data[i + 2] = Math.round(original[i + 2] * inv + data[i + 2] * intensity);
      }
    }

    return imageData;
  }

  static filterGrayscale(data) {
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = l;
      data[i + 1] = l;
      data[i + 2] = l;
    }
  }

  static filterSepia(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
      data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
      data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
    }
  }

  static filterVintage(data) {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Lift blacks, boost warm highlights, desaturate greens
      r = Math.min(255, r * 1.1 + 20);
      g = Math.min(255, g * 0.95 + 10);
      b = Math.min(255, b * 0.8 + 15);

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  static filterBWHighContrast(data) {
    for (let i = 0; i < data.length; i += 4) {
      let l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // S-curve contrast
      l = (l - 128) * 1.6 + 128;
      l = l < 0 ? 0 : l > 255 ? 255 : l;
      data[i] = l;
      data[i + 1] = l;
      data[i + 2] = l;
    }
  }

  static filterWarm(data) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.18);
      data[i + 1] = Math.min(255, data[i + 1] * 1.05);
      data[i + 2] = data[i + 2] * 0.88;
    }
  }

  static filterCool(data) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * 0.85;
      data[i + 1] = Math.min(255, data[i + 1] * 1.08);
      data[i + 2] = Math.min(255, data[i + 2] * 1.22);
    }
  }

  static filterGaussianBlur(data, w, h, radius = 3) {
    // Fast 2-pass separable box/gaussian blur
    const copy = new Uint8ClampedArray(data);

    // Horizontal pass
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let k = -radius; k <= radius; k++) {
          const nx = x + k;
          if (nx >= 0 && nx < w) {
            const idx = (y * w + nx) * 4;
            r += copy[idx];
            g += copy[idx + 1];
            b += copy[idx + 2];
            count++;
          }
        }
        const oIdx = (y * w + x) * 4;
        data[oIdx] = r / count;
        data[oIdx + 1] = g / count;
        data[oIdx + 2] = b / count;
      }
    }

    // Vertical pass
    copy.set(data);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let k = -radius; k <= radius; k++) {
          const ny = y + k;
          if (ny >= 0 && ny < h) {
            const idx = (ny * w + x) * 4;
            r += copy[idx];
            g += copy[idx + 1];
            b += copy[idx + 2];
            count++;
          }
        }
        const oIdx = (y * w + x) * 4;
        data[oIdx] = r / count;
        data[oIdx + 1] = g / count;
        data[oIdx + 2] = b / count;
      }
    }
  }

  static filterSharpen(data, w, h) {
    const copy = new Uint8ClampedArray(data);
    const kernel = [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const weight = kernel[(ky + 1) * 3 + (kx + 1)];
            const idx = ((y + ky) * w + (x + kx)) * 4;
            r += copy[idx] * weight;
            g += copy[idx + 1] * weight;
            b += copy[idx + 2] * weight;
          }
        }
        const oIdx = (y * w + x) * 4;
        data[oIdx] = r < 0 ? 0 : r > 255 ? 255 : r;
        data[oIdx + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        data[oIdx + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      }
    }
  }

  static filterVignette(data, w, h, intensity = 0.8) {
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const innerRadius = maxDist * (1.0 - intensity * 0.4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > innerRadius) {
          const factor = Math.max(0, 1 - ((dist - innerRadius) / (maxDist - innerRadius)) * intensity);
          const idx = (y * w + x) * 4;
          data[idx] *= factor;
          data[idx + 1] *= factor;
          data[idx + 2] *= factor;
        }
      }
    }
  }

  static filterPixelate(data, w, h, blockSize = 8) {
    for (let y = 0; y < h; y += blockSize) {
      for (let x = 0; x < w; x += blockSize) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let by = 0; by < blockSize && (y + by) < h; by++) {
          for (let bx = 0; bx < blockSize && (x + bx) < w; bx++) {
            const idx = ((y + by) * w + (x + bx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        for (let by = 0; by < blockSize && (y + by) < h; by++) {
          for (let bx = 0; bx < blockSize && (x + bx) < w; bx++) {
            const idx = ((y + by) * w + (x + bx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }
  }

  static filterEmboss(data, w, h) {
    const copy = new Uint8ClampedArray(data);
    const kernel = [
      -2, -1, 0,
      -1,  1, 1,
       0,  1, 2
    ];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const weight = kernel[(ky + 1) * 3 + (kx + 1)];
            const idx = ((y + ky) * w + (x + kx)) * 4;
            const lum = 0.299 * copy[idx] + 0.587 * copy[idx + 1] + 0.114 * copy[idx + 2];
            val += lum * weight;
          }
        }
        val += 128; // Gray bias
        val = val < 0 ? 0 : val > 255 ? 255 : val;
        const oIdx = (y * w + x) * 4;
        data[oIdx] = val;
        data[oIdx + 1] = val;
        data[oIdx + 2] = val;
      }
    }
  }

  static filterEdgeDetection(data, w, h) {
    const copy = new Uint8ClampedArray(data);
    // Sobel operator
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        // Luminance of neighbors
        const getLum = (nx, ny) => {
          const idx = (ny * w + nx) * 4;
          return 0.299 * copy[idx] + 0.587 * copy[idx + 1] + 0.114 * copy[idx + 2];
        };

        const gx =
          -1 * getLum(x - 1, y - 1) + 1 * getLum(x + 1, y - 1) +
          -2 * getLum(x - 1, y)     + 2 * getLum(x + 1, y) +
          -1 * getLum(x - 1, y + 1) + 1 * getLum(x + 1, y + 1);

        const gy =
          -1 * getLum(x - 1, y - 1) - 2 * getLum(x, y - 1) - 1 * getLum(x + 1, y - 1) +
           1 * getLum(x - 1, y + 1) + 2 * getLum(x, y + 1) + 1 * getLum(x + 1, y + 1);

        const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        const oIdx = (y * w + x) * 4;
        data[oIdx] = edge;
        data[oIdx + 1] = edge;
        data[oIdx + 2] = edge;
      }
    }
  }

  static filterNoise(data, amount = 20) {
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * amount * 2;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
  }
}
