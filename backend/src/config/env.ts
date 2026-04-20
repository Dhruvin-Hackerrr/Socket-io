import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  CLIENT_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

const getEnv = (): EnvConfig => {
  const {
    PORT,
    MONGODB_URI,
    CLIENT_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
  } = process.env;

  if (!MONGODB_URI) throw new Error('MONGODB_URI is required');
  if (!JWT_SECRET) throw new Error('JWT_SECRET is required');

  return {
    PORT: parseInt(PORT || '5000', 10),
    MONGODB_URI,
    CLIENT_URL: CLIENT_URL || 'http://localhost:3000',
    JWT_SECRET,
    JWT_EXPIRES_IN: JWT_EXPIRES_IN || '7d',
    NODE_ENV: (NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };
};

export const env = getEnv();
