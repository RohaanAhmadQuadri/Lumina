/**
 * LUMINA Image Editing Engine — History & Undo/Redo System
 * Tracks state operations, layer modifications, and adjustments with bounded memory management.
 */

export class HistoryEngine {
  constructor(maxStates = 40) {
    this.maxStates = maxStates;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Push a state onto the history stack
   * @param {String} actionLabel e.g. "Brush Stroke", "Adjust Contrast", "New Layer"
   * @param {Object} stateData Serialized snapshot of Document
   */
  pushState(actionLabel, stateData) {
    // Clear redo branch on new action
    this.redoStack = [];

    this.undoStack.push({
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      label: actionLabel,
      timestamp: Date.now(),
      snapshot: stateData
    });

    if (this.undoStack.length > this.maxStates) {
      this.undoStack.shift();
    }
  }

  canUndo() {
    return this.undoStack.length > 1; // Need at least initial state to revert to
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Pop current state to redo and return previous state
   */
  undo() {
    if (!this.canUndo()) return null;

    const current = this.undoStack.pop();
    this.redoStack.push(current);

    return this.undoStack[this.undoStack.length - 1];
  }

  /**
   * Pop from redo and push to undo
   */
  redo() {
    if (!this.canRedo()) return null;

    const next = this.redoStack.pop();
    this.undoStack.push(next);

    return next;
  }

  /**
   * Jump directly to a specific state in the undo history
   */
  jumpToState(stateId) {
    const idx = this.undoStack.findIndex(s => s.id === stateId);
    if (idx === -1) return null;

    // Move any states above idx to redoStack
    const popped = this.undoStack.splice(idx + 1);
    this.redoStack.unshift(...popped);

    return this.undoStack[this.undoStack.length - 1];
  }

  getHistoryList() {
    return [
      ...this.undoStack.map((item, idx) => ({
        ...item,
        isCurrent: idx === this.undoStack.length - 1,
        isFuture: false
      })),
      ...this.redoStack.map((item) => ({
        ...item,
        isCurrent: false,
        isFuture: true
      }))
    ];
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
