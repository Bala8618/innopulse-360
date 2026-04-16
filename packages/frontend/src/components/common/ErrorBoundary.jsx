import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  componentDidCatch() {
    // noop: fallback UI already shown
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          <h2 className="text-lg font-semibold">SaaS page crashed</h2>
          <p className="mt-1 text-sm">{this.state.message}</p>
          <p className="mt-2 text-xs">Restart frontend after installing dependencies.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

