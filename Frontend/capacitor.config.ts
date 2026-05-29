import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.targetcoachingclasses',
  appName: 'Target Coaching Classes',
  webDir: 'dist',

  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;