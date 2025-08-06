// utils/exchangeApi.js
const CACHE_KEY = 'currency_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const getCachedRates = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

export const setCachedRates = (data) => {
  try {
    const cacheData = {
      rates: data.conversion_rates,
      lastUpdated: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    return cacheData;
  } catch (error) {
    console.error('Error setting cache:', error);
    return null;
  }
};

export const shouldRefreshRates = () => {
  const cached = getCachedRates();
  if (!cached || !cached.lastUpdated) return true;
  
  return (Date.now() - cached.lastUpdated) > CACHE_DURATION;
};

export const fetchAndCacheRates = async (apiKey) => {
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  
  const API_URL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'API returned error');
    }
    
    return setCachedRates(data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return cached data if available (for offline use)
    const cached = getCachedRates();
    if (cached && !error.message.includes('API_KEY')) {
      return cached;
    }
    
    throw error;
  }
};