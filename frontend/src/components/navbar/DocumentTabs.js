import React from 'react';
import { Icon } from '../common/Icons';

export const DocumentTabs = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCloseDocument,
  onNewDocument
}) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="lumina-tabs-bar">
      {documents.map((doc) => {
        const isActive = doc.id === activeDocumentId;
        return (
          <div
            key={doc.id}
            className={`lumina-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectDocument(doc.id)}
            title={doc.filePath || doc.name}
          >
            <span className="lumina-tab-title">{doc.name}</span>
            {doc.isDirty && <span className="lumina-tab-dirty" title="Unsaved changes" />}
            <button
              className="lumina-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onCloseDocument(doc.id);
              }}
              title="Close Tab"
            >
              <Icon name="close" size={11} />
            </button>
          </div>
        );
      })}
      <button className="lumina-tab-add" onClick={onNewDocument} title="New Document (Ctrl+N)">
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
};
