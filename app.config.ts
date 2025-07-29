import 'dotenv/config';

export default {
  expo: {
    name: "Gym Junkie",
    slug: "gym-junkie",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      useReal: process.env.USE_REAL
    },
  },
};