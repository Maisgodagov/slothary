export interface Environment {
  apiUrl: string;
}

const FALLBACK_API_URL = 'https://api.slothary.ru/api';

export const env: Environment = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL,
};
