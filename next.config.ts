import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Enable static exports for desktop app
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Production optimizations
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    removeConsole: isProd ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@tauri-apps/api',
      '@tauri-apps/plugin-global-shortcut',
    ],
  },
  
  // Configure base path if needed for Tauri
  // basePath: '',
  
  // Disable server-side features for desktop app
  // All rendering will be client-side
  
  // Environment variables configuration
  // Note: For desktop apps, sensitive env vars should be handled by Tauri backend
  // Only expose non-sensitive configuration to the client
  env: {
    WHISPER_MODEL: process.env.WHISPER_MODEL || 'whisper-1',
    GPT_MODEL: process.env.GPT_MODEL || 'gpt-4',
    HOTKEY_COMBINATION: process.env.HOTKEY_COMBINATION || 'CommandOrControl+Shift+R',
    AUDIO_FORMAT: process.env.AUDIO_FORMAT || 'webm',
    AUDIO_BITRATE: process.env.AUDIO_BITRATE || '128000',
    STORAGE_PATH: process.env.STORAGE_PATH || 'recordings',
    MAX_HISTORY_ITEMS: process.env.MAX_HISTORY_ITEMS || '100',
    AUTO_ENRICH: process.env.AUTO_ENRICH || 'false',
    ENABLE_SYSTEM_TRAY: process.env.ENABLE_SYSTEM_TRAY || 'true',
    STARTUP_ON_BOOT: process.env.STARTUP_ON_BOOT || 'false',
    DEBUG: process.env.DEBUG || 'false',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  },
  
  // Webpack configuration for additional optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Tauri-specific chunk
            tauri: {
              name: 'tauri',
              test: /@tauri-apps/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
