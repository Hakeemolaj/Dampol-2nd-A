// Global type definitions for the frontend application
/// <reference types="jest" />
/// <reference types="react" />
/// <reference types="node" />

declare global {
  // Jest globals for test files
  const describe: any;
  const it: any;
  const test: any;
  const expect: any;
  const beforeEach: any;
  const afterEach: any;
  const beforeAll: any;
  const afterAll: any;

  // Node.js globals
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_API_URL?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    }

    interface Timeout {
      ref(): this;
      unref(): this;
    }
  }

  // Browser globals
  interface Window {
    // PWA related
    workbox?: any;
    __WB_MANIFEST?: any;
    
    // Performance monitoring
    gtag?: (...args: any[]) => void;
    
    // HLS.js
    Hls?: any;
  }

  // Extend existing Fetch API types if needed
  interface RequestInit {
    // Additional properties can be added here if needed
  }

  // Performance API extensions
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  // Navigator extensions
  interface Navigator {
    share?: (data: ShareData) => Promise<void>;
    serviceWorker?: ServiceWorkerContainer;
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
  }

  // Screen Orientation API
  interface Screen {
    orientation?: ScreenOrientation;
  }

  interface ScreenOrientation {
    lock?: (orientation: string) => Promise<void>;
    unlock?: () => void;
    angle?: number;
    type?: string;
  }
}

// Module declarations for libraries without types
declare module 'hls.js' {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      MANIFEST_PARSED: string;
      ERROR: string;
      LEVEL_SWITCHED: string;
      FRAG_LOADED: string;
      MEDIA_ATTACHED: string;
      MEDIA_DETACHED: string;
    };
    static ErrorTypes: {
      NETWORK_ERROR: string;
      MEDIA_ERROR: string;
      KEY_SYSTEM_ERROR: string;
      MUX_ERROR: string;
      OTHER_ERROR: string;
    };
    constructor(config?: any);
    loadSource(src: string): void;
    attachMedia(media: HTMLMediaElement): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
    startLoad(): void;
    recoverMediaError(): void;
    levels: any[];
    currentLevel: number;
  }
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Supabase types
declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    auth: any;
    from: (table: string) => any;
    channel: (name: string) => any;
    removeChannel: (channel: any) => void;
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}

export {};
