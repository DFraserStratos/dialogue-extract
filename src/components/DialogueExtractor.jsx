import React, { useState, useCallback } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import '../styles.css';

const DialogueExtractor = () => {
  const [dialogues, setDialogues] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  // Keep the existing processing functions (processJsonChunk, handleFileUpload, etc)
  
  return (
    <div className="container">
      <div className="header">
        <h1>Dialogue Extractor</h1>
        <label className="file-input-label">
          Upload JSON File (up to 100MB)
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isProcessing}
          />
        </label>
      </div>

      {error && (
        <div className="error">
          <AlertCircle style={{ marginRight: '8px' }} />
          {error}
        </div>
      )}
      
      {isProcessing && (
        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {dialogues.length > 0 && (
        <div className="dialogues-container">
          <div className="dialogues-header">
            <h2>Found Dialogues: {dialogues.length}</h2>
            <button
              onClick={() => {
                const csvData = Papa.unparse(dialogues.map(d => ({
                  Character: d.metadata?.name || 'Unknown',
                  Type: d.type,
                  Path: d.path,
                  Content: d.content
                })));
                
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'dialogue_export.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="export-button"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
          <div className="dialogues-list" onScroll={handleScroll}>
            {dialogues
              .slice(visibleRange.start, visibleRange.end)
              .map((dialogue, index) => (
                <div 
                  key={visibleRange.start + index} 
                  className="dialogue-item"
                >
                  {dialogue.metadata?.name && (
                    <div className="character-name">
                      Character: {dialogue.metadata.name}
                    </div>
                  )}
                  <div className="dialogue-type">
                    Type: {dialogue.type}
                  </div>
                  <div className="dialogue-path">
                    Path: {dialogue.path}
                  </div>
                  <div className="dialogue-content">
                    {dialogue.content}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DialogueExtractor;