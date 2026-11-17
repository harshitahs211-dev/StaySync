import React from 'react';
import { AlertCircle, RefreshCw, LogOut, Hotel } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[StaySync Uncaught Error Boundary]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('staysync_token');
      localStorage.removeItem('staysync_user');
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#FAF9F6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#343B36'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E4DC',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(52, 59, 54, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#EEF2EC',
              color: '#5B6A53',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Hotel size={30} />
            </div>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: 'Playfair Display, Georgia, serif',
              color: '#343B36',
              marginBottom: '0.5rem'
            }}>
              StaySync Interface Gateway
            </h2>

            <p style={{
              fontSize: '0.9rem',
              color: '#85877F',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              A rendering exception occurred. You can reload the application or reset your session cache to return directly to the login portal.
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: '#FBF0EE',
                border: '1px solid #F1C3BA',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#B34A3A',
                fontSize: '0.8rem',
                textAlign: 'left',
                marginBottom: '1.75rem',
                overflowX: 'auto'
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#5B6A53',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={15} /> Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="btn-secondary"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E4DC',
                  color: '#343B36',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={15} /> Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
