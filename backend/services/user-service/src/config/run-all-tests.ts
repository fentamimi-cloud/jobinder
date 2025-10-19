import { spawn } from 'child_process';
import { logger } from '../../../../shared/utils/logger';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const tests = [
  {
    name: 'Database Connection',
    file: 'src/config/test-db-connection.ts',
  },
  {
    name: 'UserRepository',
    file: 'src/repositories/test-user-repository.ts',
  },
  {
    name: 'JobSeekerRepository',
    file: 'src/repositories/test-job-seeker-repository.ts',
  },
  {
    name: 'EmployerRepository',
    file: 'src/repositories/test-employer-repository.ts',
  },
];

async function runTest(testFile: string): Promise<{ passed: boolean; duration: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const testProcess = spawn('npx', ['ts-node', testFile], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    testProcess.on('close', (code) => {
      const duration = Date.now() - startTime;
      if (code === 0) {
        resolve({ passed: true, duration });
      } else {
        resolve({ passed: false, duration, error: `Process exited with code ${code}` });
      }
    });

    testProcess.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({ passed: false, duration, error: error.message });
    });
  });
}

async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 RUNNING ALL REPOSITORY TESTS');
  console.log('='.repeat(70) + '\n');

  const results: TestResult[] = [];
  const overallStartTime = Date.now();

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    if (!test) continue;
    
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📋 Test ${i + 1}/${tests.length}: ${test.name}`);
    console.log(`${'─'.repeat(70)}\n`);

    const result = await runTest(test.file);
    
    const testResult: TestResult = {
      name: test.name,
      passed: result.passed,
      duration: result.duration,
    };
    
    if (result.error) {
      testResult.error = result.error;
    }
    
    results.push(testResult);

    if (!result.passed) {
      console.log(`\n❌ ${test.name} FAILED\n`);
    } else {
      console.log(`\n✅ ${test.name} PASSED (${result.duration}ms)\n`);
    }
  }

  const overallDuration = Date.now() - overallStartTime;

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70) + '\n');

  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = `${result.duration}ms`;
    console.log(`${index + 1}. ${status} - ${result.name.padEnd(30)} (${duration})`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '─'.repeat(70));
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
  console.log(`Total Duration: ${overallDuration}ms`);
  console.log('─'.repeat(70) + '\n');

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! 🎉\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  logger.error('Error running tests:', error);
  process.exit(1);
});

