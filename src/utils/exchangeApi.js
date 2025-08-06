const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
const CACHE_KEY = 'currency_rates'
const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION) || 24 * 60 * 60 * 1000

export const getCachedRates = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

export const setCachedRates = (data) => {
  try {
    const cacheData = {
      rates: data.conversion_rates,
      lastUpdated: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    return cacheData
  } catch (error) {
    console.error('Error setting cache:', error)
    return null
  }
}

export const shouldRefreshRates = () => {
  const cached = getCachedRates()
  if (!cached || !cached.lastUpdated) return true
  
  const now = Date.now()
  const timeSinceUpdate = now - cached.lastUpdated
  
  return timeSinceUpdate > CACHE_DURATION
}

export const fetchAndCacheRates = async () => {
  try {
    const response = await fetch(API_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.result !== 'success') {
      throw new Error('API returned error result')
    }
    
    return setCachedRates(data)
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Return cached data if available, even if expired
    const cached = getCachedRates()
    if (cached) {
      return cached
    }
    
    throw error
  }
}