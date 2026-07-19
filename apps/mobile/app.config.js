const fs = require('fs');
const path = require('path');

const GOOGLE_CLIENT_SUFFIX = '.apps.googleusercontent.com';
const MISSING_IOS_URL_SCHEME = 'com.googleusercontent.apps.missing-ios-client-id';

function readLocalEnvValue(key) {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const line = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) {
    return undefined;
  }

  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^["']|["']$/g, '');
}

function getEnvValue(key) {
  return process.env[key] || readLocalEnvValue(key);
}

function getGoogleIosUrlScheme() {
  const iosClientId = getEnvValue('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');

  if (!iosClientId) {
    return MISSING_IOS_URL_SCHEME;
  }

  return `com.googleusercontent.apps.${iosClientId.replace(GOOGLE_CLIENT_SUFFIX, '')}`;
}

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: getGoogleIosUrlScheme(),
      },
    ],
  ],
});
