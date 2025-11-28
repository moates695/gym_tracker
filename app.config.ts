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
      version: "1.0.0",
      orientation: "portrait",
      userInterfaceStyle: "automatic",
      android: {
        compileSdkVersion: 34,
        targetSdkVersion: 34,
        package: "com.moates.gymjunkie"
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
        "expo-font"
      ]
    },
  }
};