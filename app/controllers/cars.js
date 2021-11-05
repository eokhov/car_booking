import { Car } from '../services/cars.js';
import {
  definition,
  defineDateRange,
  getDatesRange,
  getStartAndFinishDay,
  defineTransitionMonth,
  getDaysInMonth,
} from '../../lib.js';

const getCars = async (request, reply) => {
  try {
    const { rows } = await Car.getAll();
    reply.send(rows);
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const checkAvailability = async (request, reply) => {
  const { start_date, finish_date, car_id } = request.query;
  const { startWorkday, finishWorkday } = defineDateRange(
    start_date,
    finish_date,
  );
  if (!startWorkday || !finishWorkday) {
    return reply
      .status(400)
      .send({ status: 'Dates should not fall on a day off' });
  }
  try {
    const { rows } = await Car.check({ start_date, finish_date, car_id });
    if (rows.length) reply.send({ status: 'Сar is not available' });
    else reply.send({ status: 'Сar is available' });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const calculationCost = async (request, reply) => {
  const { start_date, finish_date, car_id } = request.query;
  const dateRange = getDatesRange(start_date, finish_date) + 1;
  try {
    const { rows } = await Car.calculationCost(car_id);
    const cost = rows[0].cost;
    const cost_period = definition(dateRange, cost, rows);
    reply.send({
      car_id,
      cost_period,
      start_date,
      finish_date,
      date_range: dateRange,
      cost,
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const createCarSession = async (request, reply) => {
  const { car_id, cost_period, cost, start_date, finish_date, date_range } =
    request.body;

  const booking_dates = defineTransitionMonth(start_date, finish_date);
  try {
    const result = await Car.createCarSession({
      car_id,
      cost_period,
      cost,
      start_date,
      finish_date,
      date_range,
      booking_dates,
    });
    reply.send(result);
  } catch (error) {
    request.log.error(error);
    await db.query('ROLLBACK');
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const getCarsStat = async (request, reply) => {
  const { car_id, month } = request.query;
  const { firstDay, lastDay } = getStartAndFinishDay(month);
  const countDaysInMonth = getDaysInMonth(month - 1);

  try {
    if (car_id) {
      const { rows } = await Car.getCarStatsByCar(
        car_id,
        firstDay,
        lastDay,
        countDaysInMonth,
      );
      reply.send(rows);
    } else {
      const { rows } = await Car.getCarStats(
        firstDay,
        lastDay,
        countDaysInMonth,
      );
      reply.send(rows);
    }
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

export {
  getCars,
  calculationCost,
  createCarSession,
  getCarsStat,
  checkAvailability,
};
