import { useState, useEffect, useCallback } from "react";
import "./App.scss";
import CurrencyTile from "./components/CurrencyTile";
import AddCurrencyModal from "./components/AddCurrencyModal";
import {
  getCachedRates,
  fetchAndCacheRates,
  shouldRefreshRates,
} from "./utils/exchangeApi";
import { currencyData } from "./utils/currencyData";

function App() {
  const [currencies, setCurrencies] = useState([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
  ]);
  const [amounts, setAmounts] = useState({ USD: 100 });
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    loadExchangeRates();
  }, []);

  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      setAmounts((prevAmounts) => {
        const newAmounts = {};
        currencies.forEach((currency) => {
          if (currency === "USD") {
            newAmounts[currency] = prevAmounts.USD || 100;
          } else if (exchangeRates[currency]) {
            newAmounts[currency] = (
              (prevAmounts.USD || 100) * exchangeRates[currency]
            ).toFixed(2);
          }
        });
        return newAmounts;
      });
    }
  }, [exchangeRates, currencies]);

  const loadExchangeRates = async () => {
    setIsLoading(true);
    try {
      let rates = getCachedRates();

      if (!rates || shouldRefreshRates()) {
        rates = await fetchAndCacheRates();
      }

      setExchangeRates(rates.rates || {});
      setLastUpdated(rates.lastUpdated);
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const rates = await fetchAndCacheRates();
      setExchangeRates(rates.rates || {});
      setLastUpdated(rates.lastUpdated);
    } catch (error) {
      console.error("Failed to refresh rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (changedCurrency, newAmount) => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) return;

    const numericAmount = parseFloat(newAmount) || 0;
    const newAmounts = { [changedCurrency]: numericAmount.toString() };

    let usdAmount;
    if (changedCurrency === "USD") {
      usdAmount = numericAmount;
    } else if (exchangeRates[changedCurrency]) {
      usdAmount = numericAmount / exchangeRates[changedCurrency];
    } else {
      return;
    }

    currencies.forEach((currency) => {
      if (currency === changedCurrency) return;

      if (currency === "USD") {
        newAmounts[currency] = usdAmount.toFixed(2);
      } else if (exchangeRates[currency]) {
        newAmounts[currency] = (usdAmount * exchangeRates[currency]).toFixed(2);
      }
    });

    setAmounts((prev) => ({ ...prev, ...newAmounts }));
  };

  const addCurrency = (currencyCode) => {
    if (!currencies.includes(currencyCode)) {
      setCurrencies([...currencies, currencyCode]);

      const usdAmount = parseFloat(amounts.USD) || 100;
      if (currencyCode === "USD") {
        setAmounts((prev) => ({
          ...prev,
          [currencyCode]: usdAmount.toString(),
        }));
      } else if (exchangeRates[currencyCode]) {
        const convertedAmount = (
          usdAmount * exchangeRates[currencyCode]
        ).toFixed(2);
        setAmounts((prev) => ({ ...prev, [currencyCode]: convertedAmount }));
      }
    }
    setShowAddModal(false);
  };

  const removeCurrency = useCallback((currencyCode) => {
    // Use functional updates to ensure we're working with latest state
    setCurrencies((prevCurrencies) =>
      prevCurrencies.filter((code) => code !== currencyCode)
    );

    setAmounts((prevAmounts) => {
      const newAmounts = { ...prevAmounts };
      delete newAmounts[currencyCode];
      return newAmounts;
    });
  }, []);

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);

    // Add drag styling
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex !== null && index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newCurrencies = [...currencies];
    const draggedCurrency = newCurrencies[draggedIndex];

    // Remove dragged item
    newCurrencies.splice(draggedIndex, 1);

    // Insert at the exact drop position (grid-aware)
    newCurrencies.splice(dropIndex, 0, draggedCurrency);

    setCurrencies(newCurrencies);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch drag handlers for mobile
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [touchDragIndex, setTouchDragIndex] = useState(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e, index) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchDragIndex(index);
  };

  const handleTouchMove = (e, index) => {
    if (touchDragIndex !== index || !touchStartPos) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;

    // Only start dragging if moved enough
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setTouchOffset({ x: deltaX, y: deltaY });

      // Find drop target
      const elementBelow = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      const dropTarget = elementBelow?.closest(".currency-tile");
      if (dropTarget) {
        const dropIndex = parseInt(dropTarget.dataset.index);
        if (!isNaN(dropIndex) && dropIndex !== index) {
          setDragOverIndex(dropIndex);
        }
      }
    }
  };

  const handleTouchEnd = (e, index) => {
    if (touchDragIndex === index && dragOverIndex !== null) {
      // Perform the reorder
      const newCurrencies = [...currencies];
      const draggedCurrency = newCurrencies[index];
      newCurrencies.splice(index, 1);
      const insertIndex =
        index < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
      newCurrencies.splice(insertIndex, 0, draggedCurrency);
      setCurrencies(newCurrencies);
    }

    setTouchStartPos(null);
    setTouchDragIndex(null);
    setTouchOffset({ x: 0, y: 0 });
    setDragOverIndex(null);
  };

  const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* Metro Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="app-title">currency rates</h1>
            <div className="header-actions">
              <button
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh exchange rates"
              >
                <span className="refresh-icon">↻</span>
              </button>
            </div>
          </div>
          {lastUpdated && (
            <p className="last-updated">
              last updated {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </header>

        {/* Metro Currency Grid with Drag & Drop */}
        <div className="currency-grid">
          {currencies.map((currencyCode, index) => (
            <CurrencyTile
              key={currencyCode} // Use only currencyCode as key, not index
              currencyCode={currencyCode}
              amount={amounts[currencyCode] || "0"}
              onAmountChange={(newAmount) =>
                handleAmountChange(currencyCode, newAmount)
              }
              onRemove={() => removeCurrency(currencyCode)}
              getFlagEmoji={getFlagEmoji}
              currencyData={currencyData}
              isPrimary={currencyCode === "USD"}
              // Drag and drop props
              index={index}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              // Touch drag props
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={(e) => handleTouchMove(e, index)}
              onTouchEnd={(e) => handleTouchEnd(e, index)}
              touchOffset={
                touchDragIndex === index ? touchOffset : { x: 0, y: 0 }
              }
            />
          ))}
        </div>

        {/* Add Currency Button */}
        <div className="add-currency-section">
          <button
            className="add-currency-btn"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new currency"
          >
            <span className="add-icon">+</span>
            <span>add currency</span>
          </button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>updating rates...</p>
          </div>
        )}

        {/* Add Currency Modal */}
        {showAddModal && (
          <AddCurrencyModal
            onAdd={addCurrency}
            onClose={() => setShowAddModal(false)}
            existingCurrencies={currencies}
            getFlagEmoji={getFlagEmoji}
            currencyData={currencyData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
