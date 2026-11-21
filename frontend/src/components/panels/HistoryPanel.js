import React from 'react';
import { Icon } from '../common/Icons';

export const HistoryPanel = ({ document, onUpdateDocument }) => {
  if (!document) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No active document</div>;
  }

  const historyList = document.history.getHistoryList();

  const handleJumpTo = (stateId) => {
    const success = document.jumpToHistoryState(stateId);
    if (success) {
      onUpdateDocument();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="lumina-panel-section-title" style={{ margin: 0, border: 'none' }}>
          History ({historyList.length})
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Click state to restore</span>
      </div>

      <div className="lumina-history-list">
        {historyList.map((item) => (
          <div
            key={item.id}
            className={`lumina-history-item ${item.isCurrent ? 'active' : ''} ${item.isFuture ? 'future' : ''}`}
            onClick={() => handleJumpTo(item.id)}
          >
            <div className="lumina-history-icon">
              <Icon name="history" size={14} color={item.isCurrent ? 'var(--accent-primary)' : 'currentColor'} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
