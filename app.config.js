const app = require('./app.json').expo;

const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
const plugins = [...app.plugins];
if (iosUrlScheme) {
  if (!iosUrlScheme.startsWith('com.googleusercontent.apps.')) {
    throw new Error('GOOGLE_IOS_URL_SCHEME must be the reversed iOS OAuth client ID.');
  }
  plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme }]);
}

module.exports = { expo: { ...app, plugins } };
