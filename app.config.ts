import 'dotenv/config';

export default {
  expo: {
    name: "Gym Junkie",
    slug: "gym-junkie",
    version: "1.0.0",
    orientation: "portrait",
    android: {
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      package: "com.moates.gymjunkie"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      useReal: process.env.USE_REAL,
      "eas": {
        "projectId": "1a09967a-b075-4243-9269-a14a1d0e4d8c"
      }
    },
  },
};