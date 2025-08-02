/**
 * Test Script for Multi-Language Email System
 * 
 * This script tests the multi-language email functionality by:
 * 1. Testing email sending with different user languages
 * 2. Verifying template selection and variable replacement
 * 3. Checking language detection and fallback behavior
 */

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_ANON_KEY,
  testEmails: {
    german: 'test-german@example.com',
    english: 'test-english@example.com',
    fallback: 'test-fallback@example.com'
  },
  edgeFunctionUrl: `${SUPABASE_URL}/functions/v1`
};

/**
 * Test user creation with different language preferences
 */
async function createTestUsers() {
  console.log('🔧 Creating test users with different language preferences...');
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);
  
  const testUsers = [
    {
      email: TEST_CONFIG.testEmails.german,
      first_name: 'Hans',
      language: 'de'
    },
    {
      email: TEST_CONFIG.testEmails.english,
      first_name: 'John',
      language: 'en'
    },
    {
      email: TEST_CONFIG.testEmails.fallback,
      first_name: 'Test',
      language: 'fr' // Should fallback to German
    }
  ];
  
  for (const user of testUsers) {
    try {
      // Create user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          email: user.email,
          first_name: user.first_name,
          language: user.language
        });
      
      if (error) {
        console.log(`❌ Error creating user ${user.email}:`, error.message);
      } else {
        console.log(`✅ Created test user: ${user.email} (${user.language})`);
      }
    } catch (error) {
      console.log(`❌ Exception creating user ${user.email}:`, error.message);
    }
  }
}

/**
 * Test email sending with different languages
 */
async function testEmailSending() {
  console.log('\n📧 Testing email sending with different languages...');
  
  const emailTypes = ['welcome', 'checkout-confirmation', 'trial-reminder'];
  const testCases = [
    {
      email: TEST_CONFIG.testEmails.german,
      name: 'Hans',
      expectedLanguage: 'de'
    },
    {
      email: TEST_CONFIG.testEmails.english,
      name: 'John',
      expectedLanguage: 'en'
    },
    {
      email: TEST_CONFIG.testEmails.fallback,
      name: 'Test',
      expectedLanguage: 'de' // Should fallback to German
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing ${testCase.email} (expected: ${testCase.expectedLanguage})`);
    
    for (const emailType of emailTypes) {
      try {
        const response = await fetch(`${TEST_CONFIG.edgeFunctionUrl}/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.supabaseKey}`
          },
          body: JSON.stringify({
            emailType,
            userEmail: testCase.email,
            userName: testCase.name,
            planName: 'Premium',
            trialEndDate: 'in 7 Tagen',
            bypassTestMode: true // Skip test mode for actual testing
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`  ✅ ${emailType}: Sent successfully (${result.userLanguage})`);
          
          // Verify language detection
          if (result.userLanguage === testCase.expectedLanguage) {
            console.log(`    ✅ Language detection correct: ${result.userLanguage}`);
          } else {
            console.log(`    ⚠️  Language detection mismatch: expected ${testCase.expectedLanguage}, got ${result.userLanguage}`);
          }
        } else {
          console.log(`  ❌ ${emailType}: Failed - ${result.error}`);
        }
      } catch (error) {
        console.log(`  ❌ ${emailType}: Exception - ${error.message}`);
      }
    }
  }
}

/**
 * Test template retrieval from database
 */
async function testTemplateRetrieval() {
  console.log('\n🗄️  Testing template retrieval from database...');
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);
  
  const templates = ['welcome', 'checkout-confirmation', 'magic-link'];
  const languages = ['de', 'en'];
  
  for (const template of templates) {
    console.log(`\n📋 Testing template: ${template}`);
    
    for (const language of languages) {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('subject, html_content')
          .eq('template_key', template)
          .eq('language', language)
          .single();
        
        if (error) {
          console.log(`  ❌ ${language}: ${error.message}`);
        } else {
          console.log(`  ✅ ${language}: Template found (subject: ${data.subject.substring(0, 50)}...)`);
        }
      } catch (error) {
        console.log(`  ❌ ${language}: Exception - ${error.message}`);
      }
    }
  }
}

/**
 * Test language preference detection
 */
async function testLanguageDetection() {
  console.log('\n🌍 Testing language preference detection...');
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);
  
  const testEmails = [
    TEST_CONFIG.testEmails.german,
    TEST_CONFIG.testEmails.english,
    TEST_CONFIG.testEmails.fallback,
    'non-existent@example.com'
  ];
  
  for (const email of testEmails) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('language')
        .eq('email', email)
        .single();
      
      if (error) {
        console.log(`  ❌ ${email}: ${error.message}`);
      } else {
        const language = data?.language || 'de';
        console.log(`  ✅ ${email}: ${language}`);
      }
    } catch (error) {
      console.log(`  ❌ ${email}: Exception - ${error.message}`);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Multi-Language Email System Tests\n');
  
  try {
    // Test 1: Create test users
    await createTestUsers();
    
    // Test 2: Test template retrieval
    await testTemplateRetrieval();
    
    // Test 3: Test language detection
    await testLanguageDetection();
    
    // Test 4: Test email sending
    await testEmailSending();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

/**
 * Configuration validation
 */
function validateConfig() {
  const required = ['supabaseUrl', 'supabaseKey'];
  const missing = required.filter(key => !TEST_CONFIG[key] || TEST_CONFIG[key].includes('your-'));
  
  if (missing.length > 0) {
    console.error('❌ Missing or invalid configuration:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease update TEST_CONFIG in this file with your actual Supabase credentials.');
    return false;
  }
  
  return true;
}

// Main execution
if (validateConfig()) {
  runAllTests();
} else {
  console.log('\n📝 Usage:');
  console.log('1. Update TEST_CONFIG with your Supabase credentials');
  console.log('2. Run: node test-multi-language-emails.js');
  console.log('3. Check the console output for test results');
}

module.exports = {
  createTestUsers,
  testEmailSending,
  testTemplateRetrieval,
  testLanguageDetection,
  runAllTests
}; 