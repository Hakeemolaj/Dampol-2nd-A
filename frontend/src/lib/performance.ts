// Performance monitoring and optimization utilities

// Cache implementation for API responses
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100; // Maximum number of cached items

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new CacheManager();

// Performance metrics collection
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  // Measure page load performance
  measurePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.addMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        this.addMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.addMetric('first_paint', this.getFirstPaint());
        this.addMetric('first_contentful_paint', this.getFirstContentfulPaint());
        this.addMetric('largest_contentful_paint', this.getLargestContentfulPaint());
        this.addMetric('cumulative_layout_shift', this.getCumulativeLayoutShift());
        this.addMetric('first_input_delay', this.getFirstInputDelay());
      }
    });
  }

  // Add custom metric
  addMetric(name: string, value: number, url?: string): void {
    if (this.metrics.length >= this.maxMetrics) {
      this.metrics.shift(); // Remove oldest metric
    }

    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      url: url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
  }

  // Get performance metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Send metrics to analytics service
  async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      // In a real application, you would send this to your analytics service
      console.log('Performance Metrics:', this.metrics);
      
      // Example: Send to Google Analytics or custom endpoint
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.metrics),
      // });
      
      this.clearMetrics();
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? lastEntry.startTime : 0);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }) as any;
  }

  private getCumulativeLayoutShift(): number {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        resolve(clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }) as any;
  }

  private getFirstInputDelay(): number {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0];
        resolve(firstEntry ? (firstEntry as any).processingStart - firstEntry.startTime : 0);
      }).observe({ entryTypes: ['first-input'] });
    }) as any;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading utility for components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(importFunc);
  
  if (fallback) {
    return React.lazy(() => 
      importFunc().catch(() => ({ default: fallback }))
    );
  }
  
  return LazyComponent;
}

// Image preloader utility
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export async function preloadImages(srcs: string[]): Promise<void> {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
}

// Resource hints utility
export function addResourceHint(
  href: string,
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch',
  as?: string,
  crossorigin?: boolean
): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  
  if (as) link.setAttribute('as', as);
  if (crossorigin) link.setAttribute('crossorigin', 'anonymous');
  
  document.head.appendChild(link);
}

// Critical CSS inlining utility
export function inlineCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

// Service Worker registration
export async function registerServiceWorker(swPath: string = '/sw.js'): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath);
    console.log('Service Worker registered:', registration);
    
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, prompt user to refresh
            if (confirm('New content is available. Refresh to update?')) {
              window.location.reload();
            }
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  performanceMonitor.measurePageLoad();
  
  // Send metrics periodically
  setInterval(() => {
    performanceMonitor.sendMetrics();
  }, 30000); // Every 30 seconds
  
  // Send metrics before page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.sendMetrics();
  });
}

// Bundle size analyzer (development only)
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.group('Bundle Analysis');
  console.log('Scripts:', scripts.length);
  console.log('Stylesheets:', styles.length);
  
  scripts.forEach((script: any) => {
    console.log(`Script: ${script.src}`);
  });
  
  styles.forEach((style: any) => {
    console.log(`Stylesheet: ${style.href}`);
  });
  
  console.groupEnd();
}
