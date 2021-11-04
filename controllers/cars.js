import db from '../db.js';
import {
  definition,
  defineDateRange,
  addDays,
  getDatesRange,
  getStartAndFinishDay,
  defineTransitionMonth,
  getDaysInMonth,
} from '../lib.js';

const getCars = async (request, reply) => {
  try {
    const { rows } = await db.query('SELECT * FROM car');
    reply.send(rows);
  } catch (error) {
    console.log(error);
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
    const { rows } = await db.query(
      `SELECT * FROM car_session cs
      WHERE (
        $1 between cs.start_date and cs.finish_date
        OR
        $2 between cs.start_date and cs.finish_date
      ) AND cs.car_id=$3 LIMIT 1`,
      [start_date, finish_date, car_id],
    );
    if (rows.length) reply.send({ status: 'Сar is not available' });
    else reply.send({ status: 'Сar is available' });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const calculationCost = async (request, reply) => {
  const { start_date, finish_date, car_id } = request.query;

  const dateRange = getDatesRange(start_date, finish_date) + 1;

  try {
    const { rows } = await db.query(
      `SELECT c.id, t.cost, d.size AS discount_size 
        FROM car c LEFT JOIN tarif t ON t.id=c.tarif_id 
        LEFT JOIN discount_plan dp ON dp.tarif_id=c.tarif_id 
        LEFT JOIN discount d ON d.id=dp.discount_id WHERE c.id=$1;`,
      [car_id],
    );

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
    console.log(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const createCarSession = async (request, reply) => {
  const { car_id, cost_period, cost, start_date, finish_date, date_range } =
    request.body;

  const bookingDates = defineTransitionMonth(start_date, finish_date);
  try {
    await db.query('BEGIN');
    await db.query(
      `INSERT INTO car_session
      (car_id, cost_period, cost, start_date, finish_date, date_range, type)
      values($1, $2, $3, $4, $5, $6, $7)`,
      [
        car_id,
        cost_period,
        cost,
        start_date,
        finish_date,
        date_range,
        'booking',
      ],
    );
    await db.query(
      `INSERT INTO car_session
      (car_id, cost_period, cost, start_date, finish_date, date_range, type)
      values($1, $2, $3, $4, $5, $6, $7)`,
      [
        car_id,
        0,
        0,
        addDays(finish_date, 1),
        addDays(finish_date, 3),
        3,
        'serice',
      ],
    );
    for (const dates of bookingDates) {
      await db.query(
        `INSERT INTO booking_stats
        (car_id, start_date, finish_date, date_range)
        values($1, $2, $3, $4)`,
        [car_id, dates.firstDate, dates.lastDate, dates.range],
      );
    }
    await db.query('COMMIT');
    reply.send({ create: 'OK' });
  } catch (error) {
    console.log(error);
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
      const { rows } = await db.query(
        `SELECT c.id AS car_id, c.state_number, 
      CEIL(AVG(date_range)::decimal / $1 * 100) AS usage_percent
      FROM car c LEFT JOIN booking_stats bs 
      ON bs.car_id = c.id WHERE c.id=$2 
      AND bs.start_date >= $3 AND bs.finish_date <= $4 GROUP BY c.id;`,
        [countDaysInMonth, car_id, firstDay, lastDay],
      );
      reply.send(rows);
    } else {
      const { rows } = await db.query(
        `SELECT c.id AS car_id, c.state_number, 
      CEIL(AVG(date_range)::decimal / $1 * 100) AS usage_percent
      FROM car c LEFT JOIN booking_stats bs 
      ON bs.car_id = c.id  
      AND bs.start_date >= $2 AND bs.finish_date <= $3 GROUP BY c.id;`,
        [countDaysInMonth, firstDay, lastDay],
      );
      reply.send(rows);
    }
  } catch (error) {
    console.log(error);
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
