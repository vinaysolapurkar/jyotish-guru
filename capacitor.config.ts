import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "vincom.jyotishguru.app",
  appName: "Jyotish Guru",
  webDir: "out",
  server: {
    url: "https://astro-xi-eight.vercel.app/login",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [
      "astro-xi-eight.vercel.app",
      "*.vercel.app",
      "api.deepseek.com",
      "nominatim.openstreetmap.org",
      "images.unsplash.com",
      "randomuser.me",
      "api.telegram.org",
      "t.me",
      "www.paypal.com",
    ],
  },
  android: {
    backgroundColor: "#F8F3E8",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#F8F3E8",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#F8F3E8",
    },
  },
};

export default config;
