import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { clientRoutes } from './client.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(clientRoutes, { prefix: '/clients' });
}
