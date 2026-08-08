import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

const config: CapacitorConfig = {
  appId: 'com.app.worldo',
  appName: 'Worldo',
  webDir: '.next',
  server: {
    url: process.env.CAPACITOR_SERVER_URL,
    androidScheme: 'http',
    iosScheme: 'http',
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
