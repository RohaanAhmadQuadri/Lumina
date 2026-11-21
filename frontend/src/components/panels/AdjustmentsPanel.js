import React from 'react';
import { SliderControl } from '../common/SliderControl';
import { AdjustmentsEngine } from '../../engine/AdjustmentsEngine';
import { HistogramPanel } from './HistogramPanel';
import { Icon } from '../common/Icons';

export const AdjustmentsPanel = ({ document, onUpdateDocument }) => {
  if (!document) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No active document</div>;
  }

  const adj = document.adjustments;

  const handleAdjustmentChange = (key, val) => {
    document.adjustments[key] = val;
    document.isDirty = true;
    onUpdateDocument();
  };

  const handleResetAll = () => {
    document.adjustments = AdjustmentsEngine.getDefaultAdjustments();
    document.isDirty = true;
    document.saveHistoryState('Reset Adjustments');
    onUpdateDocument();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Live RGB Histogram */}
      <HistogramPanel document={document} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="lumina-panel-section-title" style={{ margin: 0, border: 'none' }}>
          Color & Tone
        </span>
        <button className="lumina-btn small" onClick={handleResetAll} title="Reset All Adjustments">
          <Icon name="reset" size={11} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Basic Tone Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SliderControl
          label="Brightness"
          value={adj.brightness}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('brightness', v)}
        />
        <SliderControl
          label="Contrast"
          value={adj.contrast}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('contrast', v)}
        />
        <SliderControl
          label="Exposure"
          value={adj.exposure}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('exposure', v)}
        />
      </div>

      {/* White Balance & Tint */}
      <div className="lumina-panel-section-title">White Balance</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SliderControl
          label="Temperature"
          value={adj.temperature}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('temperature', v)}
        />
        <SliderControl
          label="Tint"
          value={adj.tint}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('tint', v)}
        />
      </div>

      {/* Dynamic Range / Highlights & Shadows */}
      <div className="lumina-panel-section-title">Tone Highlights & Shadows</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SliderControl
          label="Highlights"
          value={adj.highlights}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('highlights', v)}
        />
        <SliderControl
          label="Shadows"
          value={adj.shadows}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('shadows', v)}
        />
        <SliderControl
          label="Whites"
          value={adj.whites}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('whites', v)}
        />
        <SliderControl
          label="Blacks"
          value={adj.blacks}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('blacks', v)}
        />
      </div>

      {/* Color Grading & Detail */}
      <div className="lumina-panel-section-title">Color Grading & Detail</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SliderControl
          label="Saturation"
          value={adj.saturation}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('saturation', v)}
        />
        <SliderControl
          label="Vibrance"
          value={adj.vibrance}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('vibrance', v)}
        />
        <SliderControl
          label="Hue Angle"
          value={adj.hue}
          min={-180}
          max={180}
          defaultValue={0}
          unit="°"
          onChange={(v) => handleAdjustmentChange('hue', v)}
        />
        <SliderControl
          label="Gamma"
          value={adj.gamma || 1.0}
          min={0.2}
          max={2.5}
          step={0.05}
          defaultValue={1.0}
          onChange={(v) => handleAdjustmentChange('gamma', v)}
        />
        <SliderControl
          label="Sharpness"
          value={adj.sharpness}
          min={0}
          max={100}
          defaultValue={0}
          onChange={(v) => handleAdjustmentChange('sharpness', v)}
        />
      </div>
    </div>
  );
};
