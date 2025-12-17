import 'dotenv/config';
import { config as loadEnv } from "dotenv";
import path from "path";

const envFile = process.env.ENVFILE || './envs/.env.dev'; 
loadEnv({ path: path.resolve(process.cwd(), envFile) });

export default ({ config }: any) => {
  return {
    ...config,
    expo: {
      name: "Gym Junkie",
      slug: "gym-junkie",
      version: "0.0.4",
      orientation: "portrait",
      icon: "./assets/images/android_icon.png",
      userInterfaceStyle: "automatic",
      android: {
        versionCode: 4,
        icon: "./assets/images/android_icon.png",
        compileSdkVersion: 34,
        targetSdkVersion: 34,
        package: "com.moates.gymjunkie",
        adaptiveIcon: {
          foregroundImage: "./assets/images/android_icon.png",
          backgroundColor: "#000000"
        },
        displayName: "Gym Junkie"
      },
      extra: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        apiTimeoutMs: process.env.EXPO_API_TIMEOUT_MS,
        "eas": {
          "projectId": "1a09967a-b075-4243-9269-a14a1d0e4d8c"
        }
      },
      owner: "moates",
      plugins: [
        "expo-asset",
        "expo-font",
        [
          "expo-splash-screen",
          {
            "backgroundColor": "#ffffff",
            "image": "./assets/images/ios_icon.png",
            "dark": {
              "image": "./assets/images/ios_icon.png",
              "backgroundColor": "#181818ff"
            },
            "imageWidth": 200
          }
        ]
      ]
    },
  }
};