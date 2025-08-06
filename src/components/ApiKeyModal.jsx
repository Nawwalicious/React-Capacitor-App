// components/ApiKeyModal.jsx
import { useState, useRef, useEffect } from 'react';
import './AddCurrencyModal.scss'; // Reuse existing modal styles

const ApiKeyModal = ({ onSave, onClose, onClear, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validateApiKey = async (key) => {
    if (!key || key.length < 10) {
      throw new Error('API key appears to be invalid (too short)');
    }
    
    const testUrl = `https://v6.exchangerate-api.com/v6/${key}/latest/USD`;
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'API key validation failed');
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setValidationError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      await validateApiKey(apiKey.trim());
      onSave(apiKey.trim());
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isValidating) {
      handleSave();
    }
  };

  const handleClear = () => {
    if (window.confirm('are you sure you want to remove the saved api key?')) {
      onClear();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>api key configuration</h2>
          <button className="close-btn" onClick={onClose} aria-label="close">×</button>
        </div>
        
        <div style={{ padding: '24px' }}>
          {/* Metro-style disclaimer section */}
          <div style={{ 
            background: 'var(--surface-color)', 
            padding: '20px', 
            marginBottom: '24px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            border: '1px solid var(--text-disabled)'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: 'var(--text-primary)'
            }}>
              disclaimer
            </h3>
            <p style={{ marginBottom: '12px' }}>
              this application uses exchangerate-api.com for currency data. we are not affiliated with, 
              endorsed by, or receive compensation from exchangerate-api.
            </p>
            <p style={{ margin: 0 }}>
              <strong>privacy notice:</strong> your api key is stored locally on your device only. 
              we never transmit it to our servers.
            </p>
          </div>

          {/* Metro-style setup instructions */}
          <div style={{ 
            marginBottom: '32px',
            padding: '20px',
            background: 'var(--card-color)',
            border: '1px solid var(--text-disabled)'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              setup instructions
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                fontSize: '0.875rem'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: 'var(--accent-color)', 
                  color: 'white',
                  borderRadius: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  1
                </div>
                <span>
                  visit{' '}
                  <a 
                    href="https://www.exchangerate-api.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'var(--accent-color)',
                      textDecoration: 'underline'
                    }}
                  >
                    exchangerate-api.com
                  </a>
                  {' '}and create a free account
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                fontSize: '0.875rem'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: 'var(--accent-color)', 
                  color: 'white',
                  borderRadius: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  2
                </div>
                <span>copy your api key from the dashboard</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                fontSize: '0.875rem'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: 'var(--accent-color)', 
                  color: 'white',
                  borderRadius: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  3
                </div>
                <span>paste it below and save</span>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
              margin: '16px 0 0 0',
              fontStyle: 'italic'
            }}>
              free accounts include 1,500 requests per month
            </p>
          </div>

          {/* Metro-style input section */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              api key
            </label>
            <input
              ref={inputRef}
              type="password"
              className="search-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="paste your api key here"
              disabled={isValidating}
              style={{ 
                marginBottom: '8px',
                fontSize: '0.875rem'
              }}
            />
            {validationError && (
              <div style={{ 
                color: '#d32f2f', 
                fontSize: '0.875rem', 
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)'
              }}>
                {validationError}
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer" style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '20px 24px'
        }}>
          {currentKey && onClear && (
            <button 
              onClick={handleClear}
              style={{ 
                background: 'transparent',
                color: '#d32f2f',
                border: '2px solid #d32f2f',
                padding: '12px 24px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'lowercase',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#d32f2f';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#d32f2f';
              }}
            >
              remove key
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isValidating}
            style={{ 
              background: isValidating ? 'var(--text-disabled)' : 'var(--accent-color)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              cursor: isValidating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'lowercase',
              transition: 'all 0.25s ease'
            }}
          >
            {isValidating ? 'validating key...' : currentKey ? 'update key' : 'save & test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;