import React from 'react';
import { FiltersEngine } from '../../engine/FiltersEngine';
import { SliderControl } from '../common/SliderControl';
import { Icon } from '../common/Icons';

export const FiltersPanel = ({ document, onUpdateDocument }) => {
  if (!document) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No active document</div>;
  }

  const handleSelectFilter = (filterId) => {
    document.filterId = filterId;
    if (document.filterIntensity === 0) document.filterIntensity = 1.0;
    document.isDirty = true;
    document.saveHistoryState(`Apply ${filterId} filter`);
    onUpdateDocument();
  };

  const handleIntensityChange = (val) => {
    document.filterIntensity = val;
    document.isDirty = true;
    onUpdateDocument();
  };

  const handleResetFilter = () => {
    document.filterId = 'none';
    document.filterIntensity = 1.0;
    document.isDirty = true;
    document.saveHistoryState('Clear Filter');
    onUpdateDocument();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="lumina-panel-section-title" style={{ margin: 0, border: 'none' }}>
          Creative Filters
        </span>
        {document.filterId !== 'none' && (
          <button className="lumina-btn small" onClick={handleResetFilter}>
            <Icon name="reset" size={11} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter Intensity Slider */}
      {document.filterId !== 'none' && (
        <SliderControl
          label="Filter Intensity"
          value={Math.round(document.filterIntensity * 100)}
          min={0}
          max={100}
          defaultValue={100}
          unit="%"
          onChange={(v) => handleIntensityChange(v / 100)}
        />
      )}

      {/* Filter Grid */}
      <div className="lumina-filters-grid">
        {FiltersEngine.FILTERS.map((f) => {
          const isActive = document.filterId === f.id;
          return (
            <div
              key={f.id}
              className={`lumina-filter-card ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectFilter(f.id)}
            >
              <div className="lumina-filter-preview-box">
                <Icon name={f.icon || 'filter'} size={24} color={isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
              </div>
              <span className="lumina-filter-name">{f.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
