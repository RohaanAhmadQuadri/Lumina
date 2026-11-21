/**
 * LUMINA Image Editing Engine — Export System
 * High quality export to PNG, JPEG, and WebP formats with custom compression and dimensions.
 */

export class ExportEngine {
  /**
   * Export composed canvas with custom options
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options { format: 'png'|'jpeg'|'webp', quality: 0.92, width, height }
   */
  static async exportCanvas(canvas, options = {}) {
    const {
      format = 'png',
      quality = 0.92,
      width = canvas.width,
      height = canvas.height
    } = options;

    let targetCanvas = canvas;

    // Rescale if output dimensions differ from document
    if (width !== canvas.width || height !== canvas.height) {
      targetCanvas = document.createElement('canvas');
      targetCanvas.width = width;
      targetCanvas.height = height;
      const ctx = targetCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If exporting to JPEG without alpha, fill white background
      if (format === 'jpeg' || format === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(canvas, 0, 0, width, height);
    } else if (format === 'jpeg' || format === 'jpg') {
      // JPEG requires a flat opaque background
      targetCanvas = document.createElement('canvas');
      targetCanvas.width = width;
      targetCanvas.height = height;
      const ctx = targetCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0);
    }

    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const dataUrl = targetCanvas.toDataURL(mime, quality);

    return {
      dataUrl,
      format,
      width,
      height,
      mime
    };
  }

  /**
   * Save file using Electron native file system or browser trigger
   */
  static async saveFile(dataUrl, defaultName = 'lumina_export.png', format = 'png') {
    // 1. If running inside Electron, use secure IPC bridge
    if (window.luminaAPI && window.luminaAPI.saveFileDialog) {
      const result = await window.luminaAPI.saveFileDialog({
        defaultPath: defaultName,
        defaultExtension: format
      });

      if (!result.canceled && result.filePath) {
        const saveRes = await window.luminaAPI.saveImageFile(result.filePath, dataUrl);
        return { success: saveRes.success, filePath: result.filePath };
      }
      return { canceled: true };
    }

    // 2. Web browser fallback: trigger download attribute
    const link = document.createElement('a');
    link.download = defaultName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  }
}
