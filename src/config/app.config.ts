import { config } from 'dotenv';
import * as joi from 'joi';
config();

interface EnvVars {
  PORT: number;
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_REGION: string;
  AWS_S3_BUCKET: string;
  AWS_S3_BASE_FOLDER: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    RABBITMQ_URL: joi.string().required(),
    RABBITMQ_QUEUE: joi.string().required(),
    AWS_ACCESS_KEY_ID: joi.string().required(),
    AWS_SECRET_ACCESS_KEY: joi.string().required(),
    AWS_S3_REGION: joi.string().required(),
    AWS_S3_BUCKET: joi.string().required(),
    AWS_S3_BASE_FOLDER: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);
if (error) {
  throw new Error(error.message);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  rabbitMqUrl: envVars.RABBITMQ_URL,
  rabbitMqQueue: envVars.RABBITMQ_QUEUE,
  awsAccessKeyId: envVars.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  awsS3Region: envVars.AWS_S3_REGION,
  awsS3Bucket: envVars.AWS_S3_BUCKET,
  awsS3BaseFolder: envVars.AWS_S3_BASE_FOLDER,
};
