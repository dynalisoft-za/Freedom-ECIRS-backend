import { FastifyInstance } from 'fastify';
import { clientController } from '../controllers/client.controller';
import { authenticate, authorize } from '../middleware/auth';

export async function clientRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', clientController.getAll);

  fastify.get('/:id', clientController.getById);

  fastify.post('/', {
    preHandler: authorize(['super_admin', 'station_manager', 'sales_executive']),
    handler: clientController.create,
  });

  fastify.put('/:id', {
    preHandler: authorize(['super_admin', 'station_manager', 'sales_executive']),
    handler: clientController.update,
  });

  fastify.delete('/:id', {
    preHandler: authorize(['super_admin', 'station_manager']),
    handler: clientController.delete,
  });
}
