/**
 * LUMINA Image Editing Engine — Document Model
 * Represents a single open document with layers, adjustments, filters, and history.
 */

import { Layer } from './Layer';
import { Compositor } from './Compositor';
import { AdjustmentsEngine } from './AdjustmentsEngine';
import { HistoryEngine } from './HistoryEngine';

export class Document {
  constructor(options = {}) {
    this.id = options.id || 'doc_' + Math.random().toString(36).substr(2, 9);
    this.name = options.name || 'Untitled-1';
    this.filePath = options.filePath || null;
    this.width = options.width || 1200;
    this.height = options.height || 800;
    this.isDirty = false;

    // Viewport state
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;

    // Layers stack (index 0 is bottom)
    this.layers = [];
    this.activeLayerId = null;

    // Non-destructive global adjustments & filters
    this.adjustments = options.adjustments || AdjustmentsEngine.getDefaultAdjustments();
    this.filterId = options.filterId || 'none';
    this.filterIntensity = options.filterIntensity !== undefined ? options.filterIntensity : 1.0;

    // Compositor & History
    this.compositor = new Compositor(this.width, this.height);
    this.history = new HistoryEngine(40);

    // Selection
    this.selection = {
      active: false,
      type: 'rect', // 'rect', 'ellipse', 'lasso'
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      points: []
    };

    // Initialize with background or image layer
    if (options.initialImage) {
      this.initFromImage(options.initialImage);
    } else if (options.layers && options.layers.length > 0) {
      this.layers = options.layers;
      this.activeLayerId = this.layers[this.layers.length - 1].id;
      this.saveHistoryState('Open Document');
    } else {
      this.initBlank();
    }
  }

  initBlank() {
    const bgLayer = new Layer({
      name: 'Background',
      type: 'raster',
      width: this.width,
      height: this.height
    });
    // Fill white or transparent
    bgLayer.ctx.fillStyle = '#ffffff';
    bgLayer.ctx.fillRect(0, 0, this.width, this.height);

    this.layers = [bgLayer];
    this.activeLayerId = bgLayer.id;
    this.saveHistoryState('New Document');
  }

  initFromImage(img) {
    this.width = img.naturalWidth || img.width;
    this.height = img.naturalHeight || img.height;
    this.compositor.resize(this.width, this.height);

    const baseLayer = new Layer({
      name: 'Background',
      type: 'image',
      width: this.width,
      height: this.height,
      initialImage: img
    });

    this.layers = [baseLayer];
    this.activeLayerId = baseLayer.id;
    this.saveHistoryState('Open Image');
  }

  getActiveLayer() {
    return this.layers.find(l => l.id === this.activeLayerId) || this.layers[0] || null;
  }

  setActiveLayer(layerId) {
    this.activeLayerId = layerId;
  }

  addLayer(options = {}) {
    const count = this.layers.length + 1;
    const newLayer = new Layer({
      name: options.name || `Layer ${count}`,
      type: options.type || 'raster',
      width: this.width,
      height: this.height,
      ...options
    });

    this.layers.push(newLayer);
    this.activeLayerId = newLayer.id;
    this.isDirty = true;
    this.saveHistoryState(`Add ${newLayer.name}`);
    return newLayer;
  }

  deleteLayer(layerId) {
    if (this.layers.length <= 1) return false; // Prevent deleting last layer
    const idx = this.layers.findIndex(l => l.id === layerId);
    if (idx === -1) return false;

    const [deleted] = this.layers.splice(idx, 1);
    if (this.activeLayerId === layerId) {
      this.activeLayerId = this.layers[Math.max(0, idx - 1)].id;
    }

    this.isDirty = true;
    this.saveHistoryState(`Delete ${deleted.name}`);
    return true;
  }

  duplicateLayer(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return null;

    const cloned = layer.clone();
    const idx = this.layers.indexOf(layer);
    this.layers.splice(idx + 1, 0, cloned);
    this.activeLayerId = cloned.id;
    this.isDirty = true;
    this.saveHistoryState(`Duplicate ${layer.name}`);
    return cloned;
  }

  reorderLayers(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.layers.length || toIndex < 0 || toIndex >= this.layers.length) {
      return;
    }
    const [moved] = this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, moved);
    this.isDirty = true;
    this.saveHistoryState('Reorder Layers');
  }

  render() {
    return this.compositor.compose(
      this.layers,
      this.adjustments,
      this.filterId,
      this.filterIntensity
    );
  }

  renderOriginal() {
    return this.compositor.composeOriginal(this.layers);
  }

  /**
   * Serialize current document state for History
   */
  snapshot() {
    return {
      width: this.width,
      height: this.height,
      activeLayerId: this.activeLayerId,
      adjustments: JSON.parse(JSON.stringify(this.adjustments)),
      filterId: this.filterId,
      filterIntensity: this.filterIntensity,
      layers: this.layers.map(layer => {
        // Fast offscreen clone of layer canvas
        const copy = document.createElement('canvas');
        copy.width = layer.width;
        copy.height = layer.height;
        copy.getContext('2d').drawImage(layer.canvas, 0, 0);

        return {
          id: layer.id,
          name: layer.name,
          type: layer.type,
          visible: layer.visible,
          locked: layer.locked,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          canvas: copy,
          textConfig: { ...layer.textConfig },
          shapeConfig: { ...layer.shapeConfig }
        };
      })
    };
  }

  /**
   * Restore document state from history snapshot
   */
  restoreSnapshot(snap) {
    if (!snap) return;

    this.width = snap.width;
    this.height = snap.height;
    this.compositor.resize(this.width, this.height);
    this.activeLayerId = snap.activeLayerId;
    this.adjustments = JSON.parse(JSON.stringify(snap.adjustments));
    this.filterId = snap.filterId;
    this.filterIntensity = snap.filterIntensity;

    this.layers = snap.layers.map(lData => {
      const restored = new Layer({
        id: lData.id,
        name: lData.name,
        type: lData.type,
        visible: lData.visible,
        locked: lData.locked,
        opacity: lData.opacity,
        blendMode: lData.blendMode,
        x: lData.x,
        y: lData.y,
        width: lData.width,
        height: lData.height,
        textConfig: { ...lData.textConfig },
        shapeConfig: { ...lData.shapeConfig }
      });
      restored.ctx.drawImage(lData.canvas, 0, 0);
      return restored;
    });

    this.isDirty = true;
  }

  saveHistoryState(label) {
    this.history.pushState(label, this.snapshot());
  }

  undo() {
    const prevState = this.history.undo();
    if (prevState) {
      this.restoreSnapshot(prevState.snapshot);
      return true;
    }
    return false;
  }

  redo() {
    const nextState = this.history.redo();
    if (nextState) {
      this.restoreSnapshot(nextState.snapshot);
      return true;
    }
    return false;
  }

  jumpToHistoryState(stateId) {
    const state = this.history.jumpToState(stateId);
    if (state) {
      this.restoreSnapshot(state.snapshot);
      return true;
    }
    return false;
  }
}
