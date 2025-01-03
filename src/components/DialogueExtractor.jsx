import React, { useState, useCallback } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import { Alert, AlertDescription } from './ui/alert';

const DialogueExtractor = () => {
  const [dialogues, setDialogues] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  // ... (keep all the existing processing functions)

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">Dialogue Extractor</h2>
          <label htmlFor="jsonFile" className="text-sm font-medium text-foreground">
            Upload JSON File (up to 100MB)
          </label>
          <input
            id="jsonFile"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="border border-input rounded-md p-2 bg-background text-foreground"
            disabled={isProcessing}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isProcessing && (
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {dialogues.length > 0 && (
          <div 
            className="mt-6 max-h-96 overflow-y-auto rounded-md border border-border"
            onScroll={handleScroll}
          >
            <div className="flex justify-between items-center p-4 border-b border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                Found Dialogues: {dialogues.length}
              </h3>
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
                className="inline-flex items-center px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
            <div className="space-y-4 p-4">
              {dialogues
                .slice(visibleRange.start, visibleRange.end)
                .map((dialogue, index) => (
                  <div 
                    key={visibleRange.start + index} 
                    className="border border-border rounded-lg p-4 bg-card/50"
                  >
                    {dialogue.metadata?.name && (
                      <div className="text-sm text-primary mb-1">
                        Character: {dialogue.metadata.name}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mb-1">
                      Type: {dialogue.type}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Path: {dialogue.path}
                    </div>
                    <div className="whitespace-pre-wrap text-foreground">
                      {dialogue.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogueExtractor;