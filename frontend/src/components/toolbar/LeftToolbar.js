import React from 'react';
import { Icon } from '../common/Icons';

export const TOOLS = [
  { id: 'move', name: 'Move Tool', icon: 'move', shortcut: 'V' },
  { id: 'select-rect', name: 'Rectangular Marquee', icon: 'select-rect', shortcut: 'M' },
  { id: 'select-lasso', name: 'Lasso Selection', icon: 'select-lasso', shortcut: 'L' },
  { id: 'crop', name: 'Crop Tool', icon: 'crop', shortcut: 'C' },
  { id: 'brush', name: 'Brush Tool', icon: 'brush', shortcut: 'B' },
  { id: 'eraser', name: 'Eraser Tool', icon: 'eraser', shortcut: 'E' },
  { id: 'text', name: 'Text Tool', icon: 'text', shortcut: 'T' },
  { id: 'shape', name: 'Shape Tool', icon: 'shape', shortcut: 'U' },
  { id: 'eyedropper', name: 'Eyedropper Tool', icon: 'eyedropper', shortcut: 'I' },
  { id: 'hand', name: 'Hand / Pan Tool', icon: 'hand', shortcut: 'H' },
  { id: 'zoom', name: 'Zoom Tool', icon: 'zoom', shortcut: 'Z' }
];

export const LeftToolbar = ({
  activeTool,
  onSelectTool,
  primaryColor,
  secondaryColor,
  onChangePrimaryColor,
  onChangeSecondaryColor
}) => {
  return (
    <aside className="lumina-toolbar">
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            className={`lumina-tool-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTool(tool.id)}
            title={`${tool.name} (${tool.shortcut})`}
          >
            <Icon name={tool.icon} size={20} />
            <span className="lumina-tool-shortcut-badge">{tool.shortcut}</span>
          </button>
        );
      })}

      {/* Primary & Secondary Color Swatches */}
      <div className="lumina-tool-colors">
        <input
          type="color"
          className="lumina-swatch-primary"
          value={primaryColor}
          onChange={(e) => onChangePrimaryColor(e.target.value)}
          title="Foreground Color"
        />
        <input
          type="color"
          className="lumina-swatch-secondary"
          value={secondaryColor}
          onChange={(e) => onChangeSecondaryColor(e.target.value)}
          title="Background Color"
        />
      </div>
    </aside>
  );
};
