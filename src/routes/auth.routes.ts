import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', authController.login);

  fastify.post('/register', authController.register);

  fastify.get('/me', {
    preHandler: authenticate,
    handler: authController.me,
  });
}
