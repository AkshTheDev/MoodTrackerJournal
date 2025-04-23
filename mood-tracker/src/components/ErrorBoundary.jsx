import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops, something went wrong!</h2>
          <p>Don't worry, your data is safe. Try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="error-button"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="error-details">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;