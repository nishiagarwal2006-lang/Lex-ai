import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Class-based error boundary — catches render errors in any child subtree
 * and renders a recovery UI instead of crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(err, info) {
    // Log to console in development; swap for a real error-reporting service in production.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', err, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
        >
          <div className="glass-card max-w-md p-10">
            <p className="font-mono text-4xl text-risk-high" aria-hidden="true">⚠</p>
            <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {this.state.message}
            </p>
            <button
              onClick={this.handleReset}
              className="neon-btn neon-btn-outline mt-6 px-6 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
