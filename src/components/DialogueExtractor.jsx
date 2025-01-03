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

  const processJsonChunk = useCallback((jsonData, start, chunkSize) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = [];
        
        const processObject = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return;

          if (Array.isArray(obj.fieldInstances)) {
            obj.fieldInstances.forEach(field => {
              if (
                field.__identifier?.match(/^Dialogue[123]?$/) &&
                field.__value !== null
              ) {
                results.push({
                  path: `${path}.${field.__identifier}`,
                  type: field.__identifier,
                  content: field.__value,
                  metadata: {
                    name: obj.fieldInstances.find(f => f.__identifier === 'Name')?.__value,
                    type: obj.fieldInstances.find(f => f.__identifier === 'Type')?.__value
                  }
                });
              }
            });
          }

          for (const [key, value] of Object.entries(obj)) {
            const newPath = path ? `${path}.${key}` : key;
            
            if (
              (key === 'Dialogue' || 
               key === 'Dialogue1' || 
               key === 'Dialogue2' || 
               key === 'Dialogue3') && 
              value !== null
            ) {
              results.push({
                path: newPath,
                type: key,
                content: value,
                metadata: {
                  name: obj.Name || null,
                  type: obj.Type || null
                }
              });
            }
            
            if (value && typeof value === 'object') {
              processObject(value, newPath);
            }
          }
        };

        const chunk = Object.entries(jsonData).slice(start, start + chunkSize);
        chunk.forEach(([key, value]) => {
          processObject({ [key]: value });
        });

        resolve(results);
      }, 0);
    });
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setDialogues([]);
    setProgress(0);

    try {
      const fileSize = file.size;
      if (fileSize > 100 * 1024 * 1024) {
        throw new Error('File too large. Please use a file smaller than 100MB.');
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          const totalEntries = Object.entries(jsonData).length;
          const chunkSize = 1000;
          const results = [];

          for (let i = 0; i < totalEntries; i += chunkSize) {
            const chunkResults = await processJsonChunk(jsonData, i, chunkSize);
            results.push(...chunkResults);
            setProgress(Math.min(100, Math.round((i + chunkSize) / totalEntries * 100)));
          }

          setDialogues(results);
        } catch (error) {
          setError('Error parsing JSON file. Please ensure it\'s valid JSON.');
          console.error('Error parsing JSON:', error);
        }
      };

      reader.onerror = () => {
        setError('Error reading file. Please try again.');
      };

      reader.readAsText(file);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollPercent = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100;
    const totalItems = dialogues.length;
    const start = Math.floor((scrollPercent / 100) * Math.max(0, totalItems - 50));
    setVisibleRange({ start, end: start + 50 });
  }, [dialogues.length]);

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