import React, { memo, useCallback, useRef, useEffect } from 'react'
import { useRAF } from '../hooks/usePerformance'
import './CurrencyTile.scss'

const CurrencyTile = memo(({ 
  currencyCode, 
  amount, 
  onAmountChange,
  onRemove, 
  getFlagEmoji, 
  currencyData,
  isPrimary = false,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  touchOffset
}) => {
  const currency = currencyData[currencyCode]
  const tileRef = useRef(null)
  const { animate, stop } = useRAF()
  
  if (!currency) return null

  // Memoized input change handler
  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value)
    }
  }, [onAmountChange])

  // Optimized blur handler
  const handleInputBlur = useCallback((e) => {
    const value = e.target.value
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue)) {
      onAmountChange(numericValue.toString())
    } else {
      onAmountChange('0')
    }
  }, [onAmountChange])

  // Smooth drag animation using RAF
  useEffect(() => {
    if (touchOffset.x !== 0 || touchOffset.y !== 0) {
      const tile = tileRef.current
      if (tile) {
        // Use requestAnimationFrame for smooth updates
        animate(() => {
          tile.style.transform = `translate3d(${touchOffset.x}px, ${touchOffset.y}px, 0) scale(1.05)`
          tile.style.zIndex = '1000'
        })
      }
    } else {
      stop()
      const tile = tileRef.current
      if (tile) {
        tile.style.transform = ''
        tile.style.zIndex = ''
      }
    }
  }, [touchOffset, animate, stop])

  const tileClasses = [
    'currency-tile',
    isPrimary ? 'primary' : '',
    isDragging ? 'dragging' : '',
    isDragOver ? 'drag-over' : '',
    'live'
  ].filter(Boolean).join(' ')

  return (
    <div 
      ref={tileRef}
      className={tileClasses}
      draggable={true}
      data-index={index}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`${currency.name} currency tile. Drag to reorder.`}
    >
      <button 
        className="remove-btn" 
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${currency.name}`}
      >
        ×
      </button>
      
      <div className="tile-content">
        <div className="currency-header">
          <div className="currency-flag">
            <span 
              className={`fi fi-${currency.countryCode.toLowerCase()}`}
              aria-hidden="true"
            ></span>
          </div>
          <div className="currency-info">
            <div className="currency-code">{currencyCode}</div>
            <div className="currency-name">{currency.name}</div>
          </div>
        </div>
        
        <div className="currency-amount">
          <span className="currency-symbol" aria-hidden="true">
            {currency.symbol}
          </span>
          <input
            type="text"
            value={amount}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="amount-input"
            placeholder="0"
            aria-label={`Amount in ${currency.name}`}
            inputMode="decimal"
          />
        </div>
      </div>
      
      <div className="drag-indicator" aria-hidden="true">
        <span>⋮⋮</span>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.currencyCode === nextProps.currencyCode &&
    prevProps.amount === nextProps.amount &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isDragOver === nextProps.isDragOver &&
    prevProps.touchOffset.x === nextProps.touchOffset.x &&
    prevProps.touchOffset.y === nextProps.touchOffset.y &&
    prevProps.isPrimary === nextProps.isPrimary
  )
})

CurrencyTile.displayName = 'CurrencyTile'

export default CurrencyTile