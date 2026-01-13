import { FastifyRequest, FastifyReply } from 'fastify';
import { clientService } from '../services/client.service';
import { CreateClientInput, UpdateClientInput } from '../schemas/client.schema';

export const clientController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clients = await clientService.findAll();
      return reply.send(clients);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch clients',
      });
    }
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const client = await clientService.findById(request.params.id);
      if (!client) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Client not found',
        });
      }
      return reply.send(client);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch client',
      });
    }
  },

  async create(
    request: FastifyRequest<{ Body: CreateClientInput }>,
    reply: FastifyReply
  ) {
    try {
      const existingClient = await clientService.findByTin(request.body.tin);
      if (existingClient) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Client with this TIN already exists',
        });
      }

      const client = await clientService.create(request.body);
      return reply.status(201).send(client);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create client',
      });
    }
  },

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateClientInput }>,
    reply: FastifyReply
  ) {
    try {
      const client = await clientService.update(request.params.id, request.body);
      if (!client) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Client not found',
        });
      }
      return reply.send(client);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update client',
      });
    }
  },

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const deleted = await clientService.delete(request.params.id);
      if (!deleted) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Client not found',
        });
      }
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete client',
      });
    }
  },
};
