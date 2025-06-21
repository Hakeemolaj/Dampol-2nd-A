// Global type definitions for the frontend application

declare global {
  // Jest globals for test files
  declare const describe: jest.Describe;
  declare const it: jest.It;
  declare const test: jest.It;
  declare const expect: jest.Expect;
  declare const beforeEach: jest.Lifecycle;
  declare const afterEach: jest.Lifecycle;
  declare const beforeAll: jest.Lifecycle;
  declare const afterAll: jest.Lifecycle;

  // Node.js globals
  declare namespace NodeJS {
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

  // Fetch API types
  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal | null;
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
}

// Module declarations for libraries without types
declare module 'hls.js' {
  export default class Hls {
    static isSupported(): boolean;
    constructor(config?: any);
    loadSource(src: string): void;
    attachMedia(media: HTMLMediaElement): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
    levels: any[];
    currentLevel: number;
  }
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
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
