/**
 * Direct API Test - Tests the API endpoint without frontend
 * Run this to verify the backend API is working correctly
 */

const http = require('http');

function testAPI(language, difficulty, topic) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ language, difficulty, topic });
    const url = `/api/ai/exercise?${params.toString()}`;
    
    console.log(`\n📡 Testing: ${url}`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Backend API Directly');
  console.log('=' .repeat(60));
  console.log('Make sure the backend server is running on port 3000!');
  console.log('Run: cd backend && npm start');
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Python + Easy', language: 'Python', difficulty: 'Easy', topic: 'Random' },
    { name: 'C++ + Medium', language: 'C++', difficulty: 'Medium', topic: 'Random' },
    { name: 'CPP + Easy (variation)', language: 'CPP', difficulty: 'Easy', topic: 'Random' },
    { name: 'JavaScript + Hard + Custom Topic', language: 'JavaScript', difficulty: 'Hard', topic: 'Binary Search' },
  ];

  for (const test of tests) {
    try {
      console.log(`\n📝 Test: ${test.name}`);
      console.log('-'.repeat(60));
      
      const result = await testAPI(test.language, test.difficulty, test.topic);
      
      if (result.status === 200 && result.data.success) {
        console.log('✅ Status:', result.status);
        console.log('✅ Success:', result.data.success);
        console.log('📦 Language:', result.data.data.language);
        console.log('📊 Difficulty:', result.data.data.difficulty);
        console.log('🎯 Topic:', result.data.data.topic);
        console.log('🔄 Fallback:', result.data.fallback || false);
        console.log('📄 Code Preview:', result.data.data.content.substring(0, 80) + '...');
      } else {
        console.log('❌ Test failed!');
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Hint: Backend server is not running!');
        console.log('   Run: cd backend && npm start');
        break;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Tests complete!');
  console.log('\nIf all tests passed, the backend API is working correctly.');
  console.log('Next step: Test the frontend at http://localhost:3000/test-ai.html');
}

// Run tests
runTests().catch(console.error);
