import React, { Component } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { logger } from '../../utils/logger.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    logger.error('React Root ErrorBoundary intercepted runtime crash:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl">
            <div className="inline-flex p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
              <AlertOctagon className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Application Exception</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                An unexpected runtime error occurred. Our system has logged the crash for diagnosis.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-left font-mono text-xs text-rose-300 overflow-x-auto max-h-32">
                <p className="font-bold">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 rounded-xl border border-slate-700 transition-all text-sm"
              >
                <Home className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
