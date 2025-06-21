import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Environment variable validation
const validateEnvironment = () => {
  const requiredVars = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value || value.includes('placeholder'))
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing or placeholder Supabase environment variables: ${missingVars.join(', ')}\n` +
      `   Please set these variables in your .env file for full functionality.`
    );
  }

  return {
    url: requiredVars.SUPABASE_URL || 'https://placeholder.supabase.co',
    serviceKey: requiredVars.SUPABASE_SERVICE_KEY || 'placeholder-service-key',
    anonKey: requiredVars.SUPABASE_ANON_KEY || 'placeholder-key',
    isConfigured: missingVars.length === 0,
  };
};

const config = validateEnvironment();

// Admin client with service key for server-side operations
export const supabaseAdmin: SupabaseClient<Database> = createClient(
  config.url,
  config.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'barangay-backend-admin',
      },
    },
  }
);

// Regular client with anon key for user operations
export const supabase: SupabaseClient<Database> = createClient(
  config.url,
  config.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'barangay-backend-client',
      },
    },
  }
);

// Configuration status
export const supabaseConfig = {
  isConfigured: config.isConfigured,
  url: config.url,
  hasValidUrl: config.url !== 'https://placeholder.supabase.co',
};

// Database types are imported from database.types.ts
