import React from 'react';
import { Icon } from './Icons';

export const SliderControl = ({
  label,
  value,
  min = -100,
  max = 100,
  step = 1,
  defaultValue = 0,
  unit = '',
  onChange,
  onReset
}) => {
  const isChanged = value !== defaultValue;

  const handleInputChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.max(min, Math.min(max, val)));
    }
  };

  return (
    <div className="lumina-slider-group">
      <div className="lumina-slider-header">
        <span className="lumina-slider-label">{label}</span>
        <div className="lumina-slider-value-box">
          <input
            type="number"
            className="lumina-slider-value"
            value={Math.round(value * 100) / 100}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
          />
          {unit && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{unit}</span>}
          {isChanged && (
            <button
              className="lumina-slider-reset"
              title="Reset"
              onClick={() => onReset ? onReset() : onChange(defaultValue)}
            >
              <Icon name="reset" size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="lumina-slider-row">
        <input
          type="range"
          className="lumina-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};
