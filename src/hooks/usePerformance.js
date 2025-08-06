import { useCallback, useRef, useEffect } from 'react'

// Custom hook for 60fps animations
export const useRAF = () => {
  const rafRef = useRef()
  
  const animate = useCallback((callback) => {
    const tick = (timestamp) => {
      callback(timestamp)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])
  
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])
  
  useEffect(() => {
    return () => stop()
  }, [stop])
  
  return { animate, stop }
}

// Debounced updates for smooth performance
export const useThrottledCallback = (callback, delay) => {
  const timeoutRef = useRef()
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
}

// Performance monitoring
export const useFPS = () => {
  const fpsRef = useRef(60)
  const frameTimeRef = useRef(performance.now())
  
  useEffect(() => {
    let animationId
    
    const measureFPS = () => {
      const now = performance.now()
      const delta = now - frameTimeRef.current
      fpsRef.current = Math.round(1000 / delta)
      frameTimeRef.current = now
      
      // Log if FPS drops below 55
      if (fpsRef.current < 55) {
        console.warn('FPS drop detected:', fpsRef.current)
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }
    
    measureFPS()
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])
  
  return fpsRef.current
}