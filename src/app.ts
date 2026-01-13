import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { config } from './config/env';
import { registerRoutes } from './routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'error',
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register CORS
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Register JWT
  await app.register(jwt, {
    secret: config.jwtSecret,
  });

  // Register multipart for file uploads
  await app.register(multipart);

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Freedom ECIRS API',
        description: 'Electronic Contract Invoice & Receipting System API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await app.register(registerRoutes, { prefix: config.apiPrefix });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if ((error as any).validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: (error as any).message,
        details: (error as any).validation,
      });
    }

    return reply.status((error as any).statusCode || 500).send({
      error: (error as any).name || 'Internal Server Error',
      message: (error as any).message || 'An unexpected error occurred',
    });
  });

  return app;
}
