import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Application error boundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-white">
          <div className="max-w-md rounded-3xl border border-red-500/30 bg-gray-900 p-8 text-center shadow-2xl shadow-red-950/30">
            <p className="text-sm uppercase tracking-[0.3em] text-red-400">Application Error</p>
            <h1 className="mt-3 text-3xl font-semibold">Something broke in the UI</h1>
            <p className="mt-3 text-sm text-gray-300">
              Refresh the page to try again. If the issue keeps happening, check the console and the
              latest API responses.
            </p>
            <button
              className="mt-6 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
