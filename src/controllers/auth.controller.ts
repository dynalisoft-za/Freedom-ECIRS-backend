import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';

export const authController = {
  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    try {
      const { username, password } = request.body;

      const user = await authService.verifyPassword(username, password);
      if (!user) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid username or password',
        });
      }

      if (user.status !== 'active') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Account is inactive',
        });
      }

      const payload = authService.userToJWTPayload(user);
      const token = request.server.jwt.sign(payload);

      return reply.send({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          station_codes: user.station_codes,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process login',
      });
    }
  },

  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ) {
    try {
      const existingUser = await authService.findByUsername(
        request.body.username
      );
      if (existingUser) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Username already exists',
        });
      }

      const user = await authService.register(request.body);

      return reply.status(201).send({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        station_codes: user.station_codes,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to register user',
      });
    }
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const user = await authService.findById(request.user.userId);
      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.send({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        station_codes: user.station_codes,
        status: user.status,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch user data',
      });
    }
  },
};
