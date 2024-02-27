import path from 'path';
import dotenv from 'dotenv-safe';

dotenv.config({
    path: path.join(__dirname, '../../.env'),
    sample: path.join(__dirname, '../../.env.example'),
});

export const APP_NAME: string = process.env.APP_NAME || 'demo_app';
export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const LOG_LEVEL: string = process.env.LOG_LEVEL || 'debug';
export const LOG_OUTPUT_JSON: boolean = process.env.LOG_OUTPUT_JSON === '1';

export const PORT: number = parseInt(process.env.PORT, 10) || 3000;

export const MONGODB_URI: string = process.env.MONGODB_URI;

// KAFKA
export const KAFKA_BROKERS: string[] = process.env.KAFKA_BROKERS.split(',').filter((key) => key.trim() !== '');

export const REDIS_URI: string = process.env.REDIS_URI;

export const SERVICE_API_KEYS: string[] = process.env.SERVICE_API_KEYS?.split(',').filter((key) => key.trim() !== '');

export const JWT_PRIVATE_KEY: string = process.env.JWT_PRIVATE_KEY;
export const JWT_PUBLIC_KEY: string = process.env.JWT_PUBLIC_KEY;
export const JWT_EXPIRES_IN: number = parseInt(process.env.JWT_EXPIRES_IN, 10) || 300;

export const RUN_IN_LOCALHOST: boolean = process.env.RUN_IN_LOCALHOST === '1';
