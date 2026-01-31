#!/usr/bin/env node
/**
 * API Key Validation Script
 * 
 * Validates that API keys are properly configured and can connect to services.
 * Run this script to verify your environment setup before using the app.
 * 
 * Usage: npx tsx scripts/validate-api-keys.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  service: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

const results: ValidationResult[] = [];

/**
 * Check if .env.local file exists
 */
function checkEnvFile(): boolean {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    results.push({
      service: 'Environment File',
      status: 'error',
      message: '.env.local file not found. Copy .env.example to .env.local and add your API keys.',
    });
    return false;
  }
  
  results.push({
    service: 'Environment File',
    status: 'success',
    message: '.env.local file found',
  });
  return true;
}

/**
 * Load environment variables from .env.local
 */
function loadEnvVars(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const vars: Record<string, string> = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return vars;
}

/**
 * Validate OpenAI API key format
 */
function validateApiKeyFormat(key: string): boolean {
  // OpenAI keys start with 'sk-' and are typically 48+ characters
  return key.startsWith('sk-') && key.length >= 20;
}

/**
 * Check OpenAI API key configuration
 */
function checkOpenAIKey(vars: Record<string, string>): void {
  const apiKey = vars.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === '' || apiKey === 'sk-your-api-key-here') {
    results.push({
      service: 'OpenAI API Key',
      status: 'error',
      message: 'OPENAI_API_KEY not configured. Get your key from https://platform.openai.com/api-keys',
    });
    return;
  }
  
  if (!validateApiKeyFormat(apiKey)) {
    results.push({
      service: 'OpenAI API Key',
      status: 'warning',
      message: 'OPENAI_API_KEY format looks invalid. OpenAI keys should start with "sk-"',
    });
    return;
  }
  
  results.push({
    service: 'OpenAI API Key',
    status: 'success',
    message: 'OPENAI_API_KEY is configured (format looks valid)',
  });
}

/**
 * Test OpenAI API connection
 */
async function testOpenAIConnection(apiKey: string): Promise<void> {
  if (!apiKey || !validateApiKeyFormat(apiKey)) {
    return;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (response.ok) {
      results.push({
        service: 'OpenAI Connection',
        status: 'success',
        message: 'Successfully connected to OpenAI API',
      });
    } else if (response.status === 401) {
      results.push({
        service: 'OpenAI Connection',
        status: 'error',
        message: 'Invalid API key. Please check your OPENAI_API_KEY.',
      });
    } else {
      results.push({
        service: 'OpenAI Connection',
        status: 'warning',
        message: `OpenAI API returned status ${response.status}. Service may be temporarily unavailable.`,
      });
    }
  } catch (error) {
    results.push({
      service: 'OpenAI Connection',
      status: 'warning',
      message: `Could not connect to OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Check model configuration
 */
function checkModelConfig(vars: Record<string, string>): void {
  const whisperModel = vars.WHISPER_MODEL || 'whisper-1';
  const gptModel = vars.GPT_MODEL || 'gpt-4';
  
  results.push({
    service: 'Whisper Model',
    status: 'success',
    message: `Configured to use: ${whisperModel}`,
  });
  
  results.push({
    service: 'GPT Model',
    status: 'success',
    message: `Configured to use: ${gptModel}`,
  });
}

/**
 * Print results in a formatted table
 */
function printResults(): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           API Key Configuration Validation Results            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
    const color = result.status === 'success' ? '\x1b[32m' : result.status === 'warning' ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${icon}${reset} ${result.service}`);
    console.log(`  ${result.message}\n`);
  });
  
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  if (hasErrors) {
    console.log('\x1b[31m✗ Configuration has errors. Please fix them before running the app.\x1b[0m\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\x1b[33m⚠ Configuration has warnings. The app may not work correctly.\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[32m✓ All checks passed! Your API keys are configured correctly.\x1b[0m\n');
    process.exit(0);
  }
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('Validating API key configuration...\n');
  
  // Check if .env.local exists
  if (!checkEnvFile()) {
    printResults();
    return;
  }
  
  // Load environment variables
  const vars = loadEnvVars();
  
  // Validate API keys
  checkOpenAIKey(vars);
  
  // Check model configuration
  checkModelConfig(vars);
  
  // Test API connection (if key is valid)
  const apiKey = vars.OPENAI_API_KEY;
  if (apiKey && validateApiKeyFormat(apiKey)) {
    await testOpenAIConnection(apiKey);
  }
  
  // Print results
  printResults();
}

// Run validation
main().catch(error => {
  console.error('\x1b[31mValidation script failed:\x1b[0m', error);
  process.exit(1);
});
