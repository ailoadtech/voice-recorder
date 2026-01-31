#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 * 
 * Run this script to validate your environment configuration:
 * npx tsx scripts/validate-env.ts
 */

import { getEnv, validateEnv } from '../src/lib/env';

console.log('🔍 Validating environment configuration...\n');

try {
  // Load environment
  const env = getEnv();
  
  console.log('✅ Environment variables loaded successfully\n');
  
  // Display configuration (hiding sensitive values)
  console.log('📋 Configuration Summary:');
  console.log('─'.repeat(50));
  
  console.log('\n🤖 AI Models:');
  console.log(`  Whisper Model: ${env.whisperModel}`);
  console.log(`  GPT Model: ${env.gptModel}`);
  
  console.log('\n⚙️  Application Settings:');
  console.log(`  Hotkey: ${env.hotkeyCombination}`);
  console.log(`  Environment: ${env.nodeEnv}`);
  
  console.log('\n🔌 API Configuration:');
  console.log(`  Base URL: ${env.openaiApiBaseUrl}`);
  console.log(`  Timeout: ${env.apiTimeout}ms`);
  console.log(`  Max Retries: ${env.apiMaxRetries}`);
  
  console.log('\n💾 Storage:');
  console.log(`  Path: ${env.storagePath}`);
  console.log(`  Max History: ${env.maxHistoryItems}`);
  
  console.log('\n🎤 Audio:');
  console.log(`  Format: ${env.audioFormat}`);
  console.log(`  Bitrate: ${env.audioBitrate}`);
  
  console.log('\n🚀 Features:');
  console.log(`  Auto Enrich: ${env.autoEnrich}`);
  console.log(`  System Tray: ${env.enableSystemTray}`);
  console.log(`  Startup on Boot: ${env.startupOnBoot}`);
  console.log(`  Telemetry: ${env.enableTelemetry}`);
  
  console.log('\n🐛 Development:');
  console.log(`  Debug: ${env.debug}`);
  console.log(`  Log Level: ${env.logLevel}`);
  
  console.log('\n🔐 API Keys:');
  const hasOpenAI = env.openaiApiKey && env.openaiApiKey.length > 0;
  const hasWhisper = env.whisperApiKey && env.whisperApiKey.length > 0;
  const hasGPT = env.gptApiKey && env.gptApiKey.length > 0;
  
  console.log(`  OpenAI API Key: ${hasOpenAI ? '✅ Set' : '❌ Not set'}`);
  if (hasWhisper) console.log(`  Whisper API Key: ✅ Set (separate)`);
  if (hasGPT) console.log(`  GPT API Key: ✅ Set (separate)`);
  
  console.log('\n─'.repeat(50));
  
  // Validate required variables
  console.log('\n🔍 Validating required variables...');
  validateEnv();
  
  console.log('✅ All required environment variables are set!\n');
  console.log('🎉 Environment configuration is valid and ready to use.\n');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Environment validation failed:\n');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  console.error('\n💡 Tips:');
  console.error('  1. Copy .env.example to .env.local');
  console.error('  2. Add your OPENAI_API_KEY to .env.local');
  console.error('  3. Restart the development server\n');
  console.error('📖 See docs/ENVIRONMENT_SETUP.md for detailed instructions.\n');
  
  process.exit(1);
}
