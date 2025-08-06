import { useState, useEffect, useRef } from 'react'
import './AddCurrencyModal.scss'

const AddCurrencyModal = ({ 
  onAdd, 
  onClose, 
  existingCurrencies, 
  getFlagEmoji, 
  currencyData 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef(null)
  
  useEffect(() => {
    // Focus search input when modal opens
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }

    // Handle escape key
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [onClose])
  
  const availableCurrencies = Object.keys(currencyData)
    .filter(code => !existingCurrencies.includes(code))
    .filter(code => {
      const currency = currencyData[code]
      return (
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort()

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCurrencySelect = (code) => {
    onAdd(code)
  }

  const handleKeyDown = (e, currencyCode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCurrencySelect(currencyCode)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>add currency</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="search-section">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="search currencies..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            aria-label="Search currencies"
          />
        </div>
        
        <div className="currency-options" role="list">
          {availableCurrencies.length > 0 ? (
            availableCurrencies.map(code => {
              const currency = currencyData[code]
              return (
                <button
                  key={code}
                  className="currency-option"
                  onClick={() => handleCurrencySelect(code)}
                  onKeyDown={(e) => handleKeyDown(e, code)}
                  role="listitem"
                  aria-label={`Add ${currency.name} (${code})`}
                >
                  <div className="option-flag">
                    <span 
                      className={`fi fi-${currency.countryCode.toLowerCase()}`}
                      aria-hidden="true"
                    ></span>
                  </div>
                  <div className="option-info">
                    <div className="option-code">{code}</div>
                    <div className="option-name">{currency.name}</div>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="no-results">
              <p>no currencies found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <p className="currency-count">
            {availableCurrencies.length} currencies available
          </p>
        </div>
      </div>
    </div>
  )
}

export default AddCurrencyModal