import Fastify from 'fastify';
import fastifyEnv from 'fastify-env';
import fastifySwagger from 'fastify-swagger';
import carRoutes from './routes/cars.js';

const configSchema = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: { type: 'string' },
    PGUSER: { type: 'string' },
    PGHOST: { type: 'string' },
    PGPASSWORD: { type: 'string' },
    PGDATABASE: { type: 'string' },
    PGPORT: { type: 'string' },
  },
};

function buildFastify(opts = {}) {
  const app = Fastify(opts);

  app.register(fastifyEnv, {
    schema: configSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: '/documentation',
    swagger: {
      info: { title: 'fastify-api' },
    },
  });

  app.register(carRoutes);

  return app;
}

export { buildFastify };
