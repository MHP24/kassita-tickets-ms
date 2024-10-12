import { config } from 'dotenv';
import * as joi from 'joi';
config();

interface EnvVars {
  PORT: number;
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    RABBITMQ_URL: joi.string().required(),
    RABBITMQ_QUEUE: joi.string().required(),
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
};
