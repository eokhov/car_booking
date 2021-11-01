import db from '../db.js';
import {
  definition,
  defineDateRange,
  addDays,
  getStartAndFinishDay,
} from '../lib.js';

const getCars = async (request, reply) => {
  const [toDay] = new Date().toISOString().split('T');
  try {
    const { rows } = await db.query('SELECT * FROM car WHERE unlock_date<=$1', [
      toDay,
    ]);
    reply.send(rows);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const calculationCost = async (request, reply) => {
  const { start_date, finish_date, car_id } = request.query;
  const { dateRange, startWorkday, finishWorkday } = defineDateRange(
    start_date,
    finish_date
  );
  if (!startWorkday || !finishWorkday) {
    return reply
      .status(400)
      .send({ error: 'Dates should not fall on a day off' });
  }

  try {
    const { rows } = await db.query(
      `SELECT c.id, t.cost, d.size AS discount_size 
        FROM car c LEFT JOIN tarif t ON t.id=c.tarif_id 
        LEFT JOIN discount_plan dp ON dp.tarif_id=c.tarif_id 
        LEFT JOIN discount d ON d.id=dp.discount_id WHERE c.id=$1;`,
      [car_id]
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

  const unlockDate = addDays(finish_date, 3);
  try {
    await db.query('BEGIN');
    await db.query(
      `INSERT INTO car_session
      (car_id, cost_period, cost, start_date, finish_date, date_range)
      values($1, $2, $3, $4, $5, $6)`,
      [car_id, cost_period, cost, start_date, finish_date, date_range]
    );
    await db.query('UPDATE car SET unlock_date=$1 WHERE id=$2', [
      unlockDate,
      car_id,
    ]);
    await db.query('COMMIT');
    reply.send({ create: 'OK' });
  } catch (error) {
    console.log(error);
    await db.query('ROLLBACK');
    reply.status(500).send({ error: 'Internal server Error' });
  }
};

const getCarsStat = async (request, reply) => {
  const { car_id } = request.query;
  const { firstDay, lastDay } = getStartAndFinishDay();
  if (car_id) {
    try {
      const { rows } = await db.query(
        `SELECT c.id AS car_id, c.state_number, SUM(cs.date_range) AS count_days
        FROM car c LEFT JOIN car_session cs 
        ON cs.car_id = c.id WHERE c.id=$1 
        AND cs.created_at >= $2 AND cs.created_at <= $3 GROUP BY c.id;`,
        [car_id, firstDay, lastDay]
      );
      reply.send(rows);
    } catch (error) {
      console.log(error);
      reply.status(500).send({ error: 'Internal server Error' });
    }
  }
};

export { getCars, calculationCost, createCarSession, getCarsStat };
