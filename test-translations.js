// Test script to verify translation keys
import fs from 'fs';

// Read the translation files
const enTranslations = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const deTranslations = JSON.parse(fs.readFileSync('src/i18n/locales/de.json', 'utf8'));

// Keys being used in the components
const usedKeys = [
  'auth.verificationCode.title',
  'auth.verificationCode.description',
  'auth.verificationCode.steps.title',
  'auth.verificationCode.steps.step1',
  'auth.verificationCode.steps.step2',
  'auth.verificationCode.steps.step3',
  'auth.verificationCode.close',
  'auth.verificationCode.validating',
  'auth.verificationCode.instructions',
  'auth.verificationCode.resending',
  'auth.verificationCode.resendIn',
  'auth.verificationCode.resend',
  'auth.verificationCode.sentTo'
];

console.log('Checking translation keys...\n');

usedKeys.forEach(key => {
  const keys = key.split('.');
  let enValue = enTranslations;
  let deValue = deTranslations;
  
  for (const k of keys) {
    enValue = enValue?.[k];
    deValue = deValue?.[k];
  }
  
  console.log(`Key: ${key}`);
  console.log(`  EN: ${enValue || 'MISSING'}`);
  console.log(`  DE: ${deValue || 'MISSING'}`);
  console.log('');
});
