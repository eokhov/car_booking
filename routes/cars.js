import {
  getCars,
  calculationCost,
  createCarSession,
  getCarsStat,
  checkAvailability,
} from '../controllers/cars.js';

const Car = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    unlock_date: { type: 'string' },
    tarif_id: { type: 'number' },
  },
};

const CarStats = {
  type: 'object',
  properties: {
    car_id: { type: 'number' },
    state_number: { type: 'string' },
    count_days: { type: 'number' },
  },
};

const getCarsOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: Car,
      },
    },
  },
  handler: getCars,
};

const calculationCostOpts = {
  schema: {
    query: {
      type: 'object',
      properties: {
        start_date: { type: 'string' },
        finish_date: { type: 'string' },
        car_id: { type: 'number' },
      },
      required: ['start_date', 'finish_date', 'car_id'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          car_id: { type: 'number' },
          cost_period: { type: 'number' },
          start_date: { type: 'string' },
          finish_date: { type: 'string' },
          date_range: { type: 'number' },
          cost: { type: 'number' },
        },
      },
    },
  },
  handler: calculationCost,
};
const checkAvailabilityOpts = {
  schema: {
    query: {
      type: 'object',
      properties: {
        start_date: { type: 'string' },
        finish_date: { type: 'string' },
        car_id: { type: 'number' },
      },
      required: ['start_date', 'finish_date', 'car_id'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      },
    },
  },
  handler: checkAvailability,
};

const getCarsStatOpts = {
  schema: {
    query: {
      type: 'object',
      properties: {
        car_id: { type: 'number' },
        month: { type: 'number' },
      },
    },
    response: {
      200: {
        type: 'array',
        items: CarStats,
      },
    },
  },
  handler: getCarsStat,
};

const createCarSessionOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        car_id: { type: 'number' },
        cost_period: { type: 'number' },
        start_date: { type: 'string' },
        finish_date: { type: 'string' },
        date_range: { type: 'number' },
        cost: { type: 'number' },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          create: { type: 'string' },
        },
      },
    },
  },
  handler: createCarSession,
};

const carRoutes = (app, options, done) => {
  app.get('/car/calculation', calculationCostOpts);
  app.get('/car/check', checkAvailabilityOpts);
  app.get('/car/stat', getCarsStatOpts);
  app.post('/car/session', createCarSessionOpts);
  app.get('/car', getCarsOpts);

  done();
};

export default carRoutes;
