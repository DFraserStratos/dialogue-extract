import React from 'react';
import DialogueExtractor from './components/DialogueExtractor';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong. Please check the console for details.</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <DialogueExtractor />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;