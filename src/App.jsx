import React from 'react';
import DialogueExtractor from './components/DialogueExtractor';
import './styles.css';

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
      return <div className="error">Something went wrong. Please check the console for details.</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <DialogueExtractor />
      </div>
    </ErrorBoundary>
  );
}

export default App;