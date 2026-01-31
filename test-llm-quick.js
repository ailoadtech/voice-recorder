// Quick test to verify LLM service changes
const { execSync } = require('child_process');

try {
  console.log('Running LLM Service tests...');
  execSync('npx jest src/services/llm/LLMService.test.ts --testTimeout=5000 --bail', {
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('\n✅ LLMService tests passed!');
} catch (error) {
  console.error('\n❌ LLMService tests failed');
  process.exit(1);
}
