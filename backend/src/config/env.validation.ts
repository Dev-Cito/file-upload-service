import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  MINIO_ENDPOINT: Joi.string().optional().default('localhost'),
  MINIO_PORT: Joi.number().optional().default(9000),
  MINIO_ACCESS_KEY: Joi.string().optional().default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().optional().default('minioadmin123'),
  MINIO_BUCKET: Joi.string().optional().default('uploads'),
  MINIO_USE_SSL: Joi.string().optional().default('false'),
  SUPABASE_URL: Joi.string().optional(),
  SUPABASE_SERVICE_KEY: Joi.string().optional(),
  SUPABASE_BUCKET: Joi.string().optional().default('uploads'),
  STORAGE_PROVIDER: Joi.string().valid('minio', 'supabase').default('minio'),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
});