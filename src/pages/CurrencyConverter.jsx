// CurrencyConverter.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../App.scss";
import CurrencyTile from "../components/CurrencyTile";
import AddCurrencyModal from "../components/AddCurrencyModal";
import ApiKeyModal from "../components/ApiKeyModal";
import { useDatabase } from "../hooks/useDatabase";
import {
  getCachedRates,
  fetchAndCacheRates,
  shouldRefreshRates,
} from "../utils/exchangeApi";
import { currencyData } from "../utils/currencyData";

const PageHeader = ({ title }) => (
  <header className="page-header">
    <Link to="/" className="back-btn" aria-label="Go back to Dashboard">
      ‹
    </Link>
    <h1 className="page-title">{title}</h1>
  </header>
);

function CurrencyConverter() {
  const { isDbReady, getApiKey, setApiKey, clearApiKey } = useDatabase();

  // Existing state
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

  // New state for API key
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState(null);

  // Existing drag state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [touchDragIndex, setTouchDragIndex] = useState(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });

  // Check for API key when DB is ready
  useEffect(() => {
    const checkApiKey = async () => {
      if (isDbReady) {
        const apiKey = await getApiKey();
        setCurrentApiKey(apiKey);

        if (!apiKey && !getCachedRates()) {
          setShowApiKeyModal(true);
        } else if (apiKey) {
          loadExchangeRates();
        }
      }
    };

    checkApiKey();
  }, [isDbReady, getApiKey]);

  // Existing useEffect for amounts calculation
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
        const apiKey = currentApiKey || (await getApiKey());
        if (apiKey) {
          rates = await fetchAndCacheRates(apiKey);
        }
      }

      if (rates) {
        setExchangeRates(rates.rates || {});
        setLastUpdated(rates.lastUpdated);
      }
    } catch (error) {
      console.error("Failed to load exchange rates:", error);

      if (
        error.message === "API_KEY_MISSING" ||
        error.message === "API_KEY_INVALID"
      ) {
        setShowApiKeyModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const apiKey = currentApiKey || (await getApiKey());
      if (!apiKey) {
        setShowApiKeyModal(true);
        return;
      }

      const rates = await fetchAndCacheRates(apiKey);
      setExchangeRates(rates.rates || {});
      setLastUpdated(rates.lastUpdated);
    } catch (error) {
      console.error("Failed to refresh rates:", error);

      if (error.message === "API_KEY_INVALID") {
        setShowApiKeyModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = async (newApiKey) => {
    try {
      await setApiKey(newApiKey);
      setCurrentApiKey(newApiKey);
      setShowApiKeyModal(false);
      loadExchangeRates();
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  };

  const handleApiKeyClear = async () => {
    try {
      await clearApiKey();
      setCurrentApiKey(null);
      setExchangeRates({});
      setShowApiKeyModal(false);
    } catch (error) {
      console.error("Failed to clear API key:", error);
    }
  };

  // All your existing handlers remain the same...
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
    setCurrencies((prevCurrencies) =>
      prevCurrencies.filter((code) => code !== currencyCode)
    );

    setAmounts((prevAmounts) => {
      const newAmounts = { ...prevAmounts };
      delete newAmounts[currencyCode];
      return newAmounts;
    });
  }, []);

  // All your existing drag handlers remain the same...
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.classList.remove("dragging");
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
    newCurrencies.splice(draggedIndex, 1);
    newCurrencies.splice(dropIndex, 0, draggedCurrency);

    setCurrencies(newCurrencies);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setTouchOffset({ x: deltaX, y: deltaY });

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
    if (
      touchDragIndex === index &&
      dragOverIndex !== null &&
      dragOverIndex !== index
    ) {
      const newCurrencies = [...currencies];
      const draggedCurrency = newCurrencies[touchDragIndex];

      newCurrencies.splice(touchDragIndex, 1);
      newCurrencies.splice(dragOverIndex, 0, draggedCurrency);

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

  // No API key state component
  const NoApiKeyState = () => (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "var(--card-color)",
        margin: "24px 0",
        border: "1px solid var(--text-disabled)",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "var(--accent-color)",
          margin: "0 auto 24px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          style={{ width: "40px", height: "40px", fill: "white" }}
        >
          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      </div>
      <h3
        style={{
          marginBottom: "12px",
          fontWeight: "300",
          fontSize: "1.5rem",
          color: "var(--text-primary)",
        }}
      >
        api key required
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "32px",
          fontSize: "0.875rem",
          lineHeight: "1.4",
          maxWidth: "400px",
          margin: "0 auto 32px auto",
        }}
      >
        to access live exchange rates, configure your free api key from
        exchangerate-api.com
      </p>
      <button
        className="add-currency-btn"
        onClick={() => setShowApiKeyModal(true)}
        style={{
          maxWidth: "250px",
          backgroundColor: "var(--accent-color)",
          border: "2px solid var(--accent-color)",
          color: "white",
          textTransform: "lowercase",
          fontWeight: "600",
        }}
      >
        configure api key
      </button>
    </div>
  );

  return (
    <>
      <PageHeader title="currency rates" />

      <header className="header" style={{ marginBottom: 0 }}>
        <div className="header-content" style={{ alignItems: "center" }}>
          {lastUpdated && (
            <p className="last-updated" style={{ margin: 0 }}>
              last updated {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
          <div className="header-actions">
            {currentApiKey && (
              <button
                className="refresh-btn"
                onClick={() => setShowApiKeyModal(true)}
                title="Manage API Key"
                style={{ marginRight: "8px" }}
              >
                <span>🔑</span>
              </button>
            )}
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading || !currentApiKey}
              aria-label="Refresh exchange rates"
            >
              <span className="refresh-icon">↻</span>
            </button>
          </div>
        </div>
      </header>

      {!currentApiKey &&
        !Object.keys(exchangeRates).length &&
        !isLoading &&
        isDbReady && <NoApiKeyState />}

      {Object.keys(exchangeRates).length > 0 && (
        <>
          <div className="currency-grid">
            {currencies.map((currencyCode, index) => (
              <CurrencyTile
                key={currencyCode}
                currencyCode={currencyCode}
                amount={amounts[currencyCode] || "0"}
                onAmountChange={(newAmount) =>
                  handleAmountChange(currencyCode, newAmount)
                }
                onRemove={() => removeCurrency(currencyCode)}
                getFlagEmoji={getFlagEmoji}
                currencyData={currencyData}
                isPrimary={currencyCode === "USD"}
                index={index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onTouchEnd={(e) => handleTouchEnd(e, index)}
                touchOffset={
                  touchDragIndex === index ? touchOffset : { x: 0, y: 0 }
                }
              />
            ))}
          </div>

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
        </>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>updating rates...</p>
        </div>
      )}

      {showAddModal && (
        <AddCurrencyModal
          onAdd={addCurrency}
          onClose={() => setShowAddModal(false)}
          existingCurrencies={currencies}
          getFlagEmoji={getFlagEmoji}
          currencyData={currencyData}
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          onSave={handleApiKeySave}
          onClose={() => setShowApiKeyModal(false)}
          onClear={currentApiKey ? handleApiKeyClear : null}
          currentKey={currentApiKey}
        />
      )}
    </>
  );
}

export default CurrencyConverter;
