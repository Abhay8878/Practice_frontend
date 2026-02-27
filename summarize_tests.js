import fs from 'fs';
const results = JSON.parse(fs.readFileSync('full_results.json', 'utf8'));

console.log(`Total Suites: ${results.numTotalTestSuites}`);
console.log(`Passed Suites: ${results.numPassedTestSuites}`);
console.log(`Failed Suites: ${results.numFailedTestSuites}`);
console.log(`Total Tests: ${results.numTotalTests}`);
console.log(`Passed Tests: ${results.numPassedTests}`);
console.log(`Failed Tests: ${results.numFailedTests}`);

console.log('\nFailed Tests:');
results.testResults.forEach(suite => {
    const fileName = suite.name.split(/[\\/]/).pop();
    suite.assertionResults.forEach(test => {
        if (test.status === 'failed') {
            console.log(`- [${fileName}] ${test.ancestorTitles.join(' > ')} > ${test.title}`);
            console.log(`  Error: ${test.failureMessages[0]?.split('\n')[0]}`);
        }
    });
    if (suite.status === 'failed' && suite.assertionResults.length === 0) {
        console.log(`- [${fileName}] Suite failed (likely no tests or transform error)`);
        console.log(`  Message: ${suite.message}`);
    }
});
