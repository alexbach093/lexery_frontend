// Environment variables helper
// Use this to access env vars with type safety

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
