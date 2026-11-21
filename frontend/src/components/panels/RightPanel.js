import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { FiltersPanel } from './FiltersPanel';
import { LayersPanel } from './LayersPanel';
import { HistoryPanel } from './HistoryPanel';
import { PropertiesPanel } from './PropertiesPanel';

export const RightPanel = ({ document, onUpdateDocument }) => {
  const [activeTab, setActiveTab] = useState('adjustments');

  const tabs = [
    { id: 'adjustments', label: 'Adjust', icon: 'sliders' },
    { id: 'filters', label: 'Filters', icon: 'filter' },
    { id: 'layers', label: 'Layers', icon: 'layers' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'properties', label: 'Info', icon: 'info' }
  ];

  return (
    <aside className="lumina-right-panel">
      {/* Top Tab Bar */}
      <div className="lumina-panel-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`lumina-panel-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <Icon name={tab.icon} size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="lumina-panel-body">
        {activeTab === 'adjustments' && (
          <AdjustmentsPanel document={document} onUpdateDocument={onUpdateDocument} />
        )}
        {activeTab === 'filters' && (
          <FiltersPanel document={document} onUpdateDocument={onUpdateDocument} />
        )}
        {activeTab === 'layers' && (
          <LayersPanel document={document} onUpdateDocument={onUpdateDocument} />
        )}
        {activeTab === 'history' && (
          <HistoryPanel document={document} onUpdateDocument={onUpdateDocument} />
        )}
        {activeTab === 'properties' && (
          <PropertiesPanel document={document} />
        )}
      </div>
    </aside>
  );
};
