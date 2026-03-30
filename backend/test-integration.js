/**
 * Integration Test - Frontend to Backend AI Service
 * Tests the complete flow from frontend request to backend response
 */

const aiService = require('./src/service/aiService');

async function testIntegration() {
  console.log('🧪 Testing Frontend-Backend AI Integration\n');
  console.log('=' .repeat(60));

  // Test 1: Python with Easy difficulty
  console.log('\n📝 Test 1: Python + Easy + Random Topic');
  console.log('-'.repeat(60));
  try {
    const result1 = await aiService.generateCodeForPractice('Python', 'Easy', 'Random');
    console.log('✅ Success:', result1.success !== false);
    console.log('📦 Language:', result1.exercise.language);
    console.log('📊 Difficulty:', result1.exercise.difficulty);
    console.log('📄 Code Preview:', result1.exercise.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: C++ with Medium difficulty and custom topic
  console.log('\n📝 Test 2: C++ + Medium + Custom Topic (Binary Search)');
  console.log('-'.repeat(60));
  try {
    const result2 = await aiService.generateCodeForPractice('C++', 'Medium', 'Binary Search');
    console.log('✅ Success:', result2.success !== false);
    console.log('📦 Language:', result2.exercise.language);
    console.log('📊 Difficulty:', result2.exercise.difficulty);
    console.log('🎯 Topic:', result2.exercise.topic);
    console.log('📄 Code Preview:', result2.exercise.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: JavaScript with Hard difficulty
  console.log('\n📝 Test 3: JavaScript + Hard + Random Topic');
  console.log('-'.repeat(60));
  try {
    const result3 = await aiService.generateCodeForPractice('JavaScript', 'Hard', 'Random');
    console.log('✅ Success:', result3.success !== false);
    console.log('📦 Language:', result3.exercise.language);
    console.log('📊 Difficulty:', result3.exercise.difficulty);
    console.log('📄 Code Preview:', result3.exercise.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: CPP variation (should normalize to C++)
  console.log('\n📝 Test 4: CPP (variation) + Easy + Random Topic');
  console.log('-'.repeat(60));
  try {
    const result4 = await aiService.generateCodeForPractice('CPP', 'Easy', 'Random');
    console.log('✅ Success:', result4.success !== false);
    console.log('📦 Language:', result4.exercise.language);
    console.log('🔄 Normalized correctly:', result4.exercise.language === 'C++');
    console.log('📄 Code Preview:', result4.exercise.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 5: Random language and difficulty
  console.log('\n📝 Test 5: Random + Random + Random Topic');
  console.log('-'.repeat(60));
  try {
    const result5 = await aiService.generateCodeForPractice('Random', 'Random', 'Random');
    console.log('✅ Success:', result5.success !== false);
    console.log('📦 Language:', result5.exercise.language);
    console.log('📊 Difficulty:', result5.exercise.difficulty);
    console.log('📄 Code Preview:', result5.exercise.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Integration tests complete!\n');
}

// Run tests
testIntegration().catch(console.error);
